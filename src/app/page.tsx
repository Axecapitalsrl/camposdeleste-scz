import { ArrowDown, ArrowRight, CheckCircle2, CircleDollarSign, Clock3, MapPinned, Trees, WalletCards, PlayCircle, MessageCircle, ShieldCheck } from "lucide-react";
import LeadForm from "@/components/LeadForm";
import { FINANCING_PLANS, PRESENTATION_VIDEO, WHATSAPP_LINK } from "@/lib/constants";

const images = [
  { src: "/images/fase3-aerea-1.jpg.jpeg", alt: "Vista aérea real de Campos del Este" },
  { src: "/images/fase3-aerea-2.jpg.jpeg", alt: "Calles y terrenos de Campos del Este" },
  { src: "/images/fase3-aerea-3.jpg.jpeg", alt: "Vista aérea de la urbanización" },
];

function Photo({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return <div className={`photo ${className}`}><img src={src} alt={alt} loading="lazy" /></div>;
}
function CTA({ className = "" }: { className?: string }) {
  return <a className={`btn ${className}`} href="#agendar">Quiero agendar una cita <ArrowRight size={18}/></a>;
}
export default function Home() {
  return <main>
    <header className="site-header"><div className="container header-inner">
      <a className="brand" href="#inicio" aria-label="Campos del Este, inicio"><div className="brand-mark"><img src="/images/logo-campos-del-este.png.jpeg" alt="Campos del Este" /></div><span className="brand-caption">FASE III <i>·</i> SANTA CRUZ</span></a>
      <nav className="desktop-nav" aria-label="Navegación principal"><a href="#proyecto">El proyecto</a><a href="#precios">Precios y planes</a><a href="#plano">Plano</a></nav>
      <CTA className="header-cta"/>
    </div></header>
    <section className="hero" id="inicio"><div className="hero-background"><Photo src={images[0].src} alt={images[0].alt}/><div className="hero-shade"/></div>
      <div className="container hero-inner"><span className="hero-tag"><span/> TERRENOS · FASE III</span><h1>Tu próximo terreno<br/><em>puede estar acá.</em></h1>
        <p>Conocé Campos del Este y descubrí las opciones de compra al contado y financiación para dar tu próximo paso.</p>
        <div className="hero-price"><span>Terrenos desde</span><strong>US$ 15.500</strong><small>Precio de referencia al contado. Consultá disponibilidad y condiciones.</small></div>
        <div className="hero-actions"><CTA/><a href="#video" className="watch-link"><PlayCircle size={19}/> Ver presentación</a></div>
        <div className="hero-proof"><span><CheckCircle2 size={16}/> Opciones de contado</span><span><CheckCircle2 size={16}/> Planes de financiación</span></div>
      </div><a className="scroll-cue" href="#proyecto" aria-label="Bajar a conocer el proyecto"><ArrowDown size={18}/></a>
    </section>
    <section className="intro section" id="proyecto"><div className="container intro-grid"><div>
      <span className="eyebrow">Campos del Este · Fase III</span><h2 className="section-title">Un lugar para proyectar tu próximo paso.</h2>
      <p className="section-lead">Conocé el desarrollo, revisá el plano de urbanización y compará las alternativas de compra. Nuestro equipo puede orientarte sobre los lotes y las condiciones disponibles.</p>
      <div className="benefit-list">
        <div><span className="benefit-icon"><MapPinned size={21}/></span><span><strong>Conocé la ubicación</strong><small>Consultá cómo llegar y familiarizate con la zona.</small></span></div>
        <div><span className="benefit-icon"><WalletCards size={21}/></span><span><strong>Alternativas de compra</strong><small>Contado y diferentes plazos de financiación.</small></span></div>
        <div><span className="benefit-icon"><Trees size={21}/></span><span><strong>Conocé el entorno</strong><small>Miralo en imágenes reales del proyecto.</small></span></div>
      </div></div>
      <div className="intro-photo"><Photo src={images[1].src} alt={images[1].alt}/><div className="photo-note"><span className="note-icon"><CheckCircle2 size={20}/></span><span><strong>Conocé el proyecto de cerca</strong><small>Agendá una visita y recibí asesoramiento.</small></span></div></div>
    </div></section>
    <section className="video-section section" id="video"><div className="container video-grid"><div className="video-copy">
      <span className="eyebrow">Conocé Campos del Este</span><h2 className="section-title">Antes de elegir, conocé el proyecto.</h2><p className="section-lead">Mirá la presentación y después consultá las alternativas de compra que se ajusten a tu plan.</p><CTA/>
    </div><div className="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/-xsqWpOnNpI?rel=0" title="Presentación de Campos del Este Fase III" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/><a className="video-external" href={PRESENTATION_VIDEO} target="_blank" rel="noreferrer">Ver en YouTube <ArrowRight size={15}/></a></div></div></section>
    <section className="gallery-section section"><div className="container"><div className="section-heading"><span className="eyebrow">Imágenes reales</span><h2 className="section-title">Así se ve Campos del Este.</h2><p className="section-lead">Fotografías compartidas del proyecto. La disponibilidad de cada lote debe confirmarse al momento de la consulta.</p></div>
      <div className="gallery-grid gallery-three">{images.map((image,index)=><div key={image.src} className={`gallery-item ${index===0?"gallery-main":""}`}><Photo src={image.src} alt={image.alt}/></div>)}</div>
    </div></section>
    <section className="pricing section" id="precios"><div className="container">
      <div className="section-heading centered"><span className="eyebrow">Alternativas de compra</span><h2 className="section-title">Elegí cómo querés comprar.</h2><p className="section-lead">Valores de referencia compartidos para un lote. Los montos pueden variar según su ubicación, características y condiciones vigentes.</p></div>
      <div className="price-cards">
        <article className="price-card cash-card"><div className="price-icon"><CircleDollarSign size={25}/></div><span className="price-label">COMPRA AL CONTADO</span><h3>US$ 15.500</h3><p>Precio de referencia desde para compra al contado.</p><CTA className="btn-light"/></article>
        <article className="price-card finance-card"><div className="price-icon"><Clock3 size={25}/></div><span className="price-label">COMPRA A PLAZO</span><h3>Hasta 10 años</h3><p>Elegí el plazo que preferís y consultá las condiciones aplicables a cada lote.</p><a className="btn btn-white" href="#tabla-financiacion">Ver planes <ArrowRight size={17}/></a></article>
      </div>
      <div className="financing-table-wrap" id="tabla-financiacion"><div className="table-title"><div><span className="eyebrow">Compará alternativas</span><h3>Planes de financiación</h3></div><span className="table-usd">Importes en USD</span></div>
        <div className="table-scroll"><table className="financing-table"><thead><tr><th>Plazo</th><th>Cuota inicial</th><th>Cuota mensual</th><th>Total deuda</th></tr></thead><tbody>{FINANCING_PLANS.map((plan)=><tr key={plan.years}><th scope="row">{plan.years} {plan.years===1?"año":"años"}</th><td>{plan.initial.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>{plan.monthly.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>{plan.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>)}</tbody></table></div>
        <p className="table-note">Valores tomados de la referencia proporcionada. Confirmá las condiciones vigentes, la cantidad de cuotas y el lote elegido antes de concretar la compra.</p><CTA/>
      </div>
    </div></section>
    <section className="map-section section" id="plano"><div className="container map-grid"><div>
      <span className="eyebrow">Plano de urbanización</span><h2 className="section-title">Encontrá una opción para vos.</h2><p className="section-lead">Consultá el plano de la Fase III y preguntanos por los lotes disponibles y sus formas de pago.</p>
      <div className="map-legend"><span><i className="dot dot-cash"/> Verde oscuro: contado o crédito bancario</span><span><i className="dot dot-finance"/> Verde claro: financiación del proyecto</span><span><i className="dot dot-unavailable"/> Rojo: no se ofrece como disponible</span><span><i className="dot dot-check"/> Gris: estado por confirmar</span></div><CTA/>
    </div><div className="map-card pdf-card"><iframe className="plan-pdf" src="/images/plano-fase3.pdf#toolbar=0" title="Plano PDF de urbanización de Campos del Este Fase III"/><div className="map-caption"><ShieldCheck size={17}/><span>Plano original en PDF. La disponibilidad se confirma con el equipo comercial.</span><a href="/images/plano-fase3.pdf" target="_blank" rel="noreferrer">Abrir PDF</a></div></div></div></section>
    <section className="lead-section section" id="agendar"><div className="lead-decoration"><span/><span/><span/></div><div className="container lead-grid"><div className="lead-copy">
      <span className="eyebrow">Coordiná una visita</span><h2 className="section-title">Hablemos de tu próximo terreno.</h2><p>Respondé unas preguntas cortas para que podamos orientarte según tu presupuesto, forma de pago e intención de compra.</p>
      <div className="lead-assurance"><ShieldCheck size={20}/><span><strong>Primero registramos tu consulta</strong><small>Al finalizar, vas a poder abrir WhatsApp y coordinar la cita.</small></span></div>
      <div className="lead-direct"><MessageCircle size={18}/><span>¿Ya querés consultar? <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">Abrir WhatsApp</a></span></div>
    </div><div className="form-card"><LeadForm/></div></div></section>
    <section className="final-cta"><div className="container final-cta-inner"><div><span className="eyebrow">Campos del Este · Fase III</span><h2>El próximo paso empieza con una visita.</h2><p>Consultá precios, disponibilidad y alternativas de compra.</p></div><CTA/></div></section>
    <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><div className="footer-mark"><img src="/images/logo-campos-del-este.png" alt="Campos del Este"/></div><span>FASE III · SANTA CRUZ</span></div><p>Precios y disponibilidad sujetos a confirmación comercial. Las imágenes corresponden al material proporcionado para el proyecto.</p><a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">Contacto por WhatsApp <ArrowRight size={15}/></a></div><div className="container footer-bottom">© {new Date().getFullYear()} Campos del Este. Todos los derechos reservados.</div></footer>
  </main>;
}
