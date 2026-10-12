import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
const required = ["name","phone","payment_method","initial_budget","monthly_budget","purpose","knows_zone","purchase_timing","visit_availability","preferred_years"] as const;

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
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      return NextResponse.json({ error: "El formulario todavía no está conectado a la base de datos. Volvé a intentarlo más tarde." }, { status: 503 });
    }
    const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
    const { data, error } = await supabase.from("leads").insert({
      name: body.name.trim(),
      phone: body.phone.trim(),
      payment_method: body.payment_method,
      initial_budget: body.initial_budget,
      monthly_budget: body.monthly_budget,
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
    return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "No pudimos procesar la solicitud." }, { status: 400 });
  }
}
