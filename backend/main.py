from fastapi import FastAPI
from database import db
from routers import admin

app = FastAPI(title="JalasPe API - Monorepo")

app.include_router(admin.router)

@app.get("/")
def read_root():
    return {"estado": "Backend JalasPe Operativo", "db": "Firestore conectado"}

# Ejemplo de cómo crearemos un usuario más adelante
@app.post("/api/usuarios/test")
def crear_usuario_test():
    doc_ref = db.collection('usuarios').document('demo@travel.com')
    doc_ref.set({
        'nombres': 'Viajero',
        'apellidos': 'Demo',
        'perfil_completo': False
    })
    return {"mensaje": "Usuario de prueba creado en Firestore"}

