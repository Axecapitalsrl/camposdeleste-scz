"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Activity, ArrowRight, Check, ChevronDown, Clock3, GripVertical, LayoutDashboard,
  LoaderCircle, LogOut, RefreshCw, Search, ShieldCheck, SlidersHorizontal, Users,
} from "lucide-react";
import "./pipeline.css";

type Lead = {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  payment_method: string;
  initial_budget: string;
  monthly_budget: string;
  purpose: string;
  purchase_timing: string;
  source: string;
  status: "nuevo" | "contactado" | "cita_agendada" | "seguimiento" | "descartado";
};

type Stage = { value: Lead["status"]; label: string; color: string; description: string };
const stages: Stage[] = [
  { value: "nuevo", label: "Nuevo lead", color: "#64748b", description: "Pendiente de primer contacto" },
  { value: "contactado", label: "Contactado", color: "#3b82f6", description: "Ya hubo un primer contacto" },
  { value: "seguimiento", label: "En seguimiento", color: "#8b5cf6", description: "Conversación en curso" },
  { value: "cita_agendada", label: "Cita concertada", color: "#0d9488", description: "Visita o reunión coordinada" },
  { value: "descartado", label: "Descartado", color: "#ef4444", description: "Oportunidad cerrada sin venta" },
];
const paymentLabels: Record<string, string> = {
  cash: "Al contado", financing: "Financiación directa", bank: "Crédito bancario",
  undecided: "Busca asesoramiento",
};

function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "CL";
}

