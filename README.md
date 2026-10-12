# Campos del Este — Fase III

Landing page inmobiliaria para captación y calificación de potenciales compradores.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL) para leads
- Vercel para despliegue

## Configuración local

1. Instalar Node.js LTS.
2. Ejecutar `npm install`.
3. Copiar `.env.example` a `.env.local` y completar las variables de Supabase.
4. Ejecutar `npm run dev`.

La clave `SUPABASE_SERVICE_ROLE_KEY` es privada: configurarla únicamente como variable de entorno del servidor en Vercel. No subir secretos al repositorio.

## Supabase

Ejecutar `supabase/schema.sql` desde el SQL Editor del proyecto Supabase. La tabla `leads` no permite lectura pública; los envíos se procesan desde una ruta de servidor.

## Contenido visual

Colocar los archivos aprobados del proyecto en `public/images/` con estos nombres:

- `logo-campos-del-este.png`
- `fase3-aerea-1.jpg`
- `fase3-aerea-2.jpg`
- `fase3-aerea-3.jpg`
- `fase3-aerea-4.jpg`
- `plano-fase3.jpg`

Se deben usar únicamente fotos reales suministradas del proyecto. El código muestra fallbacks si todavía no se han agregado los archivos.

## WhatsApp

El CTA final usa el enlace facilitado: `https://wa.link/rrzy8g`. La información del formulario se guarda primero en Supabase y luego se ofrece el enlace a WhatsApp.
