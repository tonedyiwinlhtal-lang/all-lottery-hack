import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
// Using enterprise database explicitly as per instruction
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

/**
 * Handle firestore missing perms safely
 */
export function handleFirestoreError(error: unknown) {
  console.error("Firestore Error:", error);
  if(error instanceof Error && error.message.includes('the client is offline')) {
    console.error("Please check your Firebase configuration.");
  }
}