export default function PipelinePage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [draggedId, setDraggedId] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const supabase = useMemo(() => createSupabase(), []);

  const loadLeads = useCallback(async (accessToken: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/leads", {
        headers: { Authorization: `Bearer ${accessToken}` },
        cache: "no-store",
      });
      const result = await response.json();
      if (response.status === 401 || response.status === 403) {
        await supabase?.auth.signOut();
        router.replace("/admin");
        return;
      }
      if (!response.ok) throw new Error(result.error || "No pudimos cargar los leads.");
      setLeads(result.leads || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos cargar el pipeline.");
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    if (!supabase) {
      setError("Falta configurar la conexión con Supabase.");
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        router.replace("/admin");
        return;
      }
      setToken(data.session.access_token);
      setEmail(data.session.user.email || "");
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        router.replace("/admin");
        return;
      }
      setToken(session.access_token);
      setEmail(session.user.email || "");
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase, router, loadLeads]);

  useEffect(() => {
    if (token) void loadLeads(token);
  }, [token, loadLeads]);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) => [lead.name, lead.phone, paymentLabels[lead.payment_method] || lead.payment_method, lead.source]
      .some((value) => String(value || "").toLowerCase().includes(q)));
  }, [leads, search]);

  async function moveLead(lead: Lead, status: Lead["status"]) {
    if (lead.status === status || !token) return;
    const oldStatus = lead.status;
    setSavingId(lead.id);
    setError("");
    setNotice("");
    setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status } : item));
    try {
      const response = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: lead.id, status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "No pudimos mover el lead.");
      setNotice(`${lead.name} pasó a “${stages.find((stage) => stage.value === status)?.label}”.`);
    } catch (e) {
      setLeads((current) => current.map((item) => item.id === lead.id ? { ...item, status: oldStatus } : item));
      setError(e instanceof Error ? e.message : "No pudimos actualizar la etapa.");
    } finally {
      setSavingId("");
      setDraggedId("");
    }
  }

  async function signOut() {
    await supabase?.auth.signOut();
    router.replace("/admin");
  }

  return (
    <div className="ced-pipeline-layout">
      <aside className="ced-pipeline-sidebar">
        <a className="ced-pipeline-sidebar-brand" href="/admin" aria-label="Volver al panel de Campos del Este"><img src="/images/logo-campos-del-este.png.jpeg" alt="Campos del Este"/></a>
        <div className="ced-pipeline-sidebar-label">GESTIÓN COMERCIAL</div>
        <nav className="ced-pipeline-sidebar-nav" aria-label="Navegación principal">
          <a href="/admin?view=dashboard"><LayoutDashboard size={19}/>Resumen general</a>
          <a href="/admin?view=leads"><Users size={19}/>Todos los leads</a>
          <a href="/admin?view=settings"><SlidersHorizontal size={19}/>Personalizar panel</a>
          <a href="/admin/pipeline" className="active"><Activity size={19}/>Pipeline comercial</a>
        </nav>
        <div className="ced-pipeline-sidebar-bottom"><ShieldCheck size={16}/><span>Datos privados de tu equipo comercial</span></div>
      </aside>
      <main className="ced-pipeline">
      <header className="ced-pipeline-topbar">
        <a className="ced-pipeline-brand" href="/admin" aria-label="Volver al panel comercial">
          <img src="/images/logo-campos-del-este.png.jpeg" alt="Campos del Este" />
        </a>
        <div className="ced-pipeline-breadcrumb"><span>CRM / PIPELINE</span><strong>Pipeline comercial</strong></div>
        <div className="ced-pipeline-account">
          <span className="ced-pipeline-online" title="Sesión activa" />
          <span className="ced-pipeline-email">{email}</span>
          <button className="ced-pipeline-icon-btn" onClick={() => token && void loadLeads(token)} title="Actualizar pipeline" aria-label="Actualizar pipeline"><RefreshCw size={18}/></button>
          <button className="ced-pipeline-icon-btn" onClick={() => void signOut()} title="Cerrar sesión" aria-label="Cerrar sesión"><LogOut size={18}/></button>
        </div>
      </header>

      <section className="ced-pipeline-content">
        <div className="ced-pipeline-heading">
          <div>
            <span className="ced-pipeline-kicker">GESTIÓN DE OPORTUNIDADES</span>
            <h1>Pipeline comercial</h1>
            <p>Mové cada interesado a medida que avances en la conversación.</p>
          </div>
          <a className="ced-pipeline-primary" href="/admin"><Users size={17}/> Ver todos los leads <ArrowRight size={16}/></a>
        </div>

        <div className="ced-pipeline-toolbar">
          <div className="ced-pipeline-search"><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre, teléfono o modalidad..." aria-label="Buscar leads"/></div>
          <div className="ced-pipeline-count"><Users size={15}/>{filteredLeads.length} oportunidades</div>
          <span className="ced-pipeline-drag-hint"><GripVertical size={15}/> Arrastrá tarjetas para cambiar de etapa</span>
        </div>

        {error && <div className="ced-pipeline-alert error">{error}</div>}
        {notice && <div className="ced-pipeline-alert success"><Check size={15}/>{notice}</div>}

        <div className="ced-pipeline-board" aria-label="Etapas del pipeline comercial">
          {stages.map((stage) => {
            const stageLeads = filteredLeads.filter((lead) => lead.status === stage.value);
            return (
              <section key={stage.value} className={`ced-pipeline-column ${draggedId ? "is-dragging" : ""}`}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const lead = leads.find((item) => item.id === (event.dataTransfer.getData("text/plain") || draggedId));
                  if (lead) void moveLead(lead, stage.value);
                }}>
                <div className="ced-pipeline-column-head">
                  <div className="ced-pipeline-stage-title"><span style={{ backgroundColor: stage.color }}/><h2>{stage.label}</h2></div>
                  <span className="ced-pipeline-stage-count">{stageLeads.length}</span>
                </div>
                <p className="ced-pipeline-stage-description">{stage.description}</p>
                <div className="ced-pipeline-cards">
                  {stageLeads.map((lead) => (
                    <article key={lead.id} className={`ced-pipeline-card ${draggedId === lead.id ? "dragged" : ""}`}
                      draggable={savingId !== lead.id}
                      onDragStart={(event) => { setDraggedId(lead.id); event.dataTransfer.setData("text/plain", lead.id); event.dataTransfer.effectAllowed = "move"; }}
                      onDragEnd={() => setDraggedId("")}>
                      <div className="ced-pipeline-card-person">
                        <span className="ced-pipeline-avatar">{initials(lead.name)}</span>
                        <div><strong>{lead.name}</strong><small>{lead.phone || "Sin teléfono"}</small></div>
                        <GripVertical size={16} className="ced-pipeline-grip"/>
                      </div>
                      <div className="ced-pipeline-card-tags">
                        <span>{paymentLabels[lead.payment_method] || lead.payment_method || "Modalidad pendiente"}</span>
                        <span>{lead.source || "Origen sin registrar"}</span>
                      </div>
                      {lead.purchase_timing && <div className="ced-pipeline-card-timing"><Clock3 size={13}/>{lead.purchase_timing === "now" ? "Lo antes posible" : lead.purchase_timing === "30days" ? "Dentro de 30 días" : lead.purchase_timing === "90days" ? "En 1 a 3 meses" : lead.purchase_timing === "later" ? "Más adelante" : lead.purchase_timing}</div>}
                      <div className="ced-pipeline-card-footer">
                        <span>{new Intl.DateTimeFormat("es-BO", { day: "2-digit", month: "short" }).format(new Date(lead.created_at))}</span>
                        <label className="ced-pipeline-move-label" title="Mover a otra etapa">
                          {savingId === lead.id ? <LoaderCircle size={14} className="ced-pipeline-spin"/> : <ChevronDown size={14}/>}
                          <select aria-label={`Mover ${lead.name} a otra etapa`} value={lead.status} disabled={savingId === lead.id} onChange={(event) => void moveLead(lead, event.target.value as Lead["status"])}>
                            {stages.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                          </select>
                        </label>
                      </div>
                    </article>
                  ))}
                  {stageLeads.length === 0 && <div className="ced-pipeline-empty">Soltá un lead aquí</div>}
                </div>
              </section>
            );
          })}
        </div>
        {loading && <div className="ced-pipeline-loading"><LoaderCircle size={17} className="ced-pipeline-spin"/> Cargando oportunidades…</div>}
        {!loading && filteredLeads.length === 0 && <div className="ced-pipeline-no-results">No hay leads que coincidan con la búsqueda.</div>}
        <footer className="ced-pipeline-footer"><span>Campos del Este · Pipeline comercial</span><span><ShieldCheck size={14}/> Datos privados del equipo comercial</span></footer>
      </section>
      </main>
    </div>
  );
}
