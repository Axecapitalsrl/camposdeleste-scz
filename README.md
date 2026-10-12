# Campos del Este — Fase III

Landing page inmobiliaria para captación y calificación de potenciales compradores.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS v4 para estilos base + CSS responsive de marca
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

## Imágenes reales

Colocar los archivos aprobados del proyecto en `public/images/` con estos nombres:

- `logo-campos-del-este.png`
- `fase3-aerea-1.jpg`
- `fase3-aerea-2.jpg`
- `fase3-aerea-3.jpg`
- `fase3-aerea-4.jpg`
- `plano-fase3.jpg`

Usar exclusivamente fotos y planos reales suministrados del proyecto. El material subido en la conversación todavía debe copiarse a estos archivos dentro del repositorio antes del lanzamiento visual final.

## WhatsApp

El CTA final usa el enlace facilitado: `https://wa.link/rrzy8g`. Tras guardarse el lead en Supabase, se abre este enlace añadiendo un parámetro `text`; conviene verificar el comportamiento del shortlink antes del lanzamiento. Si wa.link ignora el texto, se puede reemplazar por un enlace `wa.me` que apunte al mismo número y mensaje precompletado.

## Estado

La página, la tabla de financiación y el flujo de calificación están implementados. Aún se requiere configurar Supabase y añadir los archivos reales de imagen descritos arriba, y después comprobar el build y el envío de un lead de prueba antes de publicar anuncios.