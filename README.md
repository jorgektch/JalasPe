# 🦙 JalasPe: Plataforma Turística y Agente de Viajes IA

JalasPe es una plataforma SaaS integral (LegalTech/TravelTech) que revoluciona la planificación de viajes mediante un **Agente de Inteligencia Artificial**. Combina un panel administrativo robusto para la gestión de inventario dinámico (proveedores, hoteles, buses, tours) con una interfaz de usuario conversacional donde la IA diseña, cotiza y confirma itinerarios a medida utilizando datos en tiempo real.

---

## 🚀 Arquitectura y Stack Tecnológico

La aplicación está construida bajo una arquitectura orientada a microservicios y RAG (*Retrieval-Augmented Generation*), separando las responsabilidades cognitivas, de negocio y de interfaz.

### 💻 Frontend (Interfaz de Usuario y Panel Admin)
*   **Framework:** Angular (v16+)
*   **Estilos:** Tailwind CSS (Diseño *utility-first*, responsivo y moderno)
*   **Programación Reactiva:** RxJS (Manejo de estados asíncronos y observables)
*   **Hosting & Despliegue:** Firebase Hosting (Despliegue automatizado vía GitHub Actions)
*   **Módulos principales:** 
    *   Directorio de viajes y chat interactivo con UI/UX para estados de escritura IA.
    *   Panel de Administración para CRUD de Proveedores, Usuarios e Inventario geolocalizado.

### ⚙️ Backend (Cerebro y Lógica de Negocio)
*   **Framework:** FastAPI (Python 3.10+)
*   **Validación de Datos:** Pydantic (Tipado estricto para modelos de datos y payloads)
*   **Autenticación:** Firebase Auth (Validación de tokens JWT mediante `firebase-admin`)
*   **Servidor ASGI:** Uvicorn
*   **Despliegue:** Google Cloud Run (Contenedores Serverless) / Integración mediante Firebase Rewrites (`/api/**`).

### 🗄️ Base de Datos e Infraestructura
*   **Database:** Google Cloud Firestore (NoSQL, colecciones principales: `usuarios`, `planes`, `proveedores`, `sistema`, `paises`).
*   **Almacenamiento (Estado y Sesiones):** Diseño sin estado (Stateless) en el backend; el estado conversacional se persiste en los documentos de los `planes` en Firestore.

### 🧠 Motor Cognitivo IA (Capa RAG y Modelos)
*   **Orquestador de LLMs:** OpenRouter API
*   **Modelos Soportados:** 
    *   `openai/gpt-4o-mini` (Modelo por defecto para agilidad y razonamiento)
    *   `anthropic/claude-haiku-latest`
    *   `mistralai/mistral-medium-3-5`
    *   `google/gemma-4-26b-a4b-it:free`
*   **Ingeniería de Prompts (System Prompting):** Inyección dinámica dividida en tres pilares:
    1.  **Identidad y Guardrails:** Reglas estrictas de comportamiento, tono y restricciones de venta.
    2.  **Contexto del Viajero (Memoria a Largo Plazo):** Inyección del perfil del usuario (nombre, edad, documento) para personalización y auto-completado de reservas.
    3.  **RAG de Inventario (Memoria a Corto Plazo):** Inyección en tiempo real del catálogo de proveedores activos, rutas, hoteles y precios directamente desde Firestore.

---

## ✨ Características Principales para Demos

1.  **Motor RAG en Tiempo Real:** El Agente IA no inventa ni alucina viajes; consulta la base de datos de Firestore en cada interacción para ofrecer **solo** los servicios turísticos (Buses, Hoteles, Tours) que están con estado `Activo` o `Disponible` en el panel de administración.
2.  **Protocolo de Ventas por Fases:** La IA sigue un flujo estructurado (Destino -> Transporte -> Hospedaje -> Actividades -> Cierre) y detecta automáticamente cuándo el usuario ha completado el flujo para cambiar el estado del plan a "Listo para Pagar".
3.  **Reconocimiento de Usuario Inteligente:** El LLM lee el documento del perfil de Firestore, llamando al usuario por su nombre y evitando pedir documentos de identidad que ya estén registrados.
4.  **Panel Administrativo Integral:** Gestión total del catálogo. Si el administrador desactiva un proveedor o sube el precio de un plato en el panel de Angular, la IA adapta su discurso instantáneamente en el siguiente mensaje.
5.  **Pasarela de Pagos Híbrida:** Flujo simulado de pagos (Tarjeta y Yape/Plin) que sella el estado de la reserva y confirma el viaje.

---

## 🛠️ Configuración e Instalación Local

### Requisitos Previos
*   Node.js (v18+) y Angular CLI
*   Python (3.10+)
*   Cuenta de Google Cloud / Firebase y archivo de credenciales `serviceAccountKey.json`.
*   API Key de OpenRouter.

### 1. Levantar el Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configurar variables de entorno (.env)
# FIREBASE_CREDENTIALS_PATH=./serviceAccountKey.json
# OPENROUTER_API_KEY=tu_api_key

uvicorn main:app --reload --port 8000