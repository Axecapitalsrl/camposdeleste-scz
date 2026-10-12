import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedStatuses = ["nuevo", "contactado", "cita_agendada", "seguimiento", "descartado"] as const;
type LeadStatus = (typeof allowedStatuses)[number];

function getConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!url || !publicKey || !secretKey || !adminEmail) return null;
  return { url, publicKey, secretKey, adminEmail };
}

async function authorize(request: Request) {
  const config = getConfig();
  if (!config) return { response: NextResponse.json({ error: "Falta configurar el acceso administrativo en el servidor." }, { status: 503 }) };

  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token) return { response: NextResponse.json({ error: "Iniciá sesión para continuar." }, { status: 401 }) };

  const authClient = createClient(config.url, config.publicKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await authClient.auth.getUser(token);
  if (error || !data.user?.email) {
    return { response: NextResponse.json({ error: "Tu sesión venció. Iniciá sesión nuevamente." }, { status: 401 }) };
  }
  if (data.user.email.trim().toLowerCase() !== config.adminEmail) {
    return { response: NextResponse.json({ error: "Este usuario no tiene permiso para ingresar al panel." }, { status: 403 }) };
  }

  const db = createClient(config.url, config.secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return { db };
}

export async function GET(request: Request) {
  const auth = await authorize(request);
  if ("response" in auth) return auth.response;

  const { data, error } = await auth.db
    .from("leads")
    .select("id,created_at,name,phone,payment_method,initial_budget,monthly_budget,purpose,knows_zone,purchase_timing,visit_availability,preferred_years,consent,source,status")
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("Admin leads query failed:", error.message);
    return NextResponse.json({ error: "No pudimos cargar las consultas." }, { status: 500 });
  }
  return NextResponse.json({ leads: data ?? [] }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request) {
  const auth = await authorize(request);
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const id = typeof body.id === "string" ? body.id : "";
    const status = body.status as LeadStatus;
    if (!id || !allowedStatuses.includes(status)) {
      return NextResponse.json({ error: "La consulta o el estado no son válidos." }, { status: 400 });
    }

    const { data, error } = await auth.db
      .from("leads")
      .update({ status })
      .eq("id", id)
      .select("id,status")
      .single();

    if (error) {
      console.error("Admin lead update failed:", error.message);
      return NextResponse.json({ error: "No pudimos actualizar el estado." }, { status: 500 });
    }
    return NextResponse.json({ lead: data });
  } catch {
    return NextResponse.json({ error: "No pudimos procesar la solicitud." }, { status: 400 });
  }
}
