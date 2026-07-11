'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type CustomerProfile = {
  fullName: string;
  phone: string;
  address: string;
  deliveryType: string;
  note: string;
  petName: string;
  petType: string;
};

type CustomerProfileContextValue = {
  profile: CustomerProfile;
  updateProfile: (patch: Partial<CustomerProfile>) => void;
  saveProfile: (next?: CustomerProfile) => void;
  resetProfile: () => void;
};

const emptyProfile: CustomerProfile = {
  fullName: '',
  phone: '',
  address: '',
  deliveryType: '',
  note: '',
  petName: '',
  petType: ''
};

const storageKey = 'zoo-kis-kis-customer-profile';
const CustomerProfileContext = createContext<CustomerProfileContextValue | null>(null);

function readProfile(): CustomerProfile {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return emptyProfile;
    return { ...emptyProfile, ...JSON.parse(raw) };
  } catch {
    return emptyProfile;
  }
}

export function CustomerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<CustomerProfile>(emptyProfile);

  useEffect(() => {
    setProfile(readProfile());
  }, []);

  const updateProfile = (patch: Partial<CustomerProfile>) => {
    setProfile(current => ({ ...current, ...patch }));
  };

  const saveProfile = (next?: CustomerProfile) => {
    const value = next ?? profile;
    setProfile(value);
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  };

  const resetProfile = () => {
    setProfile(emptyProfile);
    window.localStorage.removeItem(storageKey);
  };

  const value = useMemo(() => ({ profile, updateProfile, saveProfile, resetProfile }), [profile]);

  return <CustomerProfileContext.Provider value={value}>{children}</CustomerProfileContext.Provider>;
}

export function useCustomerProfile() {
  const ctx = useContext(CustomerProfileContext);
  if (!ctx) throw new Error('useCustomerProfile must be used inside CustomerProfileProvider');
  return ctx;
}
