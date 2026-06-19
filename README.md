# Backend (techfluid) — Estructura y mapeo con Frontend

Resumen corto del backend y cómo se corresponde con el frontend.

- **Propósito**: API para gestionar verificaciones (KYC/validation).
- **Entrypoints**:
  - `src/index.ts` — exporta el worker/app para pruebas y wrangler.
    - `src/app/app.ts` — instancia Hono, CORS, salud y monta rutas.
- **Rutas expuestas**:
  - `/verification` — ruta principal montada desde `src/modules/verification/routes/verification.routes.ts`.
  - POST `/` — crear verificación
  - GET `/` — listar
  - GET `/:id` — obtener por id
  - PATCH `/:id/status` — actualizar estado
- **Validaciones y constantes**:
  - `src/domain/constants.ts` — patrones y `VALIDATION_STATUSES` compartidos.
    - `src/modules/verification/schemas/verification.schema.ts` — validaciones de entrada.
- **Persistencia**:
  - `src/modules/verification/repositories/verification.repository.ts` — D1 SQL fallback a memoria.
  - Tabla SQL esperada: `validations` (ver `migrations/0001_create_validations.sql`).
- **Tests**:
  - `test/index.jest.spec.ts` — suite principal de Jest (ESM + ts-jest).
  - Ejecutar: `pnpm exec jest --runInBand`.

Notas de mantenimiento

- No conservar artefactos compilados en `.wrangler/tmp` en el repositorio local.
- Mantener una única suite de tests para evitar expectativas contradictorias.

Próximos pasos propuestos (reversibles):

1. Separación de responsabilidades: `src/controllers`, `src/services`, `src/validators`, `src/infrastructure`, `src/domain`, `src/routes`, `src/middleware`.
2. Script de limpieza disponible: `pnpm run clean:wrangler` (borra `.wrangler/tmp`).

Si quieres, aplico la reorganización propuesta y agrego los scripts de limpieza.
