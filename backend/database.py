import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Inicialización segura para Firestore
def init_firebase():
    if not firebase_admin._apps:
        # En local, usaremos un archivo JSON descargado de Firebase.
        # En producción (GCP/Cloud Run), Firebase se autentica solo si omitimos el cred.
        cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
        
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("🟢 Firebase conectado (Modo Local con Credenciales)")
        else:
            # Esto funcionará automáticamente cuando esté desplegado en Cloud Run
            firebase_admin.initialize_app()
            print("🟢 Firebase conectado (Modo Nube / Application Default Credentials)")

init_firebase()
db = firestore.client()