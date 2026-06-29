import requests
import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth
from database import db
from routers import admin
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="JalasPe API - Monorepo")

# ================= CORS =================
origenes_permitidos = [
    "http://localhost:4200",          
    "https://jalaspe.web.app",        
    "https://jalaspe.firebaseapp.com" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origenes_permitidos,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# ================= SEGURIDAD JWT =================
security = HTTPBearer()

def obtener_usuario_actual(credenciales: HTTPAuthorizationCredentials = Depends(security)):
    token = credenciales.credentials
    try:
        usuario_decodificado = auth.verify_id_token(token)
        return usuario_decodificado
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )

# ================= MODELOS DE DATOS =================
class NuevoPlanData(BaseModel):
    titulo: str
    destino: str

class ActualizarPlanData(BaseModel):
    titulo: Optional[str] = None
    estado: Optional[str] = None # <-- NUEVO: Permitir cambiar estado

class MensajeChatData(BaseModel): # <-- NUEVO: Para recibir mensajes del chat
    mensaje: str

class ActualizarPerfilData(BaseModel):
    nombres: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    username: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    celular: Optional[str] = None
    pais: Optional[str] = None
    ciudad: Optional[str] = None
    direccion: Optional[str] = None

class NuevoProveedorData(BaseModel):
    razon_social: str
    nombre_comercial: str
    ruc: str
    categoria: str
    pais: Optional[str] = "Perú"
    ciudad: Optional[str] = ""
    estado: Optional[str] = "Activo"
    api_config: Optional[dict] = None

class ActualizarProveedorData(BaseModel):
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    ruc: Optional[str] = None
    categoria: Optional[str] = None
    pais: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    api_config: Optional[dict] = None

class NuevaRutaData(BaseModel):
    origen: str
    destino: str
    fecha_salida: str
    hora_salida: str
    tipo_vehiculo: str
    precio: float
    estado: Optional[str] = "Activo"

class NuevaHabitacionData(BaseModel):
    tipo: str
    capacidad: int
    precio_noche: float
    amenities: Optional[str] = ""
    estado: Optional[str] = "Disponible"

