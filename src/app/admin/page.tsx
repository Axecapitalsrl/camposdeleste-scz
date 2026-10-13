"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import {
  Activity, ArrowDownToLine, BarChart3, ChevronLeft, ChevronRight,
  Clock3, LayoutDashboard, LogOut, Menu, MessageCircle, RefreshCw,
  Search, Settings2, ShieldCheck, SlidersHorizontal, Users, X, CalendarCheck, Wallet, Trash2,
} from "lucide-react";
import "./admin.css";

type Lead = {
  id: string; created_at: string; name: string; phone: string; payment_method: string;
  initial_budget: string; monthly_budget: string; purpose: string; knows_zone: string;
  purchase_timing: string; visit_availability: string; preferred_years: string;
  consent: boolean; source: string;
  status: "nuevo" | "contactado" | "cita_agendada" | "seguimiento" | "descartado";
};
type View = "dashboard" | "leads" | "settings";
type WidgetKey = "monthly" | "payments" | "funnel" | "intent" | "budget";

const statuses: { value: Lead["status"]; label: string }[] = [
  { value: "nuevo", label: "Nuevo" }, { value: "contactado", label: "Contactado" },
  { value: "cita_agendada", label: "Cita agendada" }, { value: "seguimiento", label: "Seguimiento" },
  { value: "descartado", label: "Descartado" },
];
const labels: Record<string, string> = {
  cash: "Al contado", financing: "Financiación directa", bank: "Crédito bancario",
  undecided: "Quiero asesoramiento", under1500: "Menos de US$ 1.500",
  "1500-5000": "US$ 1.500 a US$ 5.000", "5000-10000": "US$ 5.000 a US$ 10.000",
  over10000: "Más de US$ 10.000", saving: "Todavía estoy ahorrando",
  under200: "Menos de US$ 200", "200-350": "US$ 200 a US$ 350",
  "350-500": "US$ 350 a US$ 500", over500: "Más de US$ 500",
  home: "Construir mi casa", investment: "Invertir", family: "Comprar para mi familia",
  other: "Otro objetivo", yes: "Sí, la conozco", somewhat: "La conozco de referencia",
  no: "Necesito conocer la ubicación", now: "Lo antes posible", "30days": "Dentro de 30 días",
  "90days": "En 1 a 3 meses", later: "Más adelante", weekday: "Durante la semana",
  weekend: "El fin de semana", flexible: "Tengo flexibilidad",
};
const widgetNames: { key: WidgetKey; title: string; description: string }[] = [
  { key: "monthly", title: "Volumen de leads", description: "Contactos recibidos por mes" },
  { key: "payments", title: "Preferencia de compra", description: "Contado, financiación directa y crédito bancario" },
  { key: "funnel", title: "Embudo comercial", description: "Estado actual de cada oportunidad" },
  { key: "intent", title: "Intención de compra", description: "Cuándo quieren comprar y para qué" },
  { key: "budget", title: "Capacidad de pago", description: "Presupuesto inicial declarado" },
];
const defaultWidgets: Record<WidgetKey, boolean> = { monthly: true, payments: true, funnel: true, intent: true, budget: true };

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
  return url && key ? createClient(url, key) : null;
}
function groupCounts(values: string[], order: string[] = []) {
  const counts = new Map<string, number>();
  values.forEach((value) => counts.set(value || "Sin respuesta", (counts.get(value || "Sin respuesta") || 0) + 1));
  const keys = [...new Set([...order, ...counts.keys()])];
  return keys.map((key) => ({ key, label: pretty(key), count: counts.get(key) || 0 })).filter((item) => item.count > 0);
}
function BarRows({ items, total, empty }: { items: { key: string; label: string; count: number }[]; total: number; empty: string }) {
  if (!items.length) return <div className="crm-chart-empty">{empty}</div>;
  return <div className="crm-bar-rows">{items.map((item) => <div className="crm-bar-row" key={item.key}>
    <div className="crm-bar-label"><span>{item.label}</span><strong>{item.count} <small>({total ? Math.round(item.count / total * 100) : 0}%)</small></strong></div>
    <div className="crm-bar-track"><span style={{ width: `${total ? item.count / total * 100 : 0}%` }}/></div>
  </div>)}</div>;
}
function Panel({ title, subtitle, action, children, className = "" }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`crm-panel ${className}`}><div className="crm-panel-head"><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{action}</div>{children}</section>;
}

export default function AdminPage() {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [sessionToken, setSessionToken] = useState(""); const [loggedInEmail, setLoggedInEmail] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]); const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos"); const [loading, setLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(true); const [error, setError] = useState("");
  const [selected, setSelected] = useState<Lead | null>(null); const [updatingId, setUpdatingId] = useState(""); const [deletingId, setDeletingId] = useState("");
  const [view, setView] = useState<View>("dashboard"); const [sidebarCollapsed, setSidebarCollapsed] = useState(false); const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [widgets, setWidgets] = useState<Record<WidgetKey, boolean>>(defaultWidgets);
  const [settingsReady, setSettingsReady] = useState(false); const [fontScale, setFontScale] = useState(1);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem("ced-admin-widgets");
      if (saved) setWidgets({ ...defaultWidgets, ...JSON.parse(saved) });
      setSidebarCollapsed(window.localStorage.getItem("ced-admin-sidebar") === "collapsed");
      const savedScale = Number(window.localStorage.getItem("ced-admin-font-scale"));\n      if ([0.9, 1, 1.1, 1.2].includes(savedScale)) setFontScale(savedScale);
    } catch { /* configuración local opcional */ }
    setSettingsReady(true);
  }, []);
  useEffect(() => {
    if (settingsReady) {
      window.localStorage.setItem("ced-admin-widgets", JSON.stringify(widgets));
      window.localStorage.setItem("ced-admin-sidebar", sidebarCollapsed ? "collapsed" : "expanded");
      window.localStorage.setItem("ced-admin-font-scale", String(fontScale));
    }
  }, [widgets, sidebarCollapsed, fontScale, settingsReady]);

  useEffect(() => {
    const client = makeSupabase(); setSupabase(client);
    if (!client) { setError("Falta configurar la clave pública de Supabase en Vercel."); setAuthLoading(false); return; }
    client.auth.getSession().then(({ data }) => {
      if (data.session) { setSessionToken(data.session.access_token); setLoggedInEmail(data.session.user.email || ""); }
      setAuthLoading(false);
    });
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      setSessionToken(session?.access_token || ""); setLoggedInEmail(session?.user.email || "");
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const loadLeads = useCallback(async (token: string) => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/leads", { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
      const result = await response.json();
      if (response.status === 403 || response.status === 401) {
        await supabase?.auth.signOut(); setSessionToken(""); setLoggedInEmail("");
        throw new Error(response.status === 403 ? "Este usuario no está autorizado para ingresar al panel." : "La sesión venció. Iniciá sesión nuevamente.");
      }
      if (!response.ok) throw new Error(result.error || "No pudimos cargar los leads.");
      setLeads(result.leads || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Ocurrió un error inesperado."); }
    finally { setLoading(false); }
  }, [supabase]);
  useEffect(() => { if (sessionToken) void loadLeads(sessionToken); else setLeads([]); }, [sessionToken, loadLeads]);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!supabase) return; setLoading(true); setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (signInError || !data.session) { setError("No pudimos iniciar sesión. Revisá el correo y la contraseña."); return; }
    setPassword(""); setSessionToken(data.session.access_token); setLoggedInEmail(data.user.email || email);
  }
  async function signOut() {
    await supabase?.auth.signOut(); setSessionToken(""); setLoggedInEmail(""); setLeads([]); setSelected(null);
  }
  async function updateStatus(lead: Lead, status: Lead["status"]) {
    setUpdatingId(lead.id); setError("");
    try {
      const response = await fetch("/api/admin/leads", {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ id: lead.id, status }),
      });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "No pudimos actualizar el estado.");
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status } : item));
      setSelected((current) => current?.id === lead.id ? { ...current, status } : current);
    } catch (e) { setError(e instanceof Error ? e.message : "No pudimos actualizar el estado."); }
    finally { setUpdatingId(""); }
  }

  async function deleteLead(lead: Lead) {
    const confirmed = window.confirm(`¿Eliminar definitivamente el lead de ${lead.name}? Esta acción no se puede deshacer.`);
    if (!confirmed) return;
    setDeletingId(lead.id); setError("");
    try {
      const response = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${sessionToken}` },
        body: JSON.stringify({ id: lead.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No pudimos eliminar el lead.");
      setLeads((current) => current.filter((item) => item.id !== lead.id));
      setSelected((current) => current?.id === lead.id ? null : current);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos eliminar el lead.");
    } finally {
      setDeletingId("");
    }
  }
  const filteredLeads = useMemo(() => {
    const term = query.trim().toLowerCase();
    return leads.filter((lead) => (statusFilter === "todos" || lead.status === statusFilter) &&
      (!term || [lead.name, lead.phone, lead.payment_method, lead.initial_budget, lead.purpose]
        .some((value) => String(value || "").toLowerCase().includes(term))));
  }, [leads, query, statusFilter]);

  const monthly = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 6 }, (_, index) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const value = leads.filter((lead) => {
        const date = new Date(lead.created_at);
        return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
      }).length;
      return { label: new Intl.DateTimeFormat("es-BO", { month: "short" }).format(month).replace(".", ""), count: value };
    });
  }, [leads]);

  function exportCsv() {
    const headings = ["Fecha", "Nombre", "WhatsApp", "Estado", "Forma de pago", "Presupuesto inicial", "Cuota mensual", "Plazo", "Objetivo", "Zona", "Compra", "Visita", "Origen"];
    const rows = filteredLeads.map((lead) => [dateLabel(lead.created_at), lead.name, lead.phone,
      statuses.find((s) => s.value === lead.status)?.label, pretty(lead.payment_method), pretty(lead.initial_budget),
      pretty(lead.monthly_budget), pretty(lead.preferred_years), pretty(lead.purpose), pretty(lead.knows_zone),
      pretty(lead.purchase_timing), pretty(lead.visit_availability), lead.source]);
    const csv = [headings, ...rows].map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
    anchor.href = url; anchor.download = "leads-campos-del-este.csv"; anchor.click(); URL.revokeObjectURL(url);
  }

  if (authLoading) return <main className="admin-shell admin-loading"><div className="admin-spinner"/><p>Verificando acceso seguro…</p></main>;
  if (!sessionToken) return <main className="admin-shell admin-login-wrap"><section className="admin-login-card">
    <div className="admin-brand-mark">CE</div><span className="admin-eyebrow">CAMPOS DEL ESTE · FASE III</span><h1>Panel comercial</h1>
    <p className="admin-subtitle">Ingresá con tu cuenta autorizada para consultar y gestionar los leads.</p>
    <form onSubmit={signIn} className="admin-login-form">
      <label>Correo electrónico<input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu correo de acceso"/></label>
      <label>Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Tu contraseña"/></label>
      {error && <p className="admin-error" role="alert">{error}</p>}
      <button className="admin-primary" type="submit" disabled={loading}>{loading ? "Ingresando…" : "Iniciar sesión"}</button>
    </form><p className="admin-login-foot"><ShieldCheck size={15}/> Acceso privado y restringido.</p>
  </section></main>;

  const total = leads.length;
  const count = (status: Lead["status"]) => leads.filter((lead) => lead.status === status).length;
  const activeCount = total - count("descartado");
  const qualifiedCount = count("contactado") + count("cita_agendada") + count("seguimiento");
  const conversion = total ? Math.round(count("cita_agendada") / total * 100) : 0;
  const paymentItems = groupCounts(leads.map((lead) => lead.payment_method), ["cash", "financing", "bank", "undecided"]);
  const funnelItems = statuses.map((status) => ({ key: status.value, label: status.label, count: count(status.value) })).filter((item) => item.count > 0);
  const intentItems = groupCounts(leads.map((lead) => lead.purchase_timing), ["now", "30days", "90days", "later"]);
  const budgetItems = groupCounts(leads.map((lead) => lead.initial_budget), ["under1500", "1500-5000", "5000-10000", "over10000", "saving"]);
  const maxMonthly = Math.max(1, ...monthly.map((item) => item.count));
  const navItems: { key: View; title: string; icon: typeof LayoutDashboard }[] = [
    { key: "dashboard", title: "Resumen general", icon: LayoutDashboard },
    { key: "leads", title: "Todos los leads", icon: Users },
    { key: "settings", title: "Personalizar panel", icon: Settings2 },
  ];

  return <main className={`crm-shell ${sidebarCollapsed ? "crm-sidebar-collapsed" : ""} ${mobileSidebarOpen ? "crm-mobile-sidebar-open" : ""}`} style={{ zoom: fontScale }}>
    <aside className="crm-sidebar">
      <a href="/" className="crm-brand" aria-label="Campos del Este"><img src="/images/logo-campos-del-este.png.jpeg" alt="Campos del Este" className="crm-brand-image"/></a>
      <div className="crm-nav-label">GESTIÓN COMERCIAL</div>
      <nav className="crm-nav">{navItems.map((item) => {
        const Icon = item.icon;
        return <button key={item.key} className={`crm-nav-item ${view === item.key ? "active" : ""}`} onClick={() => { setView(item.key); setMobileSidebarOpen(false); }} title={sidebarCollapsed ? item.title : undefined}>
          <Icon size={19}/><span>{item.title}</span>{item.key === "leads" && <em>{total}</em>}
        </button>;
      })}</nav>
      <div className="crm-sidebar-bottom"><div className="crm-sidebar-note"><ShieldCheck size={17}/><span>Datos privados de tu equipo comercial.</span></div>
        <button className="crm-nav-item crm-logout-link" onClick={signOut}><LogOut size={18}/><span>Cerrar sesión</span></button>
      </div>
      <button className="crm-collapse" onClick={() => setSidebarCollapsed((value) => !value)} aria-label={sidebarCollapsed ? "Expandir menú" : "Contraer menú"}>
        {sidebarCollapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
      </button>
    </aside>

    <section className="crm-main">
      <header className="crm-topbar"><div className="crm-topbar-left"><button className="crm-mobile-menu" onClick={() => setMobileSidebarOpen((value) => !value)} aria-label="Mostrar u ocultar menú"><Menu size={20}/></button><div><span className="crm-top-eyebrow">CAMPOS DEL ESTE / FASE III</span><strong>{view === "dashboard" ? "Centro de métricas" : view === "leads" ? "Gestión de interesados" : "Configuración del panel"}</strong></div></div>
        <div className="crm-top-actions"><span className="crm-live-dot"/> <span className="crm-admin-role"><ShieldCheck size={13}/> Administrador</span><span className="crm-account-email">{loggedInEmail}</span>
          <button className="crm-icon-btn" onClick={() => void loadLeads(sessionToken)} title="Actualizar datos" aria-label="Actualizar datos" disabled={loading}><RefreshCw size={17} className={loading ? "admin-spin" : ""}/></button>
          <button className="crm-user-avatar" onClick={signOut} title="Cerrar sesión" aria-label="Cerrar sesión"><LogOut size={17}/></button>
        </div>
      </header>

      <div className="crm-page-content">
        {error && <p className="admin-error admin-error-banner" role="alert">{error}</p>}
        {view === "dashboard" && <>
          <div className="crm-page-heading"><div><span className="crm-section-kicker">DASHBOARD COMERCIAL</span><h1>Hola, equipo 👋</h1><p>Una vista clara de tus oportunidades y del rendimiento de captación.</p></div>
            <button className="crm-button-secondary" onClick={() => void loadLeads(sessionToken)} disabled={loading}><RefreshCw size={16} className={loading ? "admin-spin" : ""}/> Actualizar métricas</button></div>
          <div className="crm-kpi-grid">
            <article className="crm-kpi-card"><span className="crm-kpi-icon purple"><Users size={19}/></span><span className="crm-kpi-label">Total de leads</span><strong>{total}</strong><small>Todos los contactos recibidos</small></article>
            <article className="crm-kpi-card"><span className="crm-kpi-icon orange"><Clock3 size={19}/></span><span className="crm-kpi-label">Nuevos por contactar</span><strong>{count("nuevo")}</strong><small>{total ? Math.round(count("nuevo") / total * 100) : 0}% del total</small></article>
            <article className="crm-kpi-card"><span className="crm-kpi-icon teal"><CalendarCheck size={19}/></span><span className="crm-kpi-label">Citas agendadas</span><strong>{count("cita_agendada")}</strong><small>{conversion}% de conversión a cita</small></article>
            <article className="crm-kpi-card"><span className="crm-kpi-icon green"><Activity size={19}/></span><span className="crm-kpi-label">En gestión activa</span><strong>{qualifiedCount}</strong><small>{activeCount} oportunidades no descartadas</small></article>
          </div>

          <div className="crm-insight-strip"><div className="crm-insight-icon"><BarChart3 size={20}/></div><div><strong>Lectura rápida del embudo</strong><p>{total ? `${count("nuevo")} leads nuevos necesitan primer contacto; ${count("contactado")} contactados; ${count("cita_agendada")} citas agendadas y ${count("seguimiento")} en seguimiento.` : "Cuando lleguen consultas, vas a ver aquí un resumen de las oportunidades comerciales."}</p></div><button onClick={() => setView("leads")}>Ver leads <ChevronRight size={16}/></button></div>

          <div className="crm-chart-grid">
            {widgets.monthly && <Panel title="Volumen de leads" subtitle="Nuevos contactos por mes, últimos seis meses" action={<span className="crm-panel-note">Por fecha de alta</span>} className="crm-monthly-panel">
              <div className="crm-month-chart">{monthly.map((item) => <div className="crm-month-col" key={item.label}><strong>{item.count}</strong><div className="crm-month-bar-area"><span className={item.count ? "has-value" : ""} style={{ height: `${item.count ? Math.max(8, item.count / maxMonthly * 100) : 2}%` }}/></div><small>{item.label}</small></div>)}</div>
            </Panel>}
            {widgets.payments && <Panel title="Preferencia de compra" subtitle="Qué modalidad busca cada interesado"><BarRows items={paymentItems} total={total} empty="Todavía no hay respuestas sobre la forma de pago."/></Panel>}
            {widgets.funnel && <Panel title="Embudo comercial" subtitle="Distribución por estado de seguimiento"><BarRows items={funnelItems} total={total} empty="Todavía no hay leads para medir el embudo."/></Panel>}
            {widgets.intent && <Panel title="Intención de compra" subtitle="Cuándo planean comprar"><BarRows items={intentItems} total={total} empty="Todavía no hay respuestas sobre el plazo de compra."/></Panel>}
            {widgets.budget && <Panel title="Presupuesto inicial" subtitle="Capacidad de aporte inicial declarada"><BarRows items={budgetItems} total={total} empty="Todavía no hay respuestas sobre presupuesto."/></Panel>}
          </div>
          <Panel title="Últimas consultas" subtitle="Los contactos más recientes que ingresaron" action={<button className="crm-text-button" onClick={() => setView("leads")}>Ver todos <ChevronRight size={15}/></button>}>
            {leads.length ? <div className="crm-recent-list">{leads.slice(0, 5).map((lead) => <button className="crm-recent-row" key={lead.id} onClick={() => setSelected(lead)}>
              <span className="crm-lead-avatar">{lead.name.trim().split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase()}</span><span className="crm-recent-info"><strong>{lead.name}</strong><small>{pretty(lead.payment_method)} · {dateLabel(lead.created_at)}</small></span><span className={`crm-status-badge status-${lead.status}`}>{statuses.find((s) => s.value === lead.status)?.label}</span><ChevronRight className="crm-recent-arrow" size={16}/>
            </button>)}</div> : <div className="crm-chart-empty">Las consultas nuevas aparecerán aquí cuando alguien complete el formulario.</div>}
          </Panel>
        </>}

        {view === "leads" && <>
          <div className="crm-page-heading"><div><span className="crm-section-kicker">BASE DE CONTACTOS</span><h1>Todos los leads</h1><p>Buscá, filtrá y actualizá el estado de cada interesado.</p></div><button className="crm-button-secondary" onClick={exportCsv} disabled={!filteredLeads.length}><ArrowDownToLine size={16}/> Exportar CSV</button></div>
          <div className="crm-lead-summary-cards"><div><Users size={18}/><span>Total en base</span><strong>{total}</strong></div><div><Clock3 size={18}/><span>Pendientes de contacto</span><strong>{count("nuevo")}</strong></div><div><CalendarCheck size={18}/><span>Citas agendadas</span><strong>{count("cita_agendada")}</strong></div><div><Wallet size={18}/><span>Modalidad contado</span><strong>{leads.filter((lead) => lead.payment_method === "cash").length}</strong></div></div>
          <Panel title="Base de interesados" subtitle={`${filteredLeads.length} ${filteredLeads.length === 1 ? "resultado" : "resultados"}`}>
            <div className="crm-lead-filters"><label className="crm-search"><Search size={17}/><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por nombre, teléfono, forma de pago…"/></label>
              <label className="crm-filter-select"><SlidersHorizontal size={16}/><select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="todos">Todos los estados</option>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label></div>
            {loading && !leads.length ? <div className="crm-empty-state"><div className="admin-spinner"/><p>Cargando consultas…</p></div> : !filteredLeads.length ? <div className="crm-empty-state"><Users size={28}/><strong>No hay consultas para mostrar</strong><p>Probá cambiar los filtros o esperá nuevas consultas.</p></div> : <div className="crm-table-wrap"><table className="crm-table"><thead><tr><th>Interesado</th><th>Modalidad</th><th>Intención</th><th>Fecha</th><th>Estado</th><th>Detalle</th></tr></thead><tbody>{filteredLeads.map((lead) => <tr key={lead.id}><td><button className="crm-table-person" onClick={() => setSelected(lead)}><span className="crm-lead-avatar">{lead.name.trim().split(/\s+/).slice(0,2).map((part) => part[0]).join("").toUpperCase()}</span><span><strong>{lead.name}</strong><small>{lead.phone}</small></span></button></td><td>{pretty(lead.payment_method)}</td><td>{pretty(lead.purchase_timing)}</td><td>{dateLabel(lead.created_at)}</td><td><select className={`crm-status-select status-${lead.status}`} value={lead.status} disabled={updatingId === lead.id} onChange={(e) => void updateStatus(lead, e.target.value as Lead["status"])}>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></td><td><button className="crm-icon-btn" onClick={() => setSelected(lead)} aria-label={`Ver ${lead.name}`}><ChevronRight size={17}/></button></td></tr>)}</tbody></table></div>}
          </Panel>
        </>}

        {view === "settings" && <>
          <div className="crm-page-heading"><div><span className="crm-section-kicker">TU ESPACIO DE TRABAJO</span><h1>Personalizar panel</h1><p>Elegí qué gráficos querés ver en el resumen. La preferencia se guarda en este navegador.</p></div><button className="crm-button-secondary" onClick={() => setWidgets(defaultWidgets)}><RefreshCw size={16}/> Restaurar gráficos</button></div>
          <Panel title="Tamaño de letra" subtitle="Ajustá el tamaño de los textos en todo el CRM. Se guarda en este navegador.">
            <div className="crm-font-settings">
              <div className="crm-font-preview" style={{ fontSize: `${fontScale * 14}px` }}><strong>Así se verá el texto</strong><span>Los menús, las métricas y las fichas se adaptan al tamaño que elijas.</span></div>
              <div className="crm-font-options" role="group" aria-label="Tamaño de letra del CRM">
                {[{value:0.9,label:"Pequeña"},{value:1,label:"Normal"},{value:1.1,label:"Grande"},{value:1.2,label:"Muy grande"}].map((option) => <button type="button" key={option.value} className={fontScale === option.value ? "active" : ""} onClick={() => setFontScale(option.value)} aria-pressed={fontScale === option.value}><span style={{fontSize:`${12 * option.value}px`}}>Aa</span>{option.label}</button>)}
              </div>
            </div>
          </Panel>
          <Panel title="Métricas visibles" subtitle="Activá o desactivá cada módulo del dashboard">
            <div className="crm-settings-list">{widgetNames.map((widget) => <label className="crm-setting-row" key={widget.key}><span className="crm-setting-icon"><BarChart3 size={18}/></span><span className="crm-setting-copy"><strong>{widget.title}</strong><small>{widget.description}</small></span><input type="checkbox" checked={widgets[widget.key]} onChange={(e) => setWidgets((current) => ({ ...current, [widget.key]: e.target.checked }))}/><span className="crm-toggle" aria-hidden="true"/></label>)}</div>
          </Panel>
          <Panel title="Datos y criterios" subtitle="Cómo se calculan las métricas">
            <div className="crm-info-grid"><div><strong>Volumen de leads</strong><p>Cuenta consultas según la fecha en que se registraron en la base.</p></div><div><strong>Conversión a cita</strong><p>Citas agendadas divididas por el total de leads registrados.</p></div><div><strong>Modalidad de compra</strong><p>Se completa con la respuesta del formulario: contado, financiación directa o crédito bancario.</p></div><div><strong>Embudo comercial</strong><p>Refleja el estado de seguimiento que actualices en la ficha de cada interesado.</p></div></div>
          </Panel>
          <div className="crm-settings-notice"><ShieldCheck size={18}/><p>Los gráficos se calculan con datos reales de tus leads. No se agregan valores de ejemplo. Para sumar campos editables, notas y nuevos estados de forma persistente, el siguiente paso es ampliar la estructura de datos de Supabase.</p></div>
        </>}
        <footer className="crm-footer"><span>Campos del Este · Panel comercial</span><span><span className="crm-live-dot"/> Datos sincronizados con la base de leads</span></footer>
      </div>
    </section>

    {selected && <div className="admin-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}><section className="admin-detail-modal crm-detail-modal" role="dialog" aria-modal="true" aria-labelledby="admin-detail-title">
      <div className="admin-modal-head"><div><span className="admin-eyebrow">PERFIL DEL INTERESADO</span><h2 id="admin-detail-title">{selected.name}</h2><p>{dateLabel(selected.created_at)}</p></div><button className="admin-icon-button" onClick={() => setSelected(null)} aria-label="Cerrar"><X size={20}/></button></div>
      <div className="admin-detail-contact"><div><span>WhatsApp registrado</span><strong>{selected.phone}</strong></div><a href={`https://wa.me/${selected.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="admin-whatsapp"><MessageCircle size={17}/> Abrir WhatsApp</a></div>
      <div className="admin-detail-status"><label>Estado comercial<select value={selected.status} disabled={updatingId === selected.id} onChange={(e) => void updateStatus(selected, e.target.value as Lead["status"])}>{statuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label></div>
      <div className="admin-answer-grid">{[["Forma de pago", pretty(selected.payment_method)], ["Presupuesto inicial", pretty(selected.initial_budget)], ["Cuota mensual posible", pretty(selected.monthly_budget)], ["Plazo preferido", pretty(selected.preferred_years)], ["Objetivo de compra", pretty(selected.purpose)], ["Conoce la zona", pretty(selected.knows_zone)], ["Cuándo quiere comprar", pretty(selected.purchase_timing)], ["Disponibilidad para visitar", pretty(selected.visit_availability)]].map(([title, value]) => <div className="admin-answer" key={title}><span>{title}</span><strong>{value}</strong></div>)}</div>
      <p className="admin-detail-foot"><ShieldCheck size={15}/> Consentimiento registrado: {selected.consent ? "Sí" : "No"} · Origen: {selected.source}</p>
      <div className="crm-delete-area"><p>¿Es un registro de prueba o duplicado?</p><button className="crm-delete-button" onClick={() => void deleteLead(selected)} disabled={deletingId === selected.id}><Trash2 size={16}/>{deletingId === selected.id ? "Eliminando…" : "Eliminar lead"}</button></div>
    </section></div>}
  </main>;
}
