'use client';

import { MessageCircle, X } from 'lucide-react';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { groomingServices } from '@/lib/data';
import { buildGroomingMessage, createWhatsAppUrl } from '@/lib/whatsapp';
import { useLanguage } from './LanguageProvider';
import { useCustomerProfile, type CustomerProfile } from './customer-profile';

function hasContact(profile: CustomerProfile) {
  return Boolean(profile.fullName.trim() && profile.phone.trim());
}

type Props = {
  children?: ReactNode;
  className?: string;
  buttonClassName?: string;
};

export function GroomingRequestButton({ children, className = '', buttonClassName = 'btn btn-primary' }: Props) {
  const { t, lang } = useLanguage();
  const { profile, setProfile } = useCustomerProfile();
  const services = groomingServices[lang];
  const [formProfile, setFormProfile] = useState<CustomerProfile>(profile);
  const [petType, setPetType] = useState(profile.petType || '');
  const [petName, setPetName] = useState(profile.petName || '');
  const [service, setService] = useState(services[0] ?? 'Grooming');
  const [preferredTime, setPreferredTime] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setFormProfile(profile);
    setPetType(profile.petType || '');
    setPetName(profile.petName || '');
  }, [profile]);

  useEffect(() => {
    setService(services[0] ?? 'Grooming');
  }, [services]);

  const message = useMemo(
    () => buildGroomingMessage(formProfile, petType, petName, service, preferredTime, lang),
    [formProfile, petType, petName, service, preferredTime, lang]
  );

  const whatsappUrl = useMemo(() => createWhatsAppUrl(message), [message]);
  const ready = hasContact(formProfile);

  function changeProfile<K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) {
    setFormProfile(current => ({ ...current, [key]: value }));
  }

  function submit() {
    const nextProfile = { ...formProfile, petType, petName };
    setProfile(nextProfile);
    setNotice(t('profileSaved'));
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    window.setTimeout(() => setModalOpen(false), 500);
  }

  return (
    <>
      <button type="button" className={`${buttonClassName} ${className}`.trim()} onClick={() => setModalOpen(true)}>
        <MessageCircle size={18} /> {children ?? t('applyNow')}
      </button>

      {mounted && modalOpen ? createPortal(
        <div className="modal-backdrop" role="presentation" onClick={() => setModalOpen(false)}>
          <div className="whatsapp-modal" role="dialog" aria-modal="true" aria-label={t('bookGrooming')} onClick={event => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setModalOpen(false)} aria-label={t('close')}>
              <X size={19} />
            </button>

            <p className="eyebrow modal-eyebrow">{t('bookGrooming')}</p>
            <h2 className="modal-title">{t('groomingModalTitle')}</h2>
            <p>{ready ? t('orderProfileFound') : t('orderProfileMissing')}</p>

            <div className="form-grid compact-form-grid">
              <input className="input" value={formProfile.fullName} onChange={event => changeProfile('fullName', event.target.value)} placeholder={t('fullName')} />
              <input className="input" value={formProfile.phone} onChange={event => changeProfile('phone', event.target.value)} placeholder={t('phone')} />
              <input className="input" value={petType} onChange={event => setPetType(event.target.value)} placeholder={t('petTypeInput')} />
              <input className="input" value={petName} onChange={event => setPetName(event.target.value)} placeholder={t('petName')} />
              <select className="input" value={service} onChange={event => setService(event.target.value)}>
                {services.map(item => <option key={item}>{item}</option>)}
              </select>
              <input className="input" value={preferredTime} onChange={event => setPreferredTime(event.target.value)} placeholder={t('preferredTime')} />
            </div>

            <div className="message-preview-box">
              <strong>{t('messagePreview')}</strong>
              <pre>{message}</pre>
            </div>

            <div className="form-actions-row form-actions-right">
              <button type="button" className="btn btn-primary" onClick={submit}>
                <MessageCircle size={18} /> {t('sendToWhatsapp')}
              </button>
            </div>
            {notice ? <p className="form-success">{notice}</p> : null}
          </div>
        </div>,
        document.body
      ) : null}
    </>
  );
}
