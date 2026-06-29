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
    titulo: str

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
    api_config: Optional[dict] = None # <-- NUEVO: Para guardar credenciales

class ActualizarProveedorData(BaseModel):
    razon_social: Optional[str] = None
    nombre_comercial: Optional[str] = None
    ruc: Optional[str] = None
    categoria: Optional[str] = None
    pais: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    api_config: Optional[dict] = None # <-- NUEVO

class NuevaRutaData(BaseModel):
    origen: str
    destino: str
    fecha_salida: str  # <-- NUEVO
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

class NuevaRutaData(BaseModel):
    origen: str
    destino: str
    hora_salida: str
    tipo_vehiculo: str
    precio: float
    estado: Optional[str] = "Activo"

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

# NUEVOS ESQUEMAS PARA ADMIN DE USUARIOS Y PLANES
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

# NUEVOS ESQUEMAS PARA GEOGRAFÍA Y AJUSTES
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
    mensaje_bienvenida: Optional[str] = None # <-- NUEVO CAMPO

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

@app.get("/api/v1/planes")
def obtener_mis_planes(usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    docs = db.collection('planes').where('uid', '==', uid).stream()
    # Filtramos en Python para evitar exigir índices compuestos en Firestore
    mis_planes = [
        {"id": doc.id, **doc.to_dict()} 
        for doc in docs 
        if doc.to_dict().get("estado", "progreso") not in ["pagado", "confirmado"]
    ]
    return mis_planes

# NUEVO ENDPOINT PARA LA MOCHILA DEL VIAJERO
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
    nuevo_plan = {"uid": uid, "titulo": payload.titulo, "destino": payload.destino, "estado": "progreso"}
    doc_ref = db.collection('planes').document()
    doc_ref.set(nuevo_plan)
    return {"id": doc_ref.id, "mensaje": "Plan creado con éxito"}

@app.patch("/api/v1/planes/{plan_id}")
def actualizar_plan(plan_id: str, payload: ActualizarPlanData, usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    doc_ref = db.collection('planes').document(plan_id)
    if not doc_ref.get().exists or doc_ref.get().to_dict().get("uid") != uid:
        raise HTTPException(status_code=403, detail="No autorizado")
    doc_ref.update({"titulo": payload.titulo})
    return {"mensaje": "Nombre del plan actualizado"}

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
# GEOGRAFÍA: PAÍSES
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

# ==========================================
# GEOGRAFÍA: CIUDADES (Subcolección)
# ==========================================

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
            "mensaje_bienvenida": "¡Hola, {nombre}! Soy el asistente de Jalas.pe. ¿A dónde quieres viajar hoy?" # <-- VALOR POR DEFECTO
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