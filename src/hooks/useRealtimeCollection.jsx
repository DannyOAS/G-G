import { useEffect, useState } from 'react';
import { onSnapshot } from 'firebase/firestore';

export default function useRealtimeCollection(queryFactory, deps = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let unsubscribe = () => {};
    setLoading(true);
    try {
      const query = queryFactory();
      unsubscribe = onSnapshot(
        query,
        (snapshot) => {
          const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setData(items);
          setLoading(false);
        },
        (err) => {
          console.error(err);
          setError(err);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error(err);
      setError(err);
      setLoading(false);
    }
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, error };
}
