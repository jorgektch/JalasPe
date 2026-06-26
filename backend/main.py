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

# ================= RUTAS PRINCIPALES =================
app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"estado": "Backend JalasPe Operativo", "db": "Firestore conectado"}

@app.post("/api/v1/auth/sync")
def sincronizar_usuario(usuario: dict = Depends(obtener_usuario_actual)):
    """Sincroniza la identidad de Firebase con la BD de Firestore"""
    email = usuario.get("email")
    uid = usuario.get("uid")
    
    doc_ref = db.collection('usuarios').document(email)
    doc = doc_ref.get()
    
    if not doc.exists:
        doc_ref.set({
            'uid': uid,
            'email': email,
            'perfil_completo': False,
            'nombres': '',
            'apellidos': ''
        })
        return {"mensaje": "Nuevo usuario registrado en la base de datos", "nuevo": True}
    
    return {"mensaje": "El usuario ya existía en la base de datos", "nuevo": False}

@app.get("/api/v1/planes")
def obtener_mis_planes(usuario: dict = Depends(obtener_usuario_actual)):
    """Obtiene el listado de planes del usuario activo"""
    uid = usuario.get("uid")
    docs = db.collection('planes').where('uid', '==', uid).stream()
    
    mis_planes = []
    for doc in docs:
        plan = doc.to_dict()
        plan["id"] = doc.id 
        mis_planes.append(plan)
        
    return mis_planes

@app.post("/api/v1/planes")
def crear_plan(payload: NuevoPlanData, usuario: dict = Depends(obtener_usuario_actual)):
    """Crea un nuevo itinerario asociado al usuario"""
    uid = usuario.get("uid")
    nuevo_plan = {
        "uid": uid,
        "titulo": payload.titulo,
        "destino": payload.destino,
        "estado": "progreso"
    }
    
    doc_ref = db.collection('planes').document()
    doc_ref.set(nuevo_plan)
    
    return {"id": doc_ref.id, "mensaje": "Plan creado con éxito"}

@app.patch("/api/v1/planes/{plan_id}")
def actualizar_plan(plan_id: str, payload: ActualizarPlanData, usuario: dict = Depends(obtener_usuario_actual)):
    """Permite editar el nombre de un plan existente"""
    uid = usuario.get("uid")
    doc_ref = db.collection('planes').document(plan_id)
    doc = doc_ref.get()
    
    if not doc.exists or doc.to_dict().get("uid") != uid:
        raise HTTPException(status_code=403, detail="No autorizado o no encontrado")
        
    doc_ref.update({"titulo": payload.titulo})
    return {"mensaje": "Nombre del plan actualizado"}

# NUEVO ENDPOINT: Obtener los detalles de un plan específico
@app.get("/api/v1/planes/{plan_id}")
def obtener_plan(plan_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    uid = usuario.get("uid")
    doc_ref = db.collection('planes').document(plan_id)
    doc = doc_ref.get()
    
    # Verificamos que exista y pertenezca al usuario
    if not doc.exists or doc.to_dict().get("uid") != uid:
        raise HTTPException(status_code=404, detail="Plan no encontrado")
        
    plan_data = doc.to_dict()
    plan_data["id"] = doc.id
    return plan_data

# NUEVO ENDPOINT: Eliminar un plan
@app.delete("/api/v1/planes/{plan_id}")
def eliminar_plan(plan_id: str, usuario: dict = Depends(obtener_usuario_actual)):
    """Permite eliminar un plan y toda su información"""
    uid = usuario.get("uid")
    doc_ref = db.collection('planes').document(plan_id)
    doc = doc_ref.get()
    
    # Seguridad: Verificamos que el plan exista y le pertenezca a este usuario
    if not doc.exists or doc.to_dict().get("uid") != uid:
        raise HTTPException(status_code=403, detail="No autorizado o no encontrado")
        
    # Borramos el documento de Firestore
    doc_ref.delete()
    return {"mensaje": "Plan eliminado permanentemente"}

# NUEVO ENDPOINT: Obtener los datos del perfil del usuario
@app.get("/api/v1/perfil")
def obtener_perfil(usuario: dict = Depends(obtener_usuario_actual)):
    email = usuario.get("email")
    doc = db.collection('usuarios').document(email).get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
        
    return doc.to_dict()

# NUEVO ENDPOINT: Actualizar los datos del perfil
@app.patch("/api/v1/perfil")
def actualizar_perfil(payload: ActualizarPerfilData, usuario: dict = Depends(obtener_usuario_actual)):
    email = usuario.get("email")
    
    # Extraemos solo los campos que no sean nulos (los que el usuario realmente envió)
    datos_actualizar = {k: v for k, v in payload.dict().items() if v is not None}
    
    # Marcamos el perfil como completo
    datos_actualizar['perfil_completo'] = True
    
    if datos_actualizar:
        db.collection('usuarios').document(email).update(datos_actualizar)
        
    return {"mensaje": "Perfil actualizado exitosamente"}