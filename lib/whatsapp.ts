import { brand, type Lang, type Product } from './data';

export type CustomerProfile = {
  fullName: string;
  phone: string;
  address: string;
  city?: string;
  note?: string;
  deliveryPreference?: string;
  petType?: string;
  petName?: string;
};

export type OrderLineForMessage = {
  product: Product;
  quantity: number;
};

export function getWhatsappPhone() {
  return process.env.NEXT_PUBLIC_WHATSAPP_PHONE || brand.whatsapp.replace('https://wa.me/', '').split('?')[0] || '994555047010';
}

export function createWhatsAppUrl(message: string) {
  return `https://wa.me/${getWhatsappPhone()}?text=${encodeURIComponent(message)}`;
}


export function compactLines(lines: Array<string | false | null | undefined>) {
  return lines
    .filter((line): line is string => typeof line === 'string')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function openWhatsApp(message: string) {
  if (typeof window === 'undefined') return;
  window.open(createWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
}

function safe(value?: string) {
  return value && value.trim() ? value.trim() : '-';
}


function productVariantLines(product: Product, lang: Lang) {
  return (product.variants ?? [])
    .filter(variant => Number(variant.price || 0) > 0)
    .map(variant => `- ${variant.label?.[lang] || variant.label?.az}: ${variant.price} AZN`);
}

export function buildOrderMessage(lines: OrderLineForMessage[], profile: CustomerProfile, deliveryType: string, lang: Lang) {
  const subtotal = lines.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const items = lines.map((item, index) => `${index + 1}. ${item.product.name[lang]} x ${item.quantity} - ${item.product.price * item.quantity} AZN`).join('\n');

  return [
    `Salam, ${brand.name}. Sifariş vermək istəyirəm.`,
    '',
    'Məhsullar:',
    items || '-',
    '',
    `Cəmi: ${subtotal} AZN`,
    `Çatdırılma növü: ${safe(deliveryType)}`,
    '',
    'Müştəri məlumatları:',
    `Ad Soyad: ${safe(profile.fullName)}`,
    `Telefon: ${safe(profile.phone)}`,
    `Şəhər: ${safe(profile.city)}`,
    `Ünvan: ${safe(profile.address)}`,
    `Qeyd: ${safe(profile.note)}`
  ].join('\n');
}

export function buildGroomingMessage(profile: CustomerProfile, petType: string, petName: string, service: string, preferredTime: string, lang: Lang) {
  return [
    `Salam, ${brand.name}. Grooming üçün müraciət etmək istəyirəm.`,
    '',
    `Heyvan növü / cinsi: ${safe(petType)}`,
    `Heyvanın adı: ${safe(petName)}`,
    `İstədiyim xidmət: ${safe(service)}`,
    `Uyğun gün və saat: ${safe(preferredTime)}`,
    '',
    'Əlaqə məlumatları:',
    `Ad Soyad: ${safe(profile.fullName)}`,
    `Telefon: ${safe(profile.phone)}`,
    profile.note ? `Qeyd: ${safe(profile.note)}` : undefined
  ].filter(Boolean).join('\n');
}


export function buildProductQuestionMessage(product: Product, lang: Lang, profile?: CustomerProfile) {
  const variants = productVariantLines(product, lang);

  return [
    `Salam, ${brand.name}. Bu məhsul haqqında məlumat almaq istəyirəm:`,
    `${product.name[lang]} - ${product.price} AZN`,
    variants.length ? `Ölçü/variant qiymətləri:
${variants.join('\n')}` : undefined,
    `Məhsul linki: /products/${product.slug}`,
    profile?.fullName ? '' : undefined,
    profile?.fullName ? 'Müştəri məlumatları:' : undefined,
    profile?.fullName ? `Ad Soyad: ${safe(profile.fullName)}` : undefined,
    profile?.phone ? `Telefon: ${safe(profile.phone)}` : undefined,
    profile?.city ? `Şəhər: ${safe(profile.city)}` : undefined,
    profile?.address ? `Ünvan: ${safe(profile.address)}` : undefined
  ].filter(Boolean).join('\n');
}
