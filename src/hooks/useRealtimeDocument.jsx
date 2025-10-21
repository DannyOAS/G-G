import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';

export default function useRealtimeDocument(db, collectionName, documentId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!db || !collectionName || !documentId) return;
    const ref = doc(db, collectionName, documentId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        setData(snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setError(err);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [db, collectionName, documentId]);

  return { data, loading, error };
}
