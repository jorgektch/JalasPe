# backend/routers/admin.py
from fastapi import APIRouter, HTTPException
from database import db
from pydantic import BaseModel

router = APIRouter(prefix="/api/admin", tags=["Admin Panel"])

# Modelo genérico para recibir cualquier diccionario desde el Frontend
class ItemData(BaseModel):
    data: dict

@router.get("/{coleccion}")
def listar_items(coleccion: str):
    """Obtiene todos los documentos de una colección (transportes, hospedajes, operadores)"""
    docs = db.collection(coleccion).stream()
    resultados = []
    for doc in docs:
        item = doc.to_dict()
        item["id"] = doc.id  # Inyectamos el ID de Firestore para el Frontend
        resultados.append(item)
    return resultados

@router.post("/{coleccion}")
def crear_item(coleccion: str, payload: ItemData):
    """Crea un nuevo documento en la colección"""
    doc_ref = db.collection(coleccion).document()
    doc_ref.set(payload.data)
    return {"mensaje": "Item creado con éxito", "id": doc_ref.id}

@router.put("/{coleccion}/{doc_id}")
def actualizar_item(coleccion: str, doc_id: str, payload: ItemData):
    """Actualiza un documento existente"""
    doc_ref = db.collection(coleccion).document(doc_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="Item no encontrado")
    
    doc_ref.update(payload.data)
    return {"mensaje": "Item actualizado"}

@router.delete("/{coleccion}/{doc_id}")
def eliminar_item(coleccion: str, doc_id: str):
    """Elimina un documento"""
    db.collection(coleccion).document(doc_id).delete()
    return {"mensaje": "Item eliminado"}