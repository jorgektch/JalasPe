# backend/seed.py
import json
from database import db

def cargar_json_a_firestore(nombre_archivo, nombre_coleccion):
    try:
        with open(nombre_archivo, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
            # Firestore funciona con diccionarios. 
            # Recorremos la lista del JSON y agregamos cada elemento como un documento.
            for item in data:
                # Usaremos un campo del item como ID (ej. el nombre) o dejaremos que Firebase cree uno
                doc_ref = db.collection(nombre_coleccion).document()
                doc_ref.set(item)
                
        print(f"✅ Data de {nombre_archivo} subida a la colección '{nombre_coleccion}'")
    except Exception as e:
        print(f"❌ Error con {nombre_archivo}: {e}")

if __name__ == "__main__":
    print("Iniciando migración a Firestore...")
    cargar_json_a_firestore('transportes.json', 'transportes')
    cargar_json_a_firestore('hospedajes.json', 'hospedajes')
    cargar_json_a_firestore('operadores.json', 'operadores')