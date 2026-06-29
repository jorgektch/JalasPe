import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from dotenv import load_dotenv

load_dotenv()

# Evitar inicialización múltiple (Crucial para Cloud Run y recargas locales)
if not firebase_admin._apps:
    cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
    
    if cred_path and os.path.exists(cred_path):
        # MODO LOCAL: Usa el archivo JSON
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
        print("🟢 Firebase conectado (Modo Local con Credenciales)")
    else:
        # MODO PRODUCCIÓN (Cloud Run): Inyección automática de seguridad de Google
        firebase_admin.initialize_app()
        print("🟢 Firebase conectado (Modo Producción en Nube / ADC)")

# Exportamos las instancias para que toda la app las use
db = firestore.client()