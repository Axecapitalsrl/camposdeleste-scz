"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, LoaderCircle, MessageCircle } from "lucide-react";
import { WHATSAPP_LINK } from "@/lib/constants";

type Answers = {
  name: string; phone: string; payment: string; initialBudget: string; monthlyBudget: string;
  purpose: string; zone: string; timing: string; visit: string; years: string; consent: boolean;
};
const initialAnswers: Answers = {
  name: "", phone: "", payment: "", initialBudget: "", monthlyBudget: "",
  purpose: "", zone: "", timing: "", visit: "", years: "", consent: false,
};
const steps = [
  { title: "¿Cómo te gustaría comprar tu lote?", key: "payment", options: [
    ["cash", "Al contado"], ["financing", "Financiación directa"], ["bank", "Crédito bancario"], ["undecided", "Estoy evaluando opciones"],
  ]},
  { title: "¿Con cuánto contás para la compra o cuota inicial?", key: "initialBudget", options: [
    ["under1500", "Menos de US$ 1.500"], ["1500-5000", "US$ 1.500 a US$ 5.000"], ["5000-10000", "US$ 5.000 a US$ 10.000"], ["over10000", "Más de US$ 10.000"], ["saving", "Todavía estoy ahorrando"],
  ]},
  { title: "¿Qué plazo te interesa?", key: "years", options: [
    ["1", "1 año"], ["2", "2 años"], ["3", "3 años"], ["4", "4 años"], ["5", "5 años"], ["6", "6 años"], ["7", "7 años"], ["8", "8 años"], ["9", "9 años"], ["10", "10 años"], ["undecided", "Quiero que me asesoren"],
  ]},
  { title: "Si elegís financiación, ¿qué cuota mensual podrías afrontar?", key: "monthlyBudget", options: [
    ["under200", "Menos de US$ 200"], ["200-350", "US$ 200 a US$ 350"], ["350-500", "US$ 350 a US$ 500"], ["over500", "Más de US$ 500"], ["cash", "No aplica: compraría al contado"],
  ]},
  { title: "¿Para qué querés adquirir el terreno?", key: "purpose", options: [
    ["home", "Construir mi casa"], ["investment", "Invertir"], ["family", "Comprar para mi familia"], ["other", "Otro objetivo"],
  ]},
  { title: "¿Conocés la zona del proyecto?", key: "zone", options: [
    ["yes", "Sí, la conozco"], ["somewhat", "La conozco de referencia"], ["no", "Necesito conocer la ubicación"],
  ]},
  { title: "¿Cuándo te gustaría concretar la compra?", key: "timing", options: [
    ["now", "Lo antes posible"], ["30days", "Dentro de 30 días"], ["90days", "En 1 a 3 meses"], ["later", "Más adelante"],
  ]},
  { title: "¿Cuándo podrías visitar Campos del Este?", key: "visit", options: [
    ["weekday", "Durante la semana"], ["weekend", "El fin de semana"], ["flexible", "Tengo flexibilidad"], ["later", "Todavía no puedo coordinar"],
  ]},
] as const;

type StepKey = (typeof steps)[number]["key"];

function labelFor(key: string, value: string) {
  const options = steps.find((s) => s.key === key)?.options as readonly (readonly [string,string])[] | undefined;
  return options?.find((o) => o[0] === value)?.[1] ?? value;
}

