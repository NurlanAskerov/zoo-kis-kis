'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type CustomerProfile = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  note: string;
  deliveryPreference: string;
  petType: string;
  petName: string;
};

type CustomerProfileContextValue = {
  profile: CustomerProfile;
  setProfile: (profile: CustomerProfile) => void;
  updateProfile: (patch: Partial<CustomerProfile>) => void;
  isProfileReady: boolean;
};

const emptyProfile: CustomerProfile = {
  fullName: '',
  phone: '',
  address: '',
  city: 'Bakı',
  note: '',
  deliveryPreference: 'Ünvana çatdırılma',
  petType: '',
  petName: ''
};

const CustomerProfileContext = createContext<CustomerProfileContextValue | null>(null);


export function CustomerProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<CustomerProfile>(emptyProfile);


  function setProfile(next: CustomerProfile) {
    setProfileState(next);
  }

  function updateProfile(patch: Partial<CustomerProfile>) {
    setProfile({ ...profile, ...patch });
  }

  const value = useMemo(() => ({
    profile,
    setProfile,
    updateProfile,
    isProfileReady: Boolean(profile.fullName.trim() && profile.phone.trim())
  }), [profile]);

  return <CustomerProfileContext.Provider value={value}>{children}</CustomerProfileContext.Provider>;
}

export function useCustomerProfile() {
  const value = useContext(CustomerProfileContext);
  if (!value) throw new Error('useCustomerProfile must be used inside CustomerProfileProvider');
  return value;
}

export function formatProfileForWhatsapp(profile: CustomerProfile) {
  return [
    `Ad Soyad: ${profile.fullName || '-'}`,
    `Telefon: ${profile.phone || '-'}`,
    `Şəhər: ${profile.city || '-'}`,
    `Ünvan: ${profile.address || '-'}`,
    `Çatdırılma: ${profile.deliveryPreference || '-'}`,
    profile.petType ? `Heyvan: ${profile.petType}` : '',
    profile.petName ? `Heyvanın adı: ${profile.petName}` : '',
    profile.note ? `Qeyd: ${profile.note}` : ''
  ].filter(Boolean).join('\n');
}
