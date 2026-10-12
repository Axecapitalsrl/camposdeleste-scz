# Campos del Este — Fase III

Landing page inmobiliaria para captación y calificación de potenciales compradores.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 y CSS responsive de marca
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

## Imágenes reales del proyecto

Ya se encuentran en `public/images/` los tres archivos de fotografía y el logo con estos nombres exactos:

- `logo-campos-del-este.png.jpeg`
- `fase3-aerea-1.jpg.jpeg`
- `fase3-aerea-2.jpg.jpeg`
- `fase3-aerea-3.jpg.jpeg`

No hay una cuarta fotografía. El plano original se subió como `public/images/plano-fase3.pdf.pdf` (GitHub conservó la extensión `.pdf` que ya tenía el nombre al volver a subirlo). La página ya apunta a ese nombre para mostrarlo en un visor PDF y abrirlo por separado.

## WhatsApp

El CTA usa el enlace facilitado: `https://wa.link/rrzy8g`. Tras guardar el lead en Supabase, la página ofrece abrir WhatsApp; hay que comprobar si el shortlink admite el parámetro de texto precompletado antes del lanzamiento.

## Estado

La landing y el formulario están implementados. Pendiente: cargar el PDF original, configurar Supabase, y verificar el build y el envío de un lead de prueba antes de publicar anuncios.
