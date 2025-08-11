
// INSTRUCCIONES PARA ACTIVAR FIREBASE/FIRESTORE
// 1. Instala el paquete: npm install firebase
// 2. Crea un proyecto en https://console.firebase.google.com/
// 3. Copia la configuración de tu proyecto aquí:
/*
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
	apiKey: 'TU_API_KEY',
	authDomain: 'TU_AUTH_DOMAIN',
	projectId: 'TU_PROJECT_ID',
	storageBucket: 'TU_STORAGE_BUCKET',
	messagingSenderId: 'TU_MESSAGING_SENDER_ID',
	appId: 'TU_APP_ID',
};

const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
*/

// Cuando subas a producción, descomenta el bloque de arriba y elimina las líneas de abajo.
export const firestore = undefined;
