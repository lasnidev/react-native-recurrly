import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

interface SubscriptionContextValue {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({ children }: PropsWithChildren) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = useCallback((subscription: Subscription) => {
    setSubscriptions((current) => [subscription, ...current]);
  }, []);

  const value = useMemo(
    () => ({
      subscriptions,
      addSubscription,
    }),
    [subscriptions, addSubscription],
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptions() {
  const context = useContext(SubscriptionContext);

  if (!context) {
    throw new Error("useSubscriptions must be used within SubscriptionProvider");
  }

  return context;
}
