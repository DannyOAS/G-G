import React, { createContext, useContext } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useFirebase } from './FirebaseContext';
import useRealtimeCollection from '../hooks/useRealtimeCollection';
import { isWithinInterval } from 'date-fns';

const PromotionsContext = createContext([]);

export function PromotionsProvider({ children }) {
  const { db } = useFirebase();

  const { data: promotions } = useRealtimeCollection(
    () => query(collection(db, 'promotions'), where('isActive', '==', true)),
    [db]
  );

  const filtered = promotions.filter((promo) => {
    if (!promo.startDate || !promo.endDate) return true;
    try {
      return isWithinInterval(new Date(), {
        start: promo.startDate.toDate ? promo.startDate.toDate() : new Date(promo.startDate),
        end: promo.endDate.toDate ? promo.endDate.toDate() : new Date(promo.endDate),
      });
    } catch (error) {
      console.error('Promotion date parse error', error);
      return false;
    }
  });

  return <PromotionsContext.Provider value={filtered}>{children}</PromotionsContext.Provider>;
}

export function usePromotions() {
  return useContext(PromotionsContext);
}
