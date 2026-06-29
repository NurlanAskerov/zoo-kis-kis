import Link from 'next/link';

export const metadata = {
  title: 'Məxfilik Siyasəti | Zoo Kis-Kis',
  description: 'Zoo Kis-Kis müştəri məlumatlarının necə istifadə olunduğunu izah edən məxfilik siyasəti.',
  alternates: {
    canonical: 'https://zookiskis.az/privacy-policy'
  }
};

export default function PrivacyPolicyPage() {
  return (
    <main className="page section">
      <div className="container info-card legal-page">
        <p className="eyebrow">Məxfilik siyasəti</p>
        <h1>Məxfilik Siyasəti</h1>

        <p>
          Zoo Kis-Kis müştərilərin şəxsi məlumatlarına hörmətlə yanaşır.
          Saytda sifariş, grooming müraciəti və əlaqə üçün daxil edilən məlumatlar yalnız xidmətin göstərilməsi məqsədilə istifadə olunur.
        </p>

        <h2>Toplanan məlumatlar</h2>
        <p>
          Ad, soyad, telefon nömrəsi, ünvan, heyvan haqqında məlumat, sifariş detalları və əlaqə məlumatları toplana bilər.
        </p>

        <h2>Məlumatların istifadəsi</h2>
        <p>
          Bu məlumatlar sifarişin hazırlanması, çatdırılma, grooming müraciətinin cavablandırılması və müştəri ilə əlaqə üçün istifadə olunur.
        </p>

        <h2>WhatsApp və üçüncü tərəflər</h2>
        <p>
          Sifariş və müraciət məlumatları WhatsApp vasitəsilə göndərilə bilər. Məlumatlar yalnız xidmətin göstərilməsi üçün istifadə olunur.
        </p>

        <h2>Cookies və analitika</h2>
        <p>
          Saytın işləməsi, performansın ölçülməsi və istifadəçi təcrübəsinin yaxşılaşdırılması üçün cookies və analitika alətlərindən istifadə oluna bilər.
        </p>

        <h2>Əlaqə</h2>
        <p>
          Məxfiliklə bağlı suallar üçün bizimlə əlaqə saxlayın:
          <br />
          <Link href="/contact">Əlaqə səhifəsi</Link>
        </p>
      </div>
    </main>
  );
}
