# Plataforma de Facturación Especial — Starken CL

Plataforma integral desarrollada en Next.js (App Router), TypeScript y Tailwind CSS para la gestión, validación y regularización de proformas comerciales con trazabilidad multi-versión y motor de resolución de SKUs en 3 niveles.

---

## 🚀 Principales Funcionalidades

1. **Gestión de Proformas y Estados:**
   * Aprobación / Rechazo con respaldo de correos y evidencia adjunta.
   * Flujo de estados: `Aprobada`, `Rechazada v1`, `Rechazada v2`, `Derivada a KAM`, `Enviado a Pricing` y `Pendiente de validación`.
   * Bloqueo inteligente al alcanzar rechazos en Versión V3 con derivación directa al Ejecutivo KAM (Key Account Manager), sin generar nunca una V4.

2. **Línea de Tiempo y Trazabilidad Multi-Versión:**
   * Acordeón horizontal interactivo (`V1`, `V2`, `V3`) con desglose de montos netos, fechas, motivos de discrepancia y descarga de documentos emitidos.

3. **Motor de Validación y Resolución de SKUs en 3 Tiers:**
   * **Tier 1 (Histórico Starken):** Auto-cruce contra el Maestro de Productos Físicos.
   * **Tier 2 (Agente IA Web Search):** Extracción automatizada de medidas con enlace a la fuente web.
   * **Tier 3 (Búsqueda Manual + Evidencia):** Carga obligatoria de URL y captura de respaldo de la ficha técnica.
   * Agrupación por SKU único para resolución masiva de 500+ Órdenes de Flete (OFs).

4. **Autenticación y Roles:**
   * Soporte para roles: `Analista`, `Jefatura`, `Administrador` y `Gerencia`.
   * Simulación de 2FA y registro de auditoría.

---

## 🛠️ Tecnologías Utilizadas

* **Framework:** Next.js 15 (App Router)
* **Lenguaje:** TypeScript
* **Estilos:** Tailwind CSS v4
* **Iconografía:** Lucide React
* **Temas:** Modo Claro / Modo Oscuro / Temas Corporativos

---

## 💻 Instalación y Ejecución Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) o el puerto asignado en tu navegador.