class NuevoPlatoData(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    categoria: str
    precio: float
    estado: Optional[str] = "Disponible"

class NuevoTourData(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    duracion: str
    precio: float
    estado: Optional[str] = "Disponible"

class ActualizarUsuarioAdminData(BaseModel):
    nombres: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    username: Optional[str] = None
    fecha_nacimiento: Optional[str] = None
    celular: Optional[str] = None
    pais: Optional[str] = None
    ciudad: Optional[str] = None
    direccion: Optional[str] = None
    perfil_completo: Optional[bool] = None

class ActualizarPlanAdminData(BaseModel):
    titulo: Optional[str] = None
    destino: Optional[str] = None
    estado: Optional[str] = None

class NuevoPaisData(BaseModel):
    nombre: str
    estado: Optional[str] = "Activo"

class NuevaCiudadData(BaseModel):
    nombre: str
    descripcion: Optional[str] = ""
    imagen_url: Optional[str] = ""
    estado: Optional[str] = "Activo"

class AjustesSistemaData(BaseModel):
    contacto_email: Optional[str] = None
    contacto_whatsapp: Optional[str] = None
    modo_mantenimiento: Optional[bool] = None
    mensaje_anuncio: Optional[str] = None
    modelos_disponibles: Optional[list] = None
    modelo_por_defecto: Optional[str] = None
    mensaje_bienvenida: Optional[str] = None
    openrouter_api_key: Optional[str] = None
    prompt_identidad: Optional[str] = None
    prompt_protocolo: Optional[str] = None
    prompt_guardrails: Optional[str] = None

# ================= RUTAS PRINCIPALES =================
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"estado": "Backend JalasPe Operativo", "db": "Firestore conectado"}

@app.post("/api/v1/auth/sync")
def sincronizar_usuario(usuario: dict = Depends(obtener_usuario_actual)):
    email = usuario.get("email")
    uid = usuario.get("uid")
    doc_ref = db.collection('usuarios').document(email)
    doc = doc_ref.get()
    if not doc.exists:
        doc_ref.set({
            'uid': uid, 'email': email, 'perfil_completo': False, 'nombres': '', 'apellidos': ''
        })
        return {"mensaje": "Nuevo usuario registrado en la base de datos", "nuevo": True}
    return {"mensaje": "El usuario ya existía en la base de datos", "nuevo": False}

# ==========================================
# PLANES Y VIAJES
# ==========================================

@app.get("/api/v1/planes")
def obtener_mis_planes(usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    docs = db.collection('planes').where('uid', '==', uid).stream()
    
    mis_planes = []
    for doc in docs:
        data = doc.to_dict()
        
        # Formatear la fecha a ISO
        if 'fecha_creacion' in data and data['fecha_creacion'] is not None:
            try:
                data['fecha_creacion'] = data['fecha_creacion'].isoformat()
            except Exception:
                pass
                
        mis_planes.append({"id": doc.id, **data})
            
    # Ordenar los planes: los más recientes arriba
    mis_planes.sort(key=lambda x: x.get('fecha_creacion', ''), reverse=True)
    return mis_planes

@app.get("/api/v1/viajes")
def obtener_mis_viajes(usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    docs = db.collection('planes').where('uid', '==', uid).stream()
    mis_viajes = [
        {"id": doc.id, **doc.to_dict()} 
        for doc in docs 
        if doc.to_dict().get("estado") in ["pagado", "confirmado"]
    ]
    return mis_viajes

@app.post("/api/v1/planes")
def crear_plan(payload: NuevoPlanData, usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    nuevo_plan = {
        "uid": uid, 
        "titulo": payload.titulo, 
        "destino": payload.destino, 
        "estado": "progreso",
        "fecha_creacion": datetime.datetime.utcnow() # <-- ESTAMPA DE TIEMPO AGREGADA
    }
    doc_ref = db.collection('planes').document()
    doc_ref.set(nuevo_plan)
    return {"id": doc_ref.id, "mensaje": "Plan creado con éxito"}

@app.patch("/api/v1/planes/{plan_id}")
def actualizar_plan(plan_id: str, payload: ActualizarPlanData, usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    doc_ref = db.collection('planes').document(plan_id)
    if not doc_ref.get().exists or doc_ref.get().to_dict().get("uid") != uid:
        raise HTTPException(status_code=403, detail="No autorizado")
    
    # Extraer solo los datos que no son nulos
    datos_actualizar = {k: v for k, v in payload.dict().items() if v is not None}
    
    if datos_actualizar:
        doc_ref.update(datos_actualizar)
        
    return {"mensaje": "Plan actualizado correctamente"}

@app.get("/api/v1/planes/{plan_id}")
def obtener_plan(plan_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    doc_ref = db.collection('planes').document(plan_id)
    if not doc_ref.get().exists or doc_ref.get().to_dict().get("uid") != uid:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    plan_data = doc_ref.get().to_dict()
    plan_data["id"] = doc_ref.id
    return plan_data

@app.delete("/api/v1/planes/{plan_id}")
def eliminar_plan(plan_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    doc_ref = db.collection('planes').document(plan_id)
    if not doc_ref.get().exists or doc_ref.get().to_dict().get("uid") != uid:
        raise HTTPException(status_code=403, detail="No autorizado")
    doc_ref.delete()
    return {"mensaje": "Plan eliminado permanentemente"}

# ==========================================
# CEREBRO IA: ENDPOINTS DEL CHAT (NUEVOS)
# ==========================================

@app.get("/api/v1/planes/{plan_id}/mensajes")
def obtener_mensajes(plan_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    plan_ref = db.collection('planes').document(plan_id)
    
    if not plan_ref.get().exists or plan_ref.get().to_dict().get("uid") != uid:
        raise HTTPException(status_code=403, detail="No autorizado")
        
    mensajes_ref = plan_ref.collection('mensajes')
    mensajes_docs = list(mensajes_ref.order_by('fecha').get())
    
    # INYECCIÓN INTELIGENTE DEL MENSAJE DE BIENVENIDA
    if len(mensajes_docs) == 0:
        ajustes_doc = db.collection('sistema').document('configuracion').get()
        ajustes = ajustes_doc.to_dict() if ajustes_doc.exists else {}
        msj_bienvenida = ajustes.get("mensaje_bienvenida", "¡Hola {nombre}! Soy el Agente JalasPe, tu experto local...")
        
        # Obtener nombre real del viajero
        user_doc = db.collection('usuarios').document(usuario.get("email")).get()
        nombre = user_doc.to_dict().get("nombres", "Viajero") if user_doc.exists and user_doc.to_dict().get("nombres") else "Viajero"
        
        msj_bienvenida = msj_bienvenida.replace("{nombre}", nombre)
        
        # Guardar en Firestore para que sea el primer mensaje histórico
        mensajes_ref.add({
            "rol": "assistant",
            "contenido": msj_bienvenida,
            "fecha": datetime.datetime.utcnow()
        })
        # Recargar los documentos
        mensajes_docs = list(mensajes_ref.order_by('fecha').get())
    
    mensajes = [{"id": d.id, **d.to_dict()} for d in mensajes_docs]
    
    for msg in mensajes:
        if 'fecha' in msg and msg['fecha'] is not None:
            msg['fecha'] = msg['fecha'].isoformat()
            
    return mensajes

@app.post("/api/v1/planes/{plan_id}/chat")
def enviar_mensaje_chat(plan_id: str, payload: MensajeChatData, usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    plan_ref = db.collection('planes').document(plan_id)
    
    if not plan_ref.get().exists or plan_ref.get().to_dict().get("uid") != uid:
        raise HTTPException(status_code=403, detail="No autorizado")

    mensajes_ref = plan_ref.collection('mensajes')
    
    # 1. Guardar mensaje del usuario
    mensajes_ref.add({
        "rol": "user",
        "contenido": payload.mensaje,
        "fecha": datetime.datetime.utcnow()
    })

    # 2. Extraer configuración de la IA
    ajustes_doc = db.collection('sistema').document('configuracion').get()
    ajustes = ajustes_doc.to_dict() if ajustes_doc.exists else {}
    
    api_key = ajustes.get("openrouter_api_key", "")
    modelo = ajustes.get("modelo_por_defecto", "openai/gpt-4o-mini")
    prompt_identidad = ajustes.get("prompt_identidad", "")
    prompt_protocolo = ajustes.get("prompt_protocolo", "")
    prompt_guardrails = ajustes.get("prompt_guardrails", "")

    if not api_key:
        fallback_msg = "El equipo de JalasPe está afinando mis motores. Aún no tengo una llave de OpenRouter configurada."
        mensajes_ref.add({"rol": "assistant", "contenido": fallback_msg, "fecha": datetime.datetime.utcnow()})
        return {"respuesta": fallback_msg}

    # 3. Ensamblar Contexto Dinámico (Catálogo de Proveedores)
    contexto_inventario = "\n\n--- INVENTARIO Y SERVICIOS DISPONIBLES EN JALASPE ---\n"
    proveedores = db.collection('proveedores').where("estado", "==", "Activo").stream()
    for prov in proveedores:
        p_data = prov.to_dict()
        pid = prov.id
        contexto_inventario += f"\nProveedor: {p_data.get('nombre_comercial')} | Categoría: {p_data.get('categoria')} | Ciudad: {p_data.get('ciudad')}\n"
        
        if p_data.get('categoria') == 'Transporte':
            rutas = db.collection('proveedores').document(pid).collection('rutas').where("estado", "==", "Activo").stream()
            for r in rutas:
                r_data = r.to_dict()
                contexto_inventario += f"  - RUTA: {r_data.get('origen')} a {r_data.get('destino')} | Vehículo: {r_data.get('tipo_vehiculo')} | Precio: {r_data.get('precio')}\n"
        
        elif p_data.get('categoria') == 'Hospedaje':
            habs = db.collection('proveedores').document(pid).collection('habitaciones').where("estado", "==", "Disponible").stream()
            for h in habs:
                h_data = h.to_dict()
                contexto_inventario += f"  - HABITACIÓN: {h_data.get('tipo')} | Capacidad: {h_data.get('capacidad')} | Noche: {h_data.get('precio_noche')}\n"

        elif p_data.get('categoria') == 'Restaurante':
            platos = db.collection('proveedores').document(pid).collection('platos').where("estado", "==", "Disponible").stream()
            for p in platos:
                pl_data = p.to_dict()
                contexto_inventario += f"  - PLATO: {pl_data.get('nombre')} ({pl_data.get('categoria')}) | Precio: {pl_data.get('precio')}\n"

        elif p_data.get('categoria') == 'Operador Turístico':
            tours = db.collection('proveedores').document(pid).collection('tours').where("estado", "==", "Disponible").stream()
            for t in tours:
                t_data = t.to_dict()
                contexto_inventario += f"  - TOUR: {t_data.get('nombre')} | Duración: {t_data.get('duracion')} | Precio: {t_data.get('precio')}\n"

    # 4. Construir Prompt del Sistema y traer historial
    system_prompt = f"{prompt_identidad}\n\n{prompt_protocolo}\n\n{prompt_guardrails}{contexto_inventario}"
    
    # Traer últimos 15 mensajes para mantener contexto sin desbordar tokens
    historial_docs = mensajes_ref.order_by("fecha").limit_to_last(15).get()
    mensajes_ia = [{"role": "system", "content": system_prompt}]
    
    for doc in historial_docs:
        data = doc.to_dict()
        mensajes_ia.append({"role": data["rol"], "content": data["contenido"]})

    # 5. Llamada a OpenRouter
    headers = {
        "Authorization": f"Bearer {api_key}",
        "HTTP-Referer": "https://jalaspe.web.app",
        "X-Title": "JalasPe",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": modelo,
        "messages": mensajes_ia,
        "temperature": 0.2
    }
    
    try:
        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=data)
        if response.status_code == 200:
            ia_respuesta = response.json()["choices"][0]["message"]["content"]
        else:
            ia_respuesta = f"Hubo un error con la conexión a la IA (Status {response.status_code})."
    except Exception as e:
        ia_respuesta = "Lo siento, tuve un problema interno de red al intentar pensar tu respuesta."

    # 6. Guardar y retornar respuesta
    mensajes_ref.add({
        "rol": "assistant",
        "contenido": ia_respuesta,
        "fecha": datetime.datetime.utcnow()
    })
    
    return {"respuesta": ia_respuesta}


# ==========================================
# PERFIL
# ==========================================

@app.get("/api/v1/perfil")
def obtener_perfil(usuario: dict = Depends(obtener_usuario_actual)):
    email = usuario.get("email")
    doc = db.collection('usuarios').document(email).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return doc.to_dict()

@app.patch("/api/v1/perfil")
def actualizar_perfil(payload: ActualizarPerfilData, usuario: dict = Depends(obtener_usuario_actual)):
    email = usuario.get("email")
    datos_actualizar = {k: v for k, v in payload.dict().items() if v is not None}
    datos_actualizar['perfil_completo'] = True
    if datos_actualizar:
        db.collection('usuarios').document(email).update(datos_actualizar)
    return {"mensaje": "Perfil actualizado exitosamente"}

# ==========================================
# GESTIÓN DE PROVEEDORES (ADMIN STAFF)
# ==========================================

@app.get("/api/v1/proveedores")
def obtener_proveedores(usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    docs = db.collection('proveedores').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@app.post("/api/v1/proveedores")
def crear_proveedor(payload: NuevoProveedorData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    nuevo_proveedor = payload.dict()
    nuevo_proveedor["creado_por"] = usuario.get("uid")
    doc_ref = db.collection('proveedores').document()
    doc_ref.set(nuevo_proveedor)
    return {"id": doc_ref.id, "mensaje": "Proveedor registrado"}

@app.patch("/api/v1/proveedores/{proveedor_id}")
def actualizar_proveedor(proveedor_id: str, payload: ActualizarProveedorData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('proveedores').document(proveedor_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    datos_actualizar = {k: v for k, v in payload.dict().items() if v is not None}
    if datos_actualizar:
        doc_ref.update(datos_actualizar)
    return {"mensaje": "Proveedor actualizado"}

@app.delete("/api/v1/proveedores/{proveedor_id}")
def eliminar_proveedor(proveedor_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('proveedores').document(proveedor_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    doc_ref.delete()
    return {"mensaje": "Proveedor eliminado"}

@app.get("/api/v1/proveedores/{proveedor_id}")
def obtener_proveedor(proveedor_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('proveedores').document(proveedor_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return {"id": doc_ref.id, **doc_ref.get().to_dict()}

# ==========================================
# INVENTARIO DINÁMICO
# ==========================================

@app.get("/api/v1/proveedores/{proveedor_id}/habitaciones")
def obtener_habitaciones(proveedor_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    docs = db.collection('proveedores').document(proveedor_id).collection('habitaciones').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@app.post("/api/v1/proveedores/{proveedor_id}/habitaciones")
def crear_habitacion(proveedor_id: str, payload: NuevaHabitacionData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('proveedores').document(proveedor_id).collection('habitaciones').document()
    doc_ref.set(payload.dict())
    return {"id": doc_ref.id, "mensaje": "Habitación registrada exitosamente"}

@app.delete("/api/v1/proveedores/{proveedor_id}/habitaciones/{habitacion_id}")
def eliminar_habitacion(proveedor_id: str, habitacion_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    db.collection('proveedores').document(proveedor_id).collection('habitaciones').document(habitacion_id).delete()
    return {"mensaje": "Habitación eliminada"}

@app.get("/api/v1/proveedores/{proveedor_id}/rutas")
def obtener_rutas(proveedor_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    docs = db.collection('proveedores').document(proveedor_id).collection('rutas').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@app.post("/api/v1/proveedores/{proveedor_id}/rutas")
def crear_ruta(proveedor_id: str, payload: NuevaRutaData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('proveedores').document(proveedor_id).collection('rutas').document()
    doc_ref.set(payload.dict())
    return {"id": doc_ref.id, "mensaje": "Ruta registrada exitosamente"}

@app.delete("/api/v1/proveedores/{proveedor_id}/rutas/{ruta_id}")
def eliminar_ruta(proveedor_id: str, ruta_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    db.collection('proveedores').document(proveedor_id).collection('rutas').document(ruta_id).delete()
    return {"mensaje": "Ruta eliminada"}

@app.get("/api/v1/proveedores/{proveedor_id}/platos")
def obtener_platos(proveedor_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    docs = db.collection('proveedores').document(proveedor_id).collection('platos').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@app.post("/api/v1/proveedores/{proveedor_id}/platos")
def crear_plato(proveedor_id: str, payload: NuevoPlatoData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('proveedores').document(proveedor_id).collection('platos').document()
    doc_ref.set(payload.dict())
    return {"id": doc_ref.id, "mensaje": "Plato registrado exitosamente"}

@app.delete("/api/v1/proveedores/{proveedor_id}/platos/{plato_id}")
def eliminar_plato(proveedor_id: str, plato_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    db.collection('proveedores').document(proveedor_id).collection('platos').document(plato_id).delete()
    return {"mensaje": "Plato eliminado"}

@app.get("/api/v1/proveedores/{proveedor_id}/tours")
def obtener_tours(proveedor_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    docs = db.collection('proveedores').document(proveedor_id).collection('tours').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@app.post("/api/v1/proveedores/{proveedor_id}/tours")
def crear_tour(proveedor_id: str, payload: NuevoTourData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('proveedores').document(proveedor_id).collection('tours').document()
    doc_ref.set(payload.dict())
    return {"id": doc_ref.id, "mensaje": "Tour registrado exitosamente"}

@app.delete("/api/v1/proveedores/{proveedor_id}/tours/{tour_id}")
def eliminar_tour(proveedor_id: str, tour_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    db.collection('proveedores').document(proveedor_id).collection('tours').document(tour_id).delete()
    return {"mensaje": "Tour eliminado"}

# ==========================================
# MONITOREO DE USUARIOS Y PLANES (STAFF)
# ==========================================

@app.get("/api/v1/admin/usuarios")
def obtener_todos_usuarios(usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado. Solo Staff.")
    docs = db.collection('usuarios').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@app.patch("/api/v1/admin/usuarios/{email}")
def admin_actualizar_usuario(email: str, payload: ActualizarUsuarioAdminData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('usuarios').document(email)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    datos_actualizar = {k: v for k, v in payload.dict().items() if v is not None}
    if datos_actualizar:
        doc_ref.update(datos_actualizar)
    return {"mensaje": "Usuario actualizado exitosamente"}

@app.delete("/api/v1/admin/usuarios/{email}")
def admin_eliminar_usuario(email: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    db.collection('usuarios').document(email).delete()
    return {"mensaje": "Perfil de usuario eliminado"}

@app.get("/api/v1/admin/planes")
def obtener_todos_planes(usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado. Solo Staff.")
    docs = db.collection('planes').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@app.patch("/api/v1/admin/planes/{plan_id}")
def admin_actualizar_plan(plan_id: str, payload: ActualizarPlanAdminData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('planes').document(plan_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
    datos_actualizar = {k: v for k, v in payload.dict().items() if v is not None}
    if datos_actualizar:
        doc_ref.update(datos_actualizar)
    return {"mensaje": "Plan actualizado exitosamente"}

@app.delete("/api/v1/admin/planes/{plan_id}")
def admin_eliminar_plan(plan_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    db.collection('planes').document(plan_id).delete()
    return {"mensaje": "Plan eliminado permanentemente"}

# ==========================================
# GEOGRAFÍA: PAÍSES Y CIUDADES
# ==========================================

@app.get("/api/v1/admin/paises")
def obtener_paises():
    docs = db.collection('paises').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@app.post("/api/v1/admin/paises")
def crear_pais(payload: NuevoPaisData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('paises').document()
    doc_ref.set(payload.dict())
    return {"id": doc_ref.id, "mensaje": "País creado exitosamente"}

@app.delete("/api/v1/admin/paises/{pais_id}")
def eliminar_pais(pais_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    db.collection('paises').document(pais_id).delete()
    return {"mensaje": "País eliminado"}

@app.get("/api/v1/admin/paises/{pais_id}/ciudades")
def obtener_ciudades(pais_id: str):
    docs = db.collection('paises').document(pais_id).collection('ciudades').stream()
    return [{"id": doc.id, **doc.to_dict()} for doc in docs]

@app.post("/api/v1/admin/paises/{pais_id}/ciudades")
def crear_ciudad(pais_id: str, payload: NuevaCiudadData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('paises').document(pais_id).collection('ciudades').document()
    doc_ref.set(payload.dict())
    return {"id": doc_ref.id, "mensaje": "Ciudad creada exitosamente"}

@app.delete("/api/v1/admin/paises/{pais_id}/ciudades/{ciudad_id}")
def eliminar_ciudad(pais_id: str, ciudad_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    db.collection('paises').document(pais_id).collection('ciudades').document(ciudad_id).delete()
    return {"mensaje": "Ciudad eliminada"}

# ==========================================
# AJUSTES DEL SISTEMA E INTELIGENCIA ARTIFICIAL
# ==========================================

@app.get("/api/v1/admin/ajustes")
def obtener_ajustes(usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('sistema').document('configuracion')
    doc = doc_ref.get()
    
    if not doc.exists:
        default_config = {
            "contacto_email": "hola@jalas.pe",
            "contacto_whatsapp": "+51999999999",
            "modo_mantenimiento": False,
            "mensaje_anuncio": "",
            "modelos_disponibles": [
                "mistralai/mistral-medium-3-5", 
                "openai/gpt-4o-mini", 
                "anthropic/claude-haiku-latest", 
                "google/gemma-4-26b-a4b-it:free"
            ],
            "modelo_por_defecto": "openai/gpt-4o-mini",
            "mensaje_bienvenida": "¡Hola {nombre}! Soy el Agente JalasPe 🦙, tu experto local de viajes. Estoy listo para armarte una aventura a medida con nuestras mejores opciones. Para empezar, cuéntame: ¿A qué destino te gustaría ir, en qué fechas exactas viajas y cuál es tu presupuesto aproximado?",
            "openrouter_api_key": "",
            "prompt_identidad": "Eres el 'Agente JalasPe', el asistente virtual oficial de turismo de la plataforma JalasPe. Tu tarea es armar un paquete a medida para un viajero. Eres amable, profesional y usas un español neutro. ESTRICTAMENTE PROHIBIDO usar palabras como 'che', 'pibe', 'tío', 'guay' o jergas de otros países. Si quieres sonar cercano, limítate a usar un sutil '¡Bacán!' o '¡Genial!'. Sé conciso y directo en tus respuestas.",
            "prompt_protocolo": "Sigue ESTRICTAMENTE este orden y no avances al siguiente paso hasta cumplir el actual:\n1. Valida Destino, Fechas y Presupuesto. NUNCA asumas el año de las fechas (exige Día, Mes y Año). Exige siempre la MONEDA del presupuesto (Soles o Dólares). Si falta un dato, pregúntalo.\n2. SOLO cuando tengas Fechas con año y Presupuesto con moneda, ofrece opciones de BUSES / TRANSPORTE. Espera elección.\n3. Luego ofrece HOSPEDAJES (Destacando Turismo Vivencial si está disponible). Espera elección.\n4. Luego ofrece TOURS / ACTIVIDADES. Espera elección.\n5. Finalmente pide Nombre completo y DNI del pasajero para la reserva.",
            "prompt_guardrails": "REGLA DE ORO: Solo puedes ofrecer los servicios de transporte, hoteles, restaurantes y actividades que se te proporcionen en el contexto JSON inyectado en este chat. Si el usuario pide un servicio que no está en el catálogo, discúlpate amablemente y ofrece las alternativas disponibles. Mantén tu formato de extracción de JSON siempre actualizado con las elecciones del usuario."
        }
        doc_ref.set(default_config)
        return default_config
    return doc.to_dict()

@app.patch("/api/v1/admin/ajustes")
def actualizar_ajustes(payload: AjustesSistemaData, usuario: dict = Depends(obtener_usuario_actual)):
    if usuario.get("email") != "admin@jalas.pe":
        raise HTTPException(status_code=403, detail="Acceso denegado")
    doc_ref = db.collection('sistema').document('configuracion')
    datos_actualizar = {k: v for k, v in payload.dict().items() if v is not None}
    if datos_actualizar:
        doc_ref.update(datos_actualizar)
    return {"mensaje": "Ajustes del sistema actualizados"}