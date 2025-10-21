import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { useFirebase } from '../context/FirebaseContext';

export function useFirestore() {
  const { db, storage } = useFirebase();

  const createDocument = (collectionName, data) => addDoc(collection(db, collectionName), { ...data, createdAt: serverTimestamp() });

  const updateDocument = (collectionName, id, data) => updateDoc(doc(db, collectionName, id), { ...data, updatedAt: serverTimestamp() });

  const deleteDocument = (collectionName, id) => deleteDoc(doc(db, collectionName, id));

  const getDocument = async (collectionName, id) => {
    const snapshot = await getDoc(doc(db, collectionName, id));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
  };

  const listDocuments = async (collectionName, options = {}) => {
    const { q } = options;
    const snapshot = await getDocs(q || collection(db, collectionName));
    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  };

  const uploadFile = async (path, file) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);
    await task;
    return getDownloadURL(storageRef);
  };

  const deleteFile = async (path) => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  };

  return {
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    listDocuments,
    uploadFile,
    deleteFile,
  };
}

export const queries = {
  services: (db) => query(collection(db, 'services'), orderBy('order', 'asc')),
  gallery: (db) => query(collection(db, 'gallery'), orderBy('order', 'asc')),
  bookings: (db, status) =>
    query(
      collection(db, 'bookings'),
      ...(status ? [where('status', '==', status)] : []),
      orderBy('appointmentStart', 'desc'),
      limit(100)
    ),
};