export default function LeadForm() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [leadId, setLeadId] = useState("");
  const [startedAt] = useState(() => Date.now());

  // Cash buyers skip all financing-specific questions.
  const activeSteps = useMemo(
    () => answers.payment === "cash"
      ? steps.filter((item) => !["initialBudget", "years", "monthlyBudget"].includes(item.key))
      : steps,
    [answers.payment],
  );
  const visibleStep = activeSteps[step];
  const progress = useMemo(() => Math.round(((step + 1) / (activeSteps.length + 1)) * 100), [step, activeSteps.length]);

  const update = (key: keyof Answers, value: string | boolean) => {
    setAnswers((prev) => {
      if (key === "payment" && value === "cash") {
        return { ...prev, payment: "cash", initialBudget: "not_applicable_cash", years: "not_applicable_cash", monthlyBudget: "not_applicable_cash" };
      }
      if (key === "payment" && value !== "cash" && prev.payment === "cash") {
        return { ...prev, payment: String(value), initialBudget: "", years: "", monthlyBudget: "" };
      }
      return { ...prev, [key]: value };
    });
  };

  const canContinue = () => {
    if (!visibleStep) return false;
    return !!answers[visibleStep.key as keyof Answers];
  };

  const saveLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!answers.name.trim() || !answers.phone.trim()) { setError("Completá tu nombre y WhatsApp para continuar."); return; }
    if (!answers.consent) { setError("Necesitamos tu autorización para guardar tus datos y contactarte sobre el proyecto."); return; }
    setBusy(true);
    try {
      const isCash = answers.payment === "cash";
      const response = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: answers.name.trim(),
          phone: answers.phone.trim(),
          payment_method: answers.payment,
          initial_budget: isCash ? "not_applicable_cash" : answers.initialBudget,
          monthly_budget: isCash ? "not_applicable_cash" : answers.monthlyBudget,
          purpose: answers.purpose,
          knows_zone: answers.zone,
          purchase_timing: answers.timing,
          visit_availability: answers.visit,
          preferred_years: isCash ? "not_applicable_cash" : answers.years,
          consent: answers.consent,
          started_at: startedAt,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No pudimos guardar tus datos. Probá nuevamente.");
      setLeadId(result.id ?? "");
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
    } finally { setBusy(false); }
  };

  const whatsappMessage = [
    "Hola, quiero agendar una visita a Campos del Este Fase III.",
    `Nombre: ${answers.name.trim()}`,
    `WhatsApp: ${answers.phone.trim()}`,
    `Forma de pago: ${labelFor("payment", answers.payment)}`,
    answers.payment !== "cash" ? `Presupuesto inicial: ${labelFor("initialBudget", answers.initialBudget)}` : "Presupuesto inicial: No aplica (compra al contado)",
    answers.payment !== "cash" ? `Plazo de interés: ${labelFor("years", answers.years)}` : "",
    answers.payment !== "cash" ? `Cuota mensual: ${labelFor("monthlyBudget", answers.monthlyBudget)}` : "",
    `Objetivo: ${labelFor("purpose", answers.purpose)}`,
    `Conocimiento de la zona: ${labelFor("zone", answers.zone)}`,
    `Plazo de compra: ${labelFor("timing", answers.timing)}`,
    `Disponibilidad para visita: ${labelFor("visit", answers.visit)}`,
    leadId ? `Referencia de consulta: ${leadId}` : "",
  ].filter(Boolean).join("\n");
  const whatsappUrl = `${WHATSAPP_LINK}?text=${encodeURIComponent(whatsappMessage)}`;

  if (saved) {
    return <div className="lead-success">
      <div className="success-icon"><CheckCircle2 size={34} /></div>
      <p className="eyebrow">Formulario completado</p>
      <h3>¡Gracias, {answers.name.split(" ")[0]}!</h3>
      <p>Registramos tus respuestas. Ahora podés abrir WhatsApp para coordinar la visita y consultar la disponibilidad vigente.</p>
      <a className="btn whatsapp-btn" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={19}/> Agendar mi cita por WhatsApp</a>
      <p className="form-privacy">Tus respuestas nos ayudan a orientarte sobre las opciones de compra.</p>
    </div>;
  }

  return <form onSubmit={saveLead} className="lead-form">
    <div className="progress-label"><span>Paso {step + 1} de {activeSteps.length + 1}</span><span>{progress}%</span></div>
    <div className="progress-track"><div style={{ width: `${progress}%` }} /></div>
    {step < activeSteps.length ? <>
      <p className="form-kicker">Conozcamos tu interés</p>
      <h3 className="form-question">{visibleStep.title}</h3>
      <div className="option-list">
        {visibleStep.options.map(([value,label]) => <button type="button" key={value} className={answers[visibleStep.key as keyof Answers] === value ? "option selected" : "option"} onClick={() => update(visibleStep.key as keyof Answers, value)}>
          <span className="option-dot">{answers[visibleStep.key as keyof Answers] === value ? "✓" : ""}</span>{label}
        </button>)}
      </div>
      <div className="form-nav">
        <button type="button" className="btn btn-outline" disabled={step === 0} onClick={() => setStep((s) => Math.max(0,s-1))}><ArrowLeft size={16}/> Atrás</button>
        <button type="button" className="btn" disabled={!canContinue()} onClick={() => setStep((s) => Math.min(s+1, activeSteps.length))}>Continuar <ArrowRight size={16}/></button>
      </div>
    </> : <>
      <p className="form-kicker">Último paso</p>
      <h3 className="form-question">¿Cómo te contactamos?</h3>
      <p className="muted">Dejanos tus datos y después podrás abrir WhatsApp para coordinar la visita.</p>
      <label className="field-label">Nombre y apellido<input autoComplete="name" required maxLength={120} value={answers.name} onChange={(e) => update("name",e.target.value)} placeholder="Tu nombre completo"/></label>
      <label className="field-label">WhatsApp<input autoComplete="tel" required maxLength={40} value={answers.phone} onChange={(e) => update("phone",e.target.value)} placeholder="+591 ..."/></label>
      <label className="consent"><input type="checkbox" checked={answers.consent} onChange={(e) => update("consent",e.target.checked)}/><span>Acepto que Campos del Este guarde estos datos y me contacte sobre el proyecto.</span></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="form-nav">
        <button type="button" className="btn btn-outline" onClick={() => setStep(Math.max(0,activeSteps.length-1))} disabled={busy}><ArrowLeft size={16}/> Atrás</button>
        <button type="submit" className="btn" disabled={busy}>{busy ? <><LoaderCircle size={18} className="spin"/> Guardando…</> : <>Guardar y continuar <ArrowRight size={16}/></>}</button>
      </div>
      <p className="form-privacy">Tus datos se usan para dar seguimiento a tu consulta inmobiliaria.</p>
    </>}
  </form>;
}
