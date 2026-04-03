import { firebaseCollections, firebaseConfig, firebaseEnabled } from "./firebase-config.js";

let firestoreInstance = null;

export async function initializeFirebase() {
  if (!firebaseEnabled || !firebaseConfig.projectId) {
    return { enabled: false, db: null, collections: firebaseCollections };
  }

  if (firestoreInstance) {
    return { enabled: true, db: firestoreInstance, collections: firebaseCollections };
  }

  const [{ initializeApp }, { getFirestore }] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js")
  ]);

  const app = initializeApp(firebaseConfig);
  firestoreInstance = getFirestore(app);

  return { enabled: true, db: firestoreInstance, collections: firebaseCollections };
}

export async function addFirestoreDoc(db, collectionName, payload) {
  const { addDoc, collection, serverTimestamp } = await import(
    "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js"
  );

  return addDoc(collection(db, collectionName), {
    ...payload,
    createdAt: serverTimestamp()
  });
}
