'use client';

import { CheckCircle2, Save, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCustomerProfile, type CustomerProfile } from '@/components/customer-profile';
import { useLanguage } from '@/components/LanguageProvider';

const copy = {
  az: {
    kicker: 'Profil',
    title: 'Məlumatlarınızı bir dəfə doldurun',
    text: 'Qeydiyyat yoxdur. Ad, telefon və ünvan brauzerinizdə saxlanılır və WhatsApp sifariş/müraciət mesajlarına avtomatik əlavə olunur.',
    fullName: 'Ad Soyad', phone: 'Telefon', city: 'Şəhər', address: 'Ünvan', delivery: 'Çatdırılma seçimi', petType: 'Heyvan növü / ölçüsü', petName: 'Heyvanın adı', note: 'Əlavə qeyd', save: 'Məlumatları yadda saxla', saved: 'Məlumatlar təsdiqləndi', ready: 'Bu məlumatlar sifariş və grooming mesajlarında istifadə olunacaq.', notSaved: 'Doldurduqdan sonra yadda saxla düyməsinə basın.'
  },
  en: {
    kicker: 'Profile',
    title: 'Fill your details once',
    text: 'No registration needed. Your name, phone and address are stored in your browser and added to WhatsApp order/request messages automatically.',
    fullName: 'Full name', phone: 'Phone', city: 'City', address: 'Address', delivery: 'Delivery preference', petType: 'Pet type / size', petName: 'Pet name', note: 'Additional note', save: 'Save details', saved: 'Details confirmed', ready: 'These details will be used in order and grooming messages.', notSaved: 'Fill the fields and press save.'
  },
  ru: {
    kicker: 'Профиль',
    title: 'Заполните данные один раз',
    text: 'Регистрация не нужна. Имя, телефон и адрес сохраняются в браузере и автоматически добавляются в WhatsApp-сообщения для заказа или заявки.',
    fullName: 'Имя и фамилия', phone: 'Телефон', city: 'Город', address: 'Адрес', delivery: 'Тип доставки', petType: 'Вид / размер питомца', petName: 'Имя питомца', note: 'Комментарий', save: 'Сохранить данные', saved: 'Данные подтверждены', ready: 'Эти данные будут использоваться в заказах и заявках на груминг.', notSaved: 'Заполните поля и нажмите сохранить.'
  }
};

export default function ProfilePage() {
  const { lang } = useLanguage();
  const { profile, setProfile, isProfileReady } = useCustomerProfile();
  const [draft, setDraft] = useState<CustomerProfile>(profile);
  const [saved, setSaved] = useState(false);
  const c = copy[lang];

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  function change<K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) {
    setDraft(current => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function save() {
    setProfile(draft);
    setSaved(true);
  }

  return (
    <main className="page section page-spaced">
      <div className="container profile-layout">
        <section className="info-card profile-card-main">
          <p className="eyebrow">{c.kicker}</p>
          <h1>{c.title}</h1>
          <p>{c.text}</p>
          <form className="form-grid profile-form" onSubmit={event => { event.preventDefault(); save(); }}>
            <input className="input" value={draft.fullName} onChange={event => change('fullName', event.target.value)} placeholder={c.fullName} />
            <input className="input" value={draft.phone} onChange={event => change('phone', event.target.value)} placeholder={c.phone} />
            <input className="input" value={draft.city} onChange={event => change('city', event.target.value)} placeholder={c.city} />
            <input className="input" value={draft.address} onChange={event => change('address', event.target.value)} placeholder={c.address} />
            <select className="input" value={draft.deliveryPreference} onChange={event => change('deliveryPreference', event.target.value)}>
              <option>Ünvana çatdırılma</option>
              <option>Metroya çatdırılma</option>
              <option>Mağazadan təhvil alma</option>
              <option>Poçtla göndəriş</option>
            </select>
            <input className="input" value={draft.petType} onChange={event => change('petType', event.target.value)} placeholder={c.petType} />
            <input className="input" value={draft.petName} onChange={event => change('petName', event.target.value)} placeholder={c.petName} />
            <textarea className="input" value={draft.note} onChange={event => change('note', event.target.value)} placeholder={c.note} />
            <div className="profile-save-row">
              <button className="btn btn-primary" type="submit"><Save size={17} /> {c.save}</button>
            </div>
          </form>
        </section>
        <aside className="green-block profile-status-card">
          <UserRound size={38} />
          <h2>{saved || isProfileReady ? c.saved : c.kicker}</h2>
          <p>{saved || isProfileReady ? c.ready : c.notSaved}</p>
          <div className="list profile-summary">
            <span className="list-item"><CheckCircle2 size={18} /> {profile.fullName || c.fullName}</span>
            <span className="list-item"><CheckCircle2 size={18} /> {profile.phone || c.phone}</span>
            <span className="list-item"><CheckCircle2 size={18} /> {profile.address || c.address}</span>
            <span className="list-item"><CheckCircle2 size={18} /> {profile.petType || c.petType}</span>
          </div>
        </aside>
      </div>
    </main>
  );
}
