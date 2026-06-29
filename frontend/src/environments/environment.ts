export const environment = {
  production: true,
  apiUrl: '', // <-- IMPORTANTE: Debe estar vacío para usar el Rewrite de Firebase
  firebaseConfig: {
    apiKey: "AIzaSyBwxIxfVsTVmHNPzuPAOBTggv15cXFAG44",
    authDomain: "jalaspe.firebaseapp.com",
    projectId: "jalaspe",
    storageBucket: "jalaspe.firebasestorage.app",
    messagingSenderId: "229008340318",
    appId: "1:229008340318:web:c73702b3cbff5c39ec8bcf",
    measurementId: "G-8Q70PRHCSF"
  },
  // Apuntamos temporalmente al puerto 8000 (FastAPI) mientras desarrollamos en local
  apiUrl: "http://localhost:8000" 
};