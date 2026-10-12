"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  ArrowDownToLine, CheckCircle2, ChevronDown, CircleDollarSign, Clock3,
  Filter, LogOut, MessageCircle, RefreshCw, Search, ShieldCheck, Users, X,
} from "lucide-react";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  payment_method: string;
  initial_budget: string;
  monthly_budget: string;
  purpose: string;
  knows_zone: string;
  purchase_timing: string;
  visit_availability: string;
  preferred_years: string;
  consent: boolean;
  source: string;
  status: "nuevo" | "contactado" | "cita_agendada" | "seguimiento" | "descartado";
};

const statuses: { value: Lead["status"]; label: string }[] = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "cita_agendada", label: "Cita agendada" },
  { value: "seguimiento", label: "Seguimiento" },
  { value: "descartado", label: "Descartado" },
];

const labels: Record<string, string> = {
  cash: "Al contado", financing: "Financiación directa", bank: "Crédito bancario", undecided: "Estoy evaluando opciones",
  under1500: "Menos de US$ 1.500", "1500-5000": "US$ 1.500 a US$ 5.000",
  "5000-10000": "US$ 5.000 a US$ 10.000", over10000: "Más de US$ 10.000", saving: "Todavía estoy ahorrando",
  under200: "Menos de US$ 200", "200-350": "US$ 200 a US$ 350", "350-500": "US$ 350 a US$ 500",
  over500: "Más de US$ 500", home: "Construir mi casa", investment: "Invertir",
  family: "Comprar para mi familia", other: "Otro objetivo", yes: "Sí, la conozco",
  somewhat: "La conozco de referencia", no: "Necesito conocer la ubicación", now: "Lo antes posible",
  "30days": "Dentro de 30 días", "90days": "En 1 a 3 meses", later: "Más adelante",
  weekday: "Durante la semana", weekend: "El fin de semana", flexible: "Tengo flexibilidad",
};

