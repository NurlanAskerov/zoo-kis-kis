'use client';

import { useEffect, useMemo, useState } from 'react';
import { MessageCircle, Save } from 'lucide-react';
import { brand } from '@/lib/data';
import { compactLines, openWhatsApp } from '@/lib/whatsapp';
import { useCart } from './cart-context';
import { useCustomerProfile, type CustomerProfile } from './customer-profile';
import { useLanguage } from './LanguageProvider';

const labels = {
  az: {
    saveProfile: 'Məlumatları saxla',
    savedNote: 'Bir dəfə doldur, növbəti sifarişlərdə avtomatik gəlsin.',
    profileTitle: 'Sifariş məlumatları',
    notePlaceholder: 'Məsələn: çatdırılma vaxtı, blok, mərtəbə və s.',
    sendWhatsApp: 'WhatsApp ilə sifariş göndər',
    required: 'Sadəcə əlaqə məlumatını və sifariş üsulunu seçin. Mətn aşağıda hazır görünəcək.',
    emptyCart: 'Səbət boşdur. Əvvəl məhsul əlavə edin.',
    orderTitle: 'Yeni sifariş',
    customerInfo: 'Müştəri məlumatları',
    cartInfo: 'Məhsullar',
    total: 'Yekun',
    delivery: 'Sifariş üsulu',
    profileSaved: 'Məlumatlar brauzerdə saxlanılır, registrasiya lazım deyil.',
    pickup: 'Mağazadan götürmək',
    pickupMessage: 'Stokda varsa, gəlib mağazadan almaq istəyirəm.'
  },
  en: {
    saveProfile: 'Save details',
    savedNote: 'Fill once and reuse it for future orders.',
    profileTitle: 'Order details',
    notePlaceholder: 'Example: delivery time, building, floor, etc.',
    sendWhatsApp: 'Send order on WhatsApp',
    required: 'Choose your contact details and order method. The ready message is shown below.',
    emptyCart: 'Your cart is empty. Add products first.',
    orderTitle: 'New order',
    customerInfo: 'Customer details',
    cartInfo: 'Products',
    total: 'Total',
    delivery: 'Order method',
    profileSaved: 'Details are saved in the browser; no registration required.',
    pickup: 'Store pickup',
    pickupMessage: 'If it is in stock, I would like to come and pick it up from the store.'
  },
  ru: {
    saveProfile: 'Сохранить данные',
    savedNote: 'Заполните один раз — данные будут использоваться для следующих заказов.',
    profileTitle: 'Данные заказа',
    notePlaceholder: 'Например: время доставки, корпус, этаж и т.д.',
    sendWhatsApp: 'Отправить заказ в WhatsApp',
    required: 'Заполните контактные данные и выберите способ получения. Готовый текст появится ниже.',
    emptyCart: 'Корзина пуста. Сначала добавьте товары.',
    orderTitle: 'Новый заказ',
    customerInfo: 'Данные клиента',
    cartInfo: 'Товары',
    total: 'Итого',
    delivery: 'Способ заказа',
    profileSaved: 'Данные сохраняются в браузере; регистрация не нужна.',
    pickup: 'Самовывоз из магазина',
    pickupMessage: 'Если товар есть в наличии, я хочу забрать его из магазина.'
  }
};

export function CheckoutWhatsAppForm() {
  const { t, lang } = useLanguage();
  const copy = labels[lang];
  const { profile, setProfile } = useCustomerProfile();
  const { items, subtotal } = useCart();
  const [form, setForm] = useState<CustomerProfile>(profile);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setForm(profile);
  }, [profile]);

  const isPickup = form.deliveryPreference === copy.pickup;

  const orderMessage = useMemo(() => {
    const productLines = items.map((item, index) => {
      const lineTotal = item.quantity * item.product.price;
      return `${index + 1}. ${item.product.name[lang]} — ${item.quantity} x ${item.product.price} AZN = ${lineTotal} AZN`;
    });

    return compactLines([
      `${brand.name} / ${copy.orderTitle}`,
      '',
      `${copy.customerInfo}:`,
      form.fullName && `Ad Soyad: ${form.fullName}`,
      form.phone && `Telefon: ${form.phone}`,
      form.city && `Şəhər: ${form.city}`,
      !isPickup && form.address && `Ünvan: ${form.address}`,
      form.deliveryPreference && `${copy.delivery}: ${form.deliveryPreference}`,
      isPickup && copy.pickupMessage,
      form.note && `Qeyd: ${form.note}`,
      '',
      `${copy.cartInfo}:`,
      ...productLines,
      '',
      `${copy.total}: ${subtotal} AZN`
    ]);
  }, [copy, form, items, lang, subtotal, isPickup]);

  function change<K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }

  async function sendOrder() {
    if (items.length === 0) {
      setNotice(copy.emptyCart);
      return;
    }
    setProfile(form);
    setNotice(copy.profileSaved);

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer: form, items, subtotal, source: 'whatsapp' })
      });
    } catch {
      // WhatsApp sifarişi backend olmasa belə işləməlidir.
    }

    openWhatsApp(orderMessage);
  }

  return (
    <div className="order-form-card simplified-checkout-card">
      <p className="eyebrow">{copy.profileTitle}</p>
      <h2>{t('checkoutTitle')}</h2>
      <p>{copy.required}</p>
      <div className="form-grid two-cols-form">
        <input className="input" value={form.fullName} onChange={event => change('fullName', event.target.value)} placeholder={t('fullName')} />
        <input className="input" value={form.phone} onChange={event => change('phone', event.target.value)} placeholder={t('phone')} />
        <select className="input" value={form.deliveryPreference} onChange={event => change('deliveryPreference', event.target.value)}>
          <option value="">{t('deliveryType')}</option>
          <option>{t('metro')}</option>
          <option>{t('addressDelivery')}</option>
          <option>{t('postDelivery')}</option>
          <option>{copy.pickup}</option>
        </select>
        {!isPickup ? (
          <input className="input" value={form.address} onChange={event => change('address', event.target.value)} placeholder={t('address')} />
        ) : (
          <input className="input" value={copy.pickupMessage} readOnly aria-label={copy.pickup} />
        )}
        <textarea className="input input-wide" value={form.note} onChange={event => change('note', event.target.value)} placeholder={copy.notePlaceholder} />
      </div>
      <div className="message-preview-box checkout-message-preview">
        <strong>{t('messagePreview')}</strong>
        <pre>{orderMessage}</pre>
      </div>
      <div className="form-actions-row">
        <button type="button" className="btn btn-soft" onClick={() => { setProfile(form); setNotice(copy.profileSaved); }}>
          <Save size={17} /> {copy.saveProfile}
        </button>
        <button type="button" className="btn btn-primary" onClick={sendOrder}>
          <MessageCircle size={17} /> {copy.sendWhatsApp}
        </button>
      </div>
      <p className="microcopy">{notice || copy.savedNote}</p>
    </div>
  );
}
