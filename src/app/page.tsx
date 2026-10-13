import { ArrowDown, ArrowRight, CheckCircle2, CircleDollarSign, Clock3, MapPinned, Trees, WalletCards, PlayCircle, ShieldCheck, BusFront, FileCheck2, Waves, Dumbbell, PartyPopper } from "lucide-react";
import Script from "next/script";
import LeadForm from "@/components/LeadForm";
import { FINANCING_PLANS, PRESENTATION_VIDEO } from "@/lib/constants";

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
    <Script id="meta-pixel" strategy="afterInteractive">{`
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;
      s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '3016882181992487');
      fbq('track', 'PageView');
    `}</Script>
    <noscript><img height="1" width="1" style={{ display: "none" }} src="https://www.facebook.com/tr?id=3016882181992487&ev=PageView&noscript=1" alt="" /></noscript>
    <header className="site-header"><div className="container header-inner">
      <a className="brand" href="#inicio" aria-label="Campos del Este, inicio"><div className="brand-mark"><img src="/images/logo-campos-del-este.png.jpeg" alt="Campos del Este" /></div><span className="brand-caption">FASE III <i>·</i> SANTA CRUZ</span></a>
      <nav className="desktop-nav" aria-label="Navegación principal"><a href="#proyecto">El proyecto</a><a href="#precios">Precios y planes</a></nav>
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
      <p className="section-lead">Conocé el desarrollo y compará las alternativas de compra. Nuestro equipo puede orientarte sobre los lotes y las condiciones disponibles.</p>
      <div className="benefit-list">
        <div><span className="benefit-icon"><MapPinned size={21}/></span><span><strong>Conocé la ubicación</strong><small>Consultá cómo llegar y familiarizate con la zona.</small></span></div>
        <div><span className="benefit-icon"><WalletCards size={21}/></span><span><strong>Alternativas de compra</strong><small>Contado y diferentes plazos de financiación.</small></span></div>
        <div><span className="benefit-icon"><Trees size={21}/></span><span><strong>Conocé el entorno</strong><small>Miralo en imágenes reales del proyecto.</small></span></div>
      </div></div>
      <div className="intro-photo"><Photo src={images[1].src} alt={images[1].alt}/><div className="photo-note"><span className="note-icon"><CheckCircle2 size={20}/></span><span><strong>Conocé el proyecto de cerca</strong><small>Agendá una visita y recibí asesoramiento.</small></span></div></div>
    </div></section>
    <section className="features-section section" id="caracteristicas"><div className="container"><div className="section-heading centered"><span className="eyebrow">Campos del Este · Fase III</span><h2 className="section-title">Principales características</h2><p className="section-lead">Conocé los aspectos clave de la urbanización antes de elegir tu terreno.</p></div><div className="features-grid">
      <article className="feature-card"><div className="feature-icon"><FileCheck2 size={25}/></div><span className="feature-number">01</span><h3>Seguridad legal</h3><p>Todos los terrenos ya están individualizados con su propio Alodial, Catastral y Planos de uso de Suelos (Municipio de Santa Cruz de la Sierra).</p></article>
      <article className="feature-card"><div className="feature-icon"><BusFront size={25}/></div><span className="feature-number">02</span><h3>Ubicación, accesos y transporte</h3><ul><li>Entre el 9.º y 10.º anillo, sobre las avenidas CUMAVI y LIBERTADORES.</li><li>Diagonal al Centro de Alto Rendimiento Bolivia 2022.</li><li>Los accesos principales ya están enlosetados o pavimentados.</li><li>La línea de micro 98 (verde con blanco) llega hasta la entrada a la urbanización, con trasbordo en el Condominio Ciudad del Este.</li></ul></article>
      <article className="feature-card"><div className="feature-icon"><Waves size={25}/></div><span className="feature-number">03</span><h3>Club House</h3><p className="feature-highlight">Sin expensas ni mantenimiento mensual.</p><p>La urbanización contará con un Club House con:</p><ul><li>Piscina para adultos y niños</li><li>Churrasqueras</li><li>Canchas</li><li>Salón de eventos</li></ul><div className="feature-fee"><strong>Ingreso al Club House</strong><span>Bs 10 adultos · Bs 5 niños</span></div></article>
    </div></div></section>
    <section className="video-section section" id="video"><div className="container video-grid"><div className="video-copy">
      <span className="eyebrow">Conocé Campos del Este</span><h2 className="section-title">Antes de elegir, conocé el proyecto.</h2><p className="section-lead">Mirá la presentación y después consultá las alternativas de compra que se ajusten a tu plan.</p><CTA/>
    </div><div className="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/-xsqWpOnNpI?rel=0" title="Presentación de Campos del Este Fase III" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/><a className="video-external" href={PRESENTATION_VIDEO} target="_blank" rel="noreferrer">Ver en YouTube <ArrowRight size={15}/></a></div></div></section>
    <section className="gallery-section section"><div className="container"><div className="section-heading"><span className="eyebrow">Imágenes reales</span><h2 className="section-title">Así se ve Campos del Este.</h2><p className="section-lead">Fotografías compartidas del proyecto. La disponibilidad de cada lote debe confirmarse al momento de la consulta.</p></div>
      <div className="gallery-grid gallery-three">{images.map((image,index)=><div key={image.src} className={`gallery-item ${index===0?"gallery-main":""}`}><Photo src={image.src} alt={image.alt}/></div>)}</div>
    </div></section>
    <section className="pricing section" id="precios"><div className="container">
      <div className="section-heading centered"><span className="eyebrow">Alternativas de compra</span><h2 className="section-title">Elegí cómo querés comprar.</h2><p className="section-lead">Valores de referencia compartidos para un lote. Los montos pueden variar según su ubicación, características y condiciones vigentes.</p></div>
      <div className="price-cards">
        <article className="price-card cash-card"><div className="price-icon"><CircleDollarSign size={25}/></div><span className="price-label">COMPRA AL CONTADO</span><h3>US$ 15.500</h3><p>Precio de venta al contado - Varia según sector</p><CTA className="btn-light"/></article>
        <article className="price-card finance-card"><div className="price-icon"><Clock3 size={25}/></div><span className="price-label">COMPRA A PLAZO</span><h3>Hasta 10 años</h3><p>Elegí el plazo que preferís y consultá las condiciones aplicables a cada lote.</p><a className="btn btn-white" href="#tabla-financiacion">Ver planes <ArrowRight size={17}/></a></article>
      </div>
      <div className="financing-table-wrap" id="tabla-financiacion"><div className="table-title"><div><span className="eyebrow">Compará alternativas</span><h3>Planes de financiación</h3></div><span className="table-usd">Importes en USD</span></div>
        <div className="table-scroll"><table className="financing-table"><thead><tr><th>Plazo</th><th>Cuota inicial</th><th>Cuota mensual</th><th>Total deuda</th></tr></thead><tbody>{FINANCING_PLANS.map((plan)=><tr key={plan.years}><th scope="row">{plan.years} {plan.years===1?"año":"años"}</th><td>{plan.initial.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>{plan.monthly.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td><td>{plan.total.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2})}</td></tr>)}</tbody></table></div>
        <CTA/>
      </div>
    </div></section>
    <section className="lead-section section" id="agendar"><div className="lead-decoration"><span/><span/><span/></div><div className="container lead-grid"><div className="lead-copy">
      <span className="eyebrow">Coordiná una visita</span><h2 className="section-title">Hablemos de tu próximo terreno.</h2><p>Respondé unas preguntas cortas para que podamos orientarte según tu presupuesto, forma de pago e intención de compra.</p>
      <div className="lead-assurance"><ShieldCheck size={20}/><span><strong>Primero registramos tu consulta</strong><small>Al finalizar, vas a poder abrir WhatsApp y coordinar la cita.</small></span></div>
    </div><div className="form-card"><LeadForm/></div></div></section>
    <section className="final-cta"><div className="container final-cta-inner"><div><span className="eyebrow">Campos del Este · Fase III</span><h2>El próximo paso empieza con una visita.</h2><p>Consultá precios, disponibilidad y alternativas de compra.</p></div><CTA/></div></section>
    <section className="location-image-section section" aria-labelledby="location-image-title"><div className="container"><h2 className="section-title" id="location-image-title">Ubicación Campos del Este</h2><img className="location-image" src="/images/ubicacion-campos-del-este%202.png.jpeg" alt="Mapa con la ubicación de Campos del Este"/></div></section>
    <footer className="site-footer"><div className="container footer-inner"><div className="footer-brand"><div className="footer-mark"><img src="/images/logo-campos-del-este.png.jpeg" alt="Campos del Este" loading="lazy"/></div><span>FASE III · SANTA CRUZ</span></div><p>Precios y disponibilidad sujetos a confirmación comercial. Las imágenes corresponden al material proporcionado para el proyecto.</p><span className="footer-contact-note">Completá el formulario para coordinar una visita</span></div><div className="container footer-bottom">© {new Date().getFullYear()} Campos del Este. Todos los derechos reservados.</div></footer>
  </main>;
}