function pretty(key: string | null | undefined) {
  if (!key) return "Sin respuesta";
  if (key === "undecided") return "Quiero que me asesoren";
  if (/^\d+$/.test(key)) return key + (key === "1" ? " año" : " años");
  return labels[key] || key;
}

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("es-BO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function makeSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export default function AdminPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionToken, setSessionToken] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [updatingId, setUpdatingId] = useState("");

  useEffect(() => {
    const client = makeSupabase();
    setSupabase(client);
    if (!client) {
      setError("Falta configurar la clave pública de Supabase en Vercel.");
      setAuthLoading(false);
      return;
    }
    client.auth.getSession().then(({ data }) => {
      const session = data.session;
      if (session) {
        setSessionToken(session.access_token);
        setLoggedInEmail(session.user.email || "");
      }
      setAuthLoading(false);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setSessionToken(session?.access_token || "");
      setLoggedInEmail(session?.user.email || "");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadLeads = useCallback(async (token: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/leads", {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (response.status === 403) {
        await supabase?.auth.signOut();
        setSessionToken("");
        setLoggedInEmail("");
        throw new Error("Este usuario no está autorizado para ingresar al panel.");
      }
      if (response.status === 401) {
        await supabase?.auth.signOut();
        setSessionToken("");
        setLoggedInEmail("");
        throw new Error("La sesión venció. Iniciá sesión nuevamente.");
      }
      if (!response.ok) throw new Error(result.error || "No pudimos cargar los leads.");
      setLeads(result.leads || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionToken) void loadLeads(sessionToken);
    else setLeads([]);
  }, [sessionToken, loadLeads]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError || !data.session) {
      setError("No pudimos iniciar sesión. Revisá el correo y la contraseña.");
      return;
    }
    setPassword("");
    setSessionToken(data.session.access_token);
    setLoggedInEmail(data.user.email || email);
  }

  async function signOut() {
    await supabase?.auth.signOut();
    setSessionToken("");
    setLoggedInEmail("");
    setLeads([]);
    setSelected(null);
  }

  async function updateStatus(lead: Lead, status: Lead["status"]) {
    setUpdatingId(lead.id);
    setError("");
    try {
      const response = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ id: lead.id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No pudimos actualizar el estado.");
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status } : item));
      setSelected((current) => current?.id === lead.id ? { ...current, status } : current);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos actualizar el estado.");
    } finally {
      setUpdatingId("");
    }
  }

  const filteredLeads = useMemo(() => {
    const term = query.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "todos" || lead.status === statusFilter;
      const matchesTerm = !term || [lead.name, lead.phone, lead.payment_method, lead.initial_budget, lead.purpose]
        .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesStatus && matchesTerm;
    });
  }, [leads, query, statusFilter]);

  function exportCsv() {
    const headings = ["Fecha", "Nombre", "WhatsApp", "Estado", "Forma de pago", "Presupuesto inicial", "Cuota mensual", "Plazo", "Objetivo", "Zona", "Compra", "Visita"];
    const rows = filteredLeads.map((lead) => [
      dateLabel(lead.created_at), lead.name, lead.phone, statuses.find((s) => s.value === lead.status)?.label,
      pretty(lead.payment_method), pretty(lead.initial_budget), pretty(lead.monthly_budget),
      pretty(lead.preferred_years), pretty(lead.purpose), pretty(lead.knows_zone),
      pretty(lead.purchase_timing), pretty(lead.visit_availability),
    ]);
    const csv = [headings, ...rows].map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "leads-campos-del-este.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (authLoading) return <main className="admin-shell admin-loading"><div className="admin-spinner"/><p>Verificando acceso seguro…</p></main>;

  if (!sessionToken) return <main className="admin-shell admin-login-wrap">
    <section className="admin-login-card">
      <div className="admin-brand-mark">CE</div>
      <span className="admin-eyebrow">CAMPOS DEL ESTE · FASE III</span>
      <h1>Panel comercial</h1>
      <p className="admin-subtitle">Ingresá con tu cuenta autorizada para consultar y gestionar los leads.</p>
      <form onSubmit={signIn} className="admin-login-form">
        <label>Correo electrónico<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu correo de acceso"/></label>
        <label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña"/></label>
        {error && <p className="admin-error" role="alert">{error}</p>}
        <button className="admin-primary" type="submit" disabled={loading}>{loading ? "Ingresando…" : "Iniciar sesión"}</button>
      </form>
      <p className="admin-login-foot"><ShieldCheck size={15}/> Acceso privado y restringido.</p>
    </section>
  </main>;

  const newCount = leads.filter((lead) => lead.status === "nuevo").length;
  const contactedCount = leads.filter((lead) => lead.status === "contactado").length;
  const appointmentsCount = leads.filter((lead) => lead.status === "cita_agendada").length;
  const followupCount = leads.filter((lead) => lead.status === "seguimiento").length;

  return <main className="admin-shell">
    <header className="admin-topbar"><a href="/" className="admin-wordmark"><span className="admin-brand-mark small">CE</span><span><strong>Campos del Este</strong><small>Panel comercial · Fase III</small></span></a><div className="admin-account"><span>{loggedInEmail}</span><button onClick={signOut} className="admin-logout"><LogOut size={16}/> Salir</button></div></header>
    <div className="admin-content">
      <div className="admin-heading"><div><span className="admin-eyebrow">GESTIÓN COMERCIAL</span><h1>Consultas recibidas</h1><p>Revisá cada interesado y organizá el seguimiento comercial desde un solo lugar.</p></div><button className="admin-secondary" onClick={() => void loadLeads(sessionToken)} disabled={loading}><RefreshCw size={16} className={loading ? "admin-spin" : ""}/> Actualizar</button></div>
      {error && <p className="admin-error admin-error-banner" role="alert">{error}</p>}
      <div className="admin-stats">
        <article><span className="admin-stat-icon"><Users size={19}/></span><p>Total de leads</p><strong>{leads.length}</strong></article>
        <article><span className="admin-stat-icon orange"><Clock3 size={19}/></span><p>Nuevos</p><strong>{newCount}</strong></article>
        <article><span className="admin-stat-icon teal"><CheckCircle2 size={19}/></span><p>Citas agendadas</p><strong>{appointmentsCount}</strong></article>
        <article><span className="admin-stat-icon green"><CircleDollarSign size={19}/></span><p>En seguimiento</p><strong>{followupCount + contactedCount}</strong></article>
      </div>
      <section className="admin-list-card">
        <div className="admin-list-head"><div><h2>Todos los leads</h2><p>{filteredLeads.length} {filteredLeads.length === 1 ? "consulta" : "consultas"} encontradas</p></div><button className="admin-secondary" onClick={exportCsv} disabled={!filteredLeads.length}><ArrowDownToLine size={16}/> Exportar CSV</button></div>
        <div className="admin-filters"><label className="admin-search"><Search size={17}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre, teléfono…"/></label><label className="admin-status-filter"><Filter size={16}/><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="todos">Todos los estados</option>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select><ChevronDown size={15}/></label></div>
        {loading && !leads.length ? <div className="admin-empty"><div className="admin-spinner"/><p>Cargando consultas…</p></div> : !filteredLeads.length ? <div className="admin-empty"><Users size={30}/><strong>No hay consultas para mostrar</strong><p>Cuando alguien complete el formulario, aparecerá acá.</p></div> : <div className="admin-lead-list">
          {filteredLeads.map((lead) => <article className="admin-lead-row" key={lead.id}>
            <button className="admin-lead-main" onClick={() => setSelected(lead)}><span className="admin-avatar">{lead.name.trim().split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase()}</span><span className="admin-lead-name"><strong>{lead.name}</strong><small>{dateLabel(lead.created_at)} · {lead.phone}</small><span className="admin-lead-summary">{pretty(lead.payment_method)} · {pretty(lead.purchase_timing)}</span></span><span className={`admin-status-pill status-${lead.status}`}>{statuses.find((s) => s.value === lead.status)?.label}</span></button>
            <label className="admin-inline-status"><span>Estado</span><select value={lead.status} disabled={updatingId === lead.id} onChange={(event) => void updateStatus(lead, event.target.value as Lead["status"])}>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label>
          </article>)}
        </div>}
      </section>
    </div>
    {selected && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className="admin-detail-modal" role="dialog" aria-modal="true" aria-labelledby="admin-detail-title"><div className="admin-modal-head"><div><span className="admin-eyebrow">PERFIL DEL INTERESADO</span><h2 id="admin-detail-title">{selected.name}</h2><p>{dateLabel(selected.created_at)}</p></div><button className="admin-icon-button" onClick={() => setSelected(null)} aria-label="Cerrar"><X size={20}/></button></div>
      <div className="admin-detail-contact"><div><span>WhatsApp registrado</span><strong>{selected.phone}</strong></div><a href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="admin-whatsapp"><MessageCircle size={17}/> Abrir WhatsApp</a></div>
      <div className="admin-detail-status"><label>Estado comercial<select value={selected.status} disabled={updatingId === selected.id} onChange={(event) => void updateStatus(selected, event.target.value as Lead["status"])}>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label></div>
      <div className="admin-answer-grid">{[
        ["Forma de pago", pretty(selected.payment_method)], ["Presupuesto inicial", pretty(selected.initial_budget)],
        ["Cuota mensual posible", pretty(selected.monthly_budget)], ["Plazo preferido", pretty(selected.preferred_years)],
        ["Objetivo de compra", pretty(selected.purpose)], ["Conoce la zona", pretty(selected.knows_zone)],
        ["Cuándo quiere comprar", pretty(selected.purchase_timing)], ["Disponibilidad para visitar", pretty(selected.visit_availability)],
      ].map(([title,value]) => <div className="admin-answer" key={title}><span>{title}</span><strong>{value}</strong></div>)}</div>
      <p className="admin-detail-foot"><ShieldCheck size={15}/> Consentimiento registrado: {selected.consent ? "Sí" : "No"} · Origen: {selected.source}</p>
      </section></div>}
  </main>;
}
