import type { Metadata } from "next";
import "./globals.css";
import "./landing.css";

export const metadata: Metadata = {
  title: "Campos del Este | Fase III — Tu próximo terreno",
  description: "Conocé Campos del Este Fase III. Consultá opciones de compra al contado y planes de financiación y agendá una visita.",
  openGraph: { title: "Campos del Este — Fase III", description: "Tu próximo terreno puede estar acá.", type: "website" },
  other: { "facebook-domain-verification": "n44lkwwi0ju87uj8iugbes9g11mwwk" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
