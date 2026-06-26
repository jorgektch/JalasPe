import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updatePassword, // <-- Nuevo
  EmailAuthProvider, // <-- Nuevo
  reauthenticateWithCredential // <-- Nuevo
} from 'firebase/auth'; 
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private app = initializeApp(environment.firebaseConfig);
  private auth = getAuth(this.app);

  constructor() { }

  registro(email: string, pass: string) {
    return createUserWithEmailAndPassword(this.auth, email, pass);
  }

  login(email: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, email, pass);
  }

  logout() {
    return signOut(this.auth);
  }

  getUsuarioActual() {
    return this.auth.currentUser;
  }

  esperarUsuarioAutenticado(): Promise<any> {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(this.auth, (user) => {
        unsubscribe(); 
        resolve(user); 
      });
    });
  }

  async getToken(): Promise<string | null> {
    const user = this.auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  }

  // === NUEVA FUNCIÓN: Cambiar Contraseña Segura ===
  async actualizarPassword(passActual: string, nuevaPass: string): Promise<void> {
    const user = this.auth.currentUser;
    if (!user || !user.email) throw new Error("No hay usuario autenticado");

    // 1. Reautenticar (Verificar que la contraseña actual es correcta)
    const credential = EmailAuthProvider.credential(user.email, passActual);
    await reauthenticateWithCredential(user, credential);

    // 2. Si la validación es exitosa, actualizamos a la nueva contraseña
    await updatePassword(user, nuevaPass);
  }
}