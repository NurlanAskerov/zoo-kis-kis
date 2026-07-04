'use client';

import { CheckCircle2, PawPrint, Scissors, ShowerHead, Sparkles } from 'lucide-react';
import { groomingServices, type Lang } from '@/lib/data';
import { GroomingBookingForm } from '@/components/GroomingBookingForm';
import { GroomingRequestButton } from '@/components/GroomingRequestButton';
import { useLanguage } from '@/components/LanguageProvider';

const detailCopy: Record<Lang, {
  intro: string;
  howTitle: string;
  howText: string;
  steps: string[];
  cards: { title: string; text: string }[];
}> = {
  az: {
    intro: 'Grooming xidməti ev heyvanlarının təmiz, rahat və baxımlı qalması üçün nəzərdə tutulub. Qiymət və vaxt heyvanın növünə/cinsinə, tük vəziyyətinə və seçilən xidmətə görə dəqiqləşdirilir.',
    howTitle: 'Grooming prosesi necə işləyir?',
    howText: 'Müraciət etdikdən sonra məlumatlar WhatsApp-a hazır mesaj kimi gedir. Komanda heyvanın növünü/cinsini və xidmət növünü nəzərə alaraq uyğun saatı sizinlə razılaşdırır.',
    steps: ['Heyvanın növünü/cinsini yazın', 'Lazım olan xidməti seçin', 'Uyğun gün və saat təklif edin', 'Mağaza WhatsApp-da vaxtı təsdiqləsin'],
    cards: [
      { title: 'Tük kəsimi', text: 'Tükün uzunluğu, dolaşıqlığı və heyvanın rahatlığı nəzərə alınır.' },
      { title: 'Yuma və qurutma', text: 'Təmizləmə və qurutma heyvanın növünə uyğun aparılır.' },
      { title: 'Daraq və tükləmə', text: 'Artıq tüklərin yığılması və dolaşıqların açılması üçün uyğundur.' },
      { title: 'Dırnaq baxımı', text: 'Dırnaqlar rahat hərəkət üçün təhlükəsiz şəkildə qısaldılır.' }
    ]
  },
  en: {
    intro: 'The grooming service helps pets stay clean, comfortable and well cared for. Price and timing are confirmed based on pet type/breed, coat condition and selected service.',
    howTitle: 'How does grooming work?',
    howText: 'After you apply, the details are prepared as a WhatsApp message. The team checks the pet type/breed and service type, then confirms a suitable time with you.',
    steps: ['Enter pet type/breed', 'Choose the needed service', 'Suggest a convenient day and time', 'The store confirms the appointment on WhatsApp'],
    cards: [
      { title: 'Haircut', text: 'Coat length, tangles and pet comfort are considered.' },
      { title: 'Wash and dry', text: 'Cleaning and drying are done according to the pet type.' },
      { title: 'Brushing / deshedding', text: 'Useful for removing loose hair and opening small tangles.' },
      { title: 'Nail care', text: 'Nails are trimmed safely for comfortable movement.' }
    ]
  },
  ru: {
    intro: 'Груминг помогает питомцам оставаться чистыми, ухоженными и чувствовать себя комфортно. Стоимость и время зависят от вида или породы питомца, состояния шерсти и выбранной услуги.',
    howTitle: 'Как проходит груминг?',
    howText: 'После заполнения заявки данные откроются готовым сообщением в WhatsApp. Команда учитывает вид или породу питомца и выбранную услугу, затем подтверждает удобное время.',
    steps: ['Укажите вид или породу питомца', 'Выберите нужную услугу', 'Предложите удобный день и время', 'Магазин подтвердит запись в WhatsApp'],
    cards: [
      { title: 'Стрижка', text: 'Учитываются длина шерсти, колтуны и комфорт питомца.' },
      { title: 'Купание и сушка', text: 'Купание и сушка выполняются с учётом вида питомца.' },
      { title: 'Расчёсывание', text: 'Подходит для удаления лишней шерсти и распутывания колтунов.' },
      { title: 'Уход за когтями', text: 'Когти аккуратно укорачиваются для удобного движения.' }
    ]
  }
};

const icons = [Scissors, ShowerHead, Sparkles, PawPrint];

export default function GroomingPage() {
  const { t, lang } = useLanguage();
  const services = groomingServices[lang];
  const details = detailCopy[lang];

  return (
    <main className="page section page-spaced">
      <div className="container">
        <div className="section-title page-title-room">
          <p className="eyebrow">{t('grooming')}</p>
          <h1>{t('groomingPageTitle')}</h1>
          <p>{details.intro}</p>
        </div>

        <div className="grooming-page-grid">
          <section className="green-block grooming-service-card">
            <Scissors size={34} />
            <h2>{t('groomingTitle')}</h2>
            <p>{t('groomingText')}</p>
            <div className="list grooming-list">
              {services.slice(0, 5).map(service => <span className="list-item" key={service}><CheckCircle2 size={18} /> {service}</span>)}
            </div>
            <div className="grooming-actions">
              <GroomingRequestButton buttonClassName="btn btn-soft">{t('applyNow')}</GroomingRequestButton>
            </div>
            <span className="cat" aria-hidden="true">✂️</span>
          </section>

          <GroomingBookingForm />
        </div>

        <section className="info-card grooming-info-section">
          <p className="eyebrow">{t('details')}</p>
          <h2>{details.howTitle}</h2>
          <p>{details.howText}</p>
          <div className="grooming-steps">
            {details.steps.map((step, index) => (
              <span className="grooming-step" key={step}><b>{index + 1}</b>{step}</span>
            ))}
          </div>
          <div className="grooming-detail-cards">
            {details.cards.map((card, index) => {
              const Icon = icons[index] ?? PawPrint;
              return (
                <article className="grooming-detail-card" key={card.title}>
                  <Icon size={24} />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
