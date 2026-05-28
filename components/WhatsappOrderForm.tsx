'use client';

import { MessageCircle, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useCart } from './cart-context';
import { useLanguage } from './LanguageProvider';
import { useCustomerProfile, type CustomerProfile } from './customer-profile';
import { buildOrderMessage, createWhatsAppUrl } from '@/lib/whatsapp';

function profileIsReady(profile: CustomerProfile) {
  return Boolean(profile.fullName.trim() && profile.phone.trim());
}

export function WhatsappOrderForm() {
  const { items, subtotal } = useCart();
  const { t, lang } = useLanguage();
  const { profile, setProfile } = useCustomerProfile();
  const [formProfile, setFormProfile] = useState<CustomerProfile>(profile);
  const [deliveryType, setDeliveryType] = useState(profile.deliveryPreference || t('addressDelivery'));
  const [modalOpen, setModalOpen] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setFormProfile(profile);
    setDeliveryType(profile.deliveryPreference || t('addressDelivery'));
  }, [profile, t]);

  const message = useMemo(
    () => buildOrderMessage(items, { ...formProfile, deliveryPreference: deliveryType }, deliveryType, lang),
    [items, formProfile, deliveryType, lang]
  );
  const whatsappUrl = useMemo(() => createWhatsAppUrl(message), [message]);
  const ready = profileIsReady(formProfile);

  function change<K extends keyof CustomerProfile>(key: K, value: CustomerProfile[K]) {
    setFormProfile(current => ({ ...current, [key]: value }));
  }

  async function submitOrder() {
    if (!items.length) {
      setNotice(t('cartEmptyTitle'));
      return;
    }

    const customer = { ...formProfile, deliveryPreference: deliveryType };
    setProfile(customer);

    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer,
        deliveryType,
        note: customer.note,
        total: subtotal,
        items: items.map(item => ({ slug: item.slug, quantity: item.quantity, price: item.product.price, name: item.product.name.az }))
      })
    }).catch(() => null);

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return (
    <div className="order-form-shell simplified-order-box">
      <div className="simple-order-summary">
        <div>
          <p className="eyebrow">{t('whatsappOrder')}</p>
          <h2>{subtotal} AZN</h2>
          <p>{t('checkoutSimpleText')}</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)} disabled={items.length === 0}>
          <MessageCircle size={18} /> {t('sendWhatsappOrder')}
        </button>
      </div>

      <p className="microcopy">
        {ready ? t('profileReadyOrder') : t('profileMissingOrder')}
      </p>

      {modalOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setModalOpen(false)}>
          <div className="whatsapp-modal" role="dialog" aria-modal="true" aria-label={t('whatsappOrder')} onClick={event => event.stopPropagation()}>
            <button className="modal-close" type="button" onClick={() => setModalOpen(false)} aria-label={t('close')}>
              <X size={19} />
            </button>

            <p className="eyebrow">{t('whatsappOrder')}</p>
            <h2>{t('orderModalTitle')}</h2>
            <p>{ready ? t('orderProfileFound') : t('orderProfileMissing')}</p>

            <div className="form-grid compact-form-grid">
              <input className="input" value={formProfile.fullName} onChange={event => change('fullName', event.target.value)} placeholder={t('fullName')} />
              <input className="input" value={formProfile.phone} onChange={event => change('phone', event.target.value)} placeholder={t('phone')} />
              <input className="input" value={formProfile.city} onChange={event => change('city', event.target.value)} placeholder={t('city')} />
              <input className="input" value={formProfile.address} onChange={event => change('address', event.target.value)} placeholder={t('address')} />
              <select className="input" value={deliveryType} onChange={event => setDeliveryType(event.target.value)}>
                <option>{t('metro')}</option>
                <option>{t('addressDelivery')}</option>
                <option>{t('postDelivery')}</option>
              </select>
              <textarea className="input" value={formProfile.note} onChange={event => change('note', event.target.value)} placeholder={t('note')} />
            </div>

            <div className="message-preview-box">
              <strong>{t('messagePreview')}</strong>
              <pre>{message}</pre>
            </div>

            <div className="form-actions-row form-actions-right">
              <button type="button" className="btn btn-primary" onClick={submitOrder}><MessageCircle size={18} /> {t('sendToWhatsapp')}</button>
            </div>
            {notice ? <p className="form-success">{notice}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
