<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/b46f1a75-29df-4ee3-b6a9-359e4832c294

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Actualización de registros

En Utilidades: A prepara la importación de Excel, B exporta todos los registros y C vacía la base tras confirmar. El archivo se valida completo antes de reemplazar datos. Se admiten columnas Mes, Año (o Ano), Persona, Trabajo Realizado y Categoría (opcional). No es necesario limpiar antes de importar.

El reemplazo reutiliza documentos y se confirma en un único batch junto con la fecha de actualización. Por seguridad se rechazan reemplazos que requieran más de 499 documentos de registros; se conserva la base original. Los totales y gráficas siempre consideran todos los resultados filtrados, no solo la página visible.

Las categorías se guardan en `workEntries.categoria`. La fecha se guarda en `appMetadata/workEntries.updatedAt` usando la hora del servidor. Las reglas de Firestore deben permitir las operaciones previstas sobre ambas rutas; las reglas desplegadas no se modifican al publicar el frontend. No se crean cuentas ni se incorpora autenticación.

Para una revisión aislada, compilar con `VITE_REVIEW_MODE=true`. Ese modo completa categorías faltantes de registros coincidentes usando el Excel de revisión, mantiene las modificaciones de datos solo en memoria y no escribe en Firebase. No usar esta variable en producción: los registros reales se categorizan al importar el Excel aprobado.

Verificación: `npx tsc --noEmit`, `node --test tests/filter-entries.test.cjs` y `npm run build`.
