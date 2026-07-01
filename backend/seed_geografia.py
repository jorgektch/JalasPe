import json
import firebase_admin
from firebase_admin import credentials, firestore

# 1. Inicializar la conexión segura con Firebase
# Asegúrate de que serviceAccountKey.json esté en la misma ruta que este script
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("✅ Conexión a Firestore establecida.")
except Exception as e:
    print(f"❌ Error al conectar con Firebase: {e}")
    exit()

def poblar_geografia(ruta_json):
    print("Iniciando el proceso de población de datos (Seeding)...")
    
    # 2. Leer el archivo JSON
    try:
        with open(ruta_json, 'r', encoding='utf-8') as archivo:
            data = json.load(archivo)
    except FileNotFoundError:
        print(f"❌ No se encontró el archivo: {ruta_json}")
        return

    # 3. Recorrer y registrar países
    for pais in data.get("paises", []):
        nombre_pais = pais.get("nombre")
        
        # Generamos un ID amigable para el país (ej: "Perú" -> "peru")
        # Esto evita que se creen países duplicados si corres el script 2 veces
        pais_id = nombre_pais.lower().replace(" ", "_").replace("ú", "u").replace("é", "e").replace("í", "i")
        
        pais_ref = db.collection("paises").document(pais_id)
        pais_ref.set({
            "nombre": nombre_pais,
            "estado": "Activo"
        })
        print(f"\n🌍 País registrado: {nombre_pais} (ID: {pais_id})")

        # 4. Recorrer y registrar las ciudades de este país
        for ciudad in pais.get("ciudades", []):
            nombre_ciudad = ciudad.get("nombre")
            
            # Guardamos la ciudad en una colección global 'ciudades'
            # y le asignamos el 'pais_id' como llave foránea
            ciudad_ref = db.collection("ciudades").document()
            
            ciudad_data = {
                "id": ciudad_ref.id,
                "nombre": nombre_ciudad,
                "pais_id": pais_id,
                "estado": "Activo"
            }
            
            # Añadir campos dinámicos si existen en el JSON (como la región)
            if "region" in ciudad:
                ciudad_data["region"] = ciudad["region"]

            ciudad_ref.set(ciudad_data)
            print(f"   ↳ 🏙️ Ciudad registrada: {nombre_ciudad}")

if __name__ == "__main__":
    # Ejecutar la función apuntando al archivo JSON que creamos
    poblar_geografia("geografia.json")
    print("\n🚀 ¡Población de base de datos completada con éxito!")