'use client';

import { MessageCircle, Save } from 'lucide-react';
import { useState } from 'react';
import { brand } from '@/lib/data';
import { compactLines, openWhatsApp } from '@/lib/whatsapp';
import { useCustomerProfile, type CustomerProfile } from './customer-profile';
import { useLanguage } from './LanguageProvider';

const copy = {
  az: { note: 'Mesaj WhatsApp-a hazır formada göndəriləcək.', saved: 'Məlumatlar saxlanıldı.', sendWp: 'WhatsApp ilə göndər' },
  en: { note: 'The message will be sent to WhatsApp in a ready format.', saved: 'Details saved.', sendWp: 'Send via WhatsApp' },
  ru: { note: 'Сообщение будет подготовлено для отправки в WhatsApp.', saved: 'Данные сохранены.', sendWp: 'Отправить в WhatsApp' }
};

export function ContactMessageForm() {
  const { t, lang } = useLanguage();
  const { profile, setProfile } = useCustomerProfile();
  const [form, setForm] = useState<CustomerProfile & { message: string }>({ ...profile, message: '' });
  const [notice, setNotice] = useState(copy[lang].note);

  function change(key: keyof typeof form, value: string) {
    setForm(current => ({ ...current, [key]: value }));
  }

  function save() {
    const { message, ...customer } = form;
    setProfile(customer);
    setNotice(copy[lang].saved);
  }

  function send() {
    save();
    const message = compactLines([
      `${brand.name} / ${t('contactTitle')}`,
      form.fullName && `Ad Soyad: ${form.fullName}`,
      form.phone && `Telefon: ${form.phone}`,
      form.address && `Ünvan: ${form.address}`,
      '',
      form.message && `Mesaj: ${form.message}`
    ]);
    openWhatsApp(message);
  }

  return (
    <div className="form-grid">
      <input className="input" value={form.fullName} onChange={event => change('fullName', event.target.value)} placeholder={t('yourName')} />
      <input className="input" value={form.phone} onChange={event => change('phone', event.target.value)} placeholder={t('phone')} />
      <input className="input" value={form.address} onChange={event => change('address', event.target.value)} placeholder={t('address')} />
      <textarea className="input" value={form.message} onChange={event => change('message', event.target.value)} placeholder={t('yourMessage')} />
      <div className="form-actions-row form-actions-row-small">
        <button type="button" className="btn btn-soft" onClick={save}><Save size={17} /> {t('save')}</button>
        <button type="button" className="btn btn-primary" onClick={send}><MessageCircle size={17} /> {copy[lang].sendWp}</button>
      </div>
      <p className="microcopy">{notice}</p>
    </div>
  );
}
