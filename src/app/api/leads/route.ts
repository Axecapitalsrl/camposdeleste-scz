import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
const PIXEL_ID = "3016882181992487";
const required = ["name","phone","payment_method","initial_budget","monthly_budget","purpose","knows_zone","purchase_timing","visit_availability","preferred_years"] as const;

function sha256(value: string) {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function getCookie(request: Request, name: string) {
  const cookies = request.headers.get("cookie") ?? "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}

async function sendMetaLeadEvent(request: Request, lead: { id: string; name: string; phone: string }) {
  const token = process.env.META_CONVERSIONS_API_TOKEN;
  if (!token) {
    console.warn("Meta Conversions API skipped: META_CONVERSIONS_API_TOKEN is not configured.");
    return;
  }

  const nameParts = lead.name.trim().split(/\\s+/);
  const phone = lead.phone.replace(/[^0-9]/g, "");
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim();
  const userAgent = request.headers.get("user-agent") ?? undefined;
  const url = request.headers.get("referer") ?? "https://camposdeleste-scz.vercel.app/";
  const fbp = getCookie(request, "_fbp");
  const fbc = getCookie(request, "_fbc");

  const userData: Record<string, unknown> = {
    ph: [sha256(phone)],
    fn: [sha256(nameParts[0])],
    external_id: [sha256(lead.id)],
  };
  if (nameParts.length > 1) userData.ln = [sha256(nameParts.slice(1).join(" "))];
  if (clientIp) userData.client_ip_address = clientIp;
  if (userAgent) userData.client_user_agent = userAgent;
  if (fbp) userData.fbp = fbp;
  if (fbc) userData.fbc = fbc;

  const event: Record<string, unknown> = {
    event_name: "Lead",
    event_time: Math.floor(Date.now() / 1000),
    event_id: lead.id,
    action_source: "website",
    event_source_url: url,
    user_data: userData,
    custom_data: { content_name: "Consulta Campos del Este Fase III" },
  };

  const testEventCode = process.env.META_TEST_EVENT_CODE;
  const payload: Record<string, unknown> = { data: [event] };
  if (testEventCode) payload.test_event_code = testEventCode;

  try {
    const response = await fetch(`https://graph.facebook.com/v23.0/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (!response.ok) {
      const details = await response.text();
      console.error("Meta Conversions API Lead event failed:", response.status, details.slice(0, 1000));
    }
  } catch (error) {
    console.error("Meta Conversions API request failed:", error);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const website = typeof body.website === "string" ? body.website : "";
    if (website) return NextResponse.json({ ok: true });
    const startedAt = Number(body.started_at);
    if (Number.isFinite(startedAt) && Date.now() - startedAt < 1800) {
      return NextResponse.json({ error: "Por favor, revisá los datos e intentá nuevamente." }, { status: 400 });
    }
    for (const key of required) {
      if (typeof body[key] !== "string" || !body[key].trim()) {
        return NextResponse.json({ error: "Faltan respuestas obligatorias en el formulario." }, { status: 400 });
      }
    }
    if (typeof body.name !== "string" || body.name.trim().length < 2 || body.name.length > 120) {
      return NextResponse.json({ error: "Ingresá un nombre válido." }, { status: 400 });
    }
    if (typeof body.phone !== "string" || body.phone.trim().length < 6 || body.phone.length > 40) {
      return NextResponse.json({ error: "Ingresá un WhatsApp válido." }, { status: 400 });
    }
    if (body.consent !== true) return NextResponse.json({ error: "Se requiere consentimiento para registrar la consulta." }, { status: 400 });
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: "El formulario todavía no está conectado a la base de datos. Volvé a intentarlo más tarde." }, { status: 503 });
    }
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.from("leads").insert({
      name: body.name.trim(),
      phone: body.phone.trim(),
      payment_method: body.payment_method,
      initial_budget: body.initialBudget,
      monthly_budget: body.monthlyBudget,
      purpose: body.purpose,
      knows_zone: body.knows_zone,
      purchase_timing: body.purchase_timing,
      visit_availability: body.visit_availability,
      preferred_years: body.preferred_years,
      consent: true,
      source: "landing-campos-del-este-fase-iii",
      status: "nuevo",
    }).select("id").single();
    if (error) {
      console.error("Supabase lead insert failed:", error.message);
      return NextResponse.json({ error: "No pudimos registrar tus datos. Probá nuevamente." }, { status: 500 });
    }

    // Track a qualified Lead only after Supabase confirms the lead was saved.
    await sendMetaLeadEvent(request, { id: data.id, name: body.name.trim(), phone: body.phone.trim() });
    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No pudimos procesar la solicitud." }, { status: 400 });
  }
}
