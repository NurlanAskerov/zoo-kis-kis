export type Lang = 'az' | 'en' | 'ru';
export type LocalizedText = Record<Lang, string>;

export type Category = {
  key: string;
  name: LocalizedText;
  icon: string;
  description: LocalizedText;
};

export type AudienceKey = 'cats' | 'dogs' | 'birds' | 'fish' | 'hamsters' | 'allPets';
export type ProductTypeKey = string;
export type ProductDepartmentKey = string;
export type ProductCollectionKey = 'discount' | 'popular' | 'new';
export type StockKey = 'inStock' | 'lowStock' | 'preOrder';

export type ProductVariant = {
  id: string;
  label: LocalizedText;
  price: number;
  oldPrice?: number;
  stock?: StockKey;
};

export type Product = {
  id: number | string;
  slug: string;
  name: LocalizedText;
  categoryKey: string;
  departmentKey?: ProductDepartmentKey;
  departmentLabel?: LocalizedText;
  typeKey: ProductTypeKey;
  typeLabel?: LocalizedText;
  audiences: AudienceKey[];
  collections: ProductCollectionKey[];
  price: number;
  oldPrice?: number;
  variants?: ProductVariant[];
  image: string;
  images?: string[];
  badge?: LocalizedText;
  stock: StockKey;
  active?: boolean;
  description: LocalizedText;
  details: Record<Lang, string[]>;
};

export type CatalogLocalizedOption = {
  key: string;
  label: LocalizedText;
};

export type CatalogSubcategoryOption = CatalogLocalizedOption & {
  departmentKey: string;
};

export type CatalogFilters = {
  departments: CatalogLocalizedOption[];
  subcategories: CatalogSubcategoryOption[];
};

export const emptyCatalogFilters: CatalogFilters = {
  departments: [],
  subcategories: []
};

export const brand = {
  name: 'Zoo Kis-Kis',
  tagline: 'Zooshop & Grooming',
  phone: '+994 55 504 70 10',
  whatsapp: 'https://wa.me/994555047010',
  address: 'Sulh kucesi 14c, Imeni Razina, Baki, Azerbaijan',
  instagram: 'zookiskis.az',
  tiktok: 'zookiskis'
};

export const audienceOptions: { key: AudienceKey; label: LocalizedText }[] = [
  { key: 'cats', label: { az: 'Pişiklər üçün', en: 'For cats', ru: 'Для кошек' } },
  { key: 'dogs', label: { az: 'İtlər üçün', en: 'For dogs', ru: 'Для собак' } },
  { key: 'birds', label: { az: 'Quşlar üçün', en: 'For birds', ru: 'Для птиц' } },
  { key: 'fish', label: { az: 'Balıqlar üçün', en: 'For fish', ru: 'Для рыб' } },
  { key: 'hamsters', label: { az: 'Gəmiricilər üçün', en: 'For rodents', ru: 'Для грызунов' } },
  { key: 'allPets', label: { az: 'Bütün dostlar üçün', en: 'For all pets', ru: 'Для всех питомцев' } }
];

export const productTypeOptions: { key: ProductTypeKey; label: LocalizedText }[] = [
  { key: 'dryFood', label: { az: 'Quru yem', en: 'Dry food', ru: 'Сухой корм' } },
  { key: 'wetFood', label: { az: 'Yaş yem', en: 'Wet food', ru: 'Влажный корм' } },
  { key: 'treat', label: { az: 'Ödül maması', en: 'Treats', ru: 'Лакомства' } },
  { key: 'toy', label: { az: 'Oyuncaq', en: 'Toys', ru: 'Игрушки' } },
  { key: 'bowl', label: { az: 'Yem və su qabı', en: 'Food and water bowls', ru: 'Миски для корма и воды' } },
  { key: 'toilet', label: { az: 'Biotualet', en: 'Cat toilet', ru: 'Туалет для кошек' } },
  { key: 'litter', label: { az: 'Pişik qumu', en: 'Cat litter', ru: 'Наполнитель' } },
  { key: 'bed', label: { az: 'Yuva / yataq', en: 'Beds and houses', ru: 'Лежанки и домики' } },
  { key: 'leash', label: { az: 'Xalta / boyunluq', en: 'Leashes and collars', ru: 'Поводки и ошейники' } },
  { key: 'carrier', label: { az: 'Daşıma çantası', en: 'Carriers', ru: 'Переноски' } },
  { key: 'aquarium', label: { az: 'Akvarium', en: 'Aquariums', ru: 'Аквариумы' } },
  { key: 'cage', label: { az: 'Qəfəs', en: 'Cages', ru: 'Клетки' } },
  { key: 'grooming', label: { az: 'Grooming xidməti', en: 'Grooming service', ru: 'Услуги груминга' } },
  { key: 'care', label: { az: 'Baxım məhsulu', en: 'Care products', ru: 'Товары для ухода' } }
];


export const productDepartmentOptions: { key: ProductDepartmentKey; label: LocalizedText; subcategories: ProductTypeKey[] }[] = [
  {
    key: 'food',
    label: { az: 'Yemlər', en: 'Food', ru: 'Корма' },
    subcategories: ['dryFood', 'wetFood', 'treat']
  },
  {
    key: 'hygiene',
    label: { az: 'Gigiyena', en: 'Hygiene', ru: 'Гигиена' },
    subcategories: ['toilet', 'litter']
  },
  {
    key: 'play',
    label: { az: 'Oyuncaqlar', en: 'Toys', ru: 'Игрушки' },
    subcategories: ['toy']
  },
  {
    key: 'home',
    label: { az: 'Yuva və rahatlıq', en: 'Beds and comfort', ru: 'Лежанки и домики' },
    subcategories: ['bed', 'bowl']
  },
  {
    key: 'walking',
    label: { az: 'Gəzinti', en: 'Walking', ru: 'Прогулки' },
    subcategories: ['leash']
  },
  {
    key: 'travel',
    label: { az: 'Daşıma', en: 'Travel', ru: 'Транспортировка' },
    subcategories: ['carrier']
  },
  {
    key: 'cages',
    label: { az: 'Qəfəslər', en: 'Cages', ru: 'Клетки' },
    subcategories: ['cage']
  },
  {
    key: 'aquarium',
    label: { az: 'Akvarium', en: 'Aquarium', ru: 'Аквариумы' },
    subcategories: ['aquarium']
  },
  {
    key: 'care',
    label: { az: 'Baxım', en: 'Care', ru: 'Уход' },
    subcategories: ['care', 'grooming']
  }
];

export const productTypeDepartmentMap: Record<ProductTypeKey, ProductDepartmentKey> = productDepartmentOptions.reduce((acc, department) => {
  department.subcategories.forEach(subcategory => {
    acc[subcategory] = department.key;
  });
  return acc;
}, {} as Record<ProductTypeKey, ProductDepartmentKey>);

export const collectionOptions: { key: ProductCollectionKey; label: LocalizedText }[] = [
  { key: 'discount', label: { az: 'Endirimli məhsullar', en: 'Discounted products', ru: 'Товары со скидкой' } },
  { key: 'popular', label: { az: 'Populyar məhsullar', en: 'Popular products', ru: 'Популярные товары' } },
  { key: 'new', label: { az: 'Yeni məhsullar', en: 'New arrivals', ru: 'Новинки' } }
];

export const stockLabels: Record<StockKey, LocalizedText> = {
  inStock: { az: 'Stokda var', en: 'In stock', ru: 'В наличии' },
  lowStock: { az: 'Az qalıb', en: 'Low stock', ru: 'Мало осталось' },
  preOrder: { az: 'Sifarişlə', en: 'By order', ru: 'На заказ' }
};

export const categories: Category[] = [
  { key: 'dry-food', icon: '🥣', name: { az: 'Quru yemlər', en: 'Dry food', ru: 'Сухой корм' }, description: { az: 'Pişik, it və digər dostlar üçün quru yemlər', en: 'Dry food for cats, dogs and other pets', ru: 'Сухой корм для кошек, собак и других питомцев' } },
  { key: 'wet-food', icon: '🥫', name: { az: 'Yaş yemlər', en: 'Wet food', ru: 'Влажный корм' }, description: { az: 'Konserv və paket yaş yem seçimləri', en: 'Canned and pouch wet food options', ru: 'Консервы и паучи с влажным кормом' } },
  { key: 'treats', icon: '🦴', name: { az: 'Ödül mamaları', en: 'Treats', ru: 'Лакомства' }, description: { az: 'Təlim və sevindirmək üçün dadlı seçimlər', en: 'Tasty choices for training and rewards', ru: 'Лакомства для дрессировки и поощрения' } },
  { key: 'toys', icon: '🎾', name: { az: 'Oyuncaqlar', en: 'Toys', ru: 'Игрушки' }, description: { az: 'Rahat və əyləncəli oyun məhsulları', en: 'Simple and fun play products', ru: 'Безопасные игрушки для активных игр' } },
  { key: 'bowls', icon: '🍽️', name: { az: 'Yem qabları', en: 'Bowls', ru: 'Миски' }, description: { az: 'Yem və su qabları', en: 'Food and water bowls', ru: 'Миски для корма и воды' } },
  { key: 'toilets', icon: '🚽', name: { az: 'Biotualetlər', en: 'Cat toilets', ru: 'Туалеты для кошек' }, description: { az: 'Pişik tualetləri və aksesuarları', en: 'Cat toilets and accessories', ru: 'Туалеты и аксессуары для кошек' } },
  { key: 'litter', icon: '✨', name: { az: 'Qumlar', en: 'Cat litter', ru: 'Наполнители' }, description: { az: 'Pişik qumu və doldurucular', en: 'Cat litter and fillers', ru: 'Наполнители для кошачьих туалетов' } },
  { key: 'beds', icon: '🏠', name: { az: 'Yuvalar', en: 'Beds and houses', ru: 'Лежанки и домики' }, description: { az: 'Rahat yataqlar və evlər', en: 'Comfortable beds and houses', ru: 'Удобные лежанки и домики' } },
  { key: 'leashes', icon: '🦮', name: { az: 'Xaltalar', en: 'Leashes and collars', ru: 'Поводки и ошейники' }, description: { az: 'Boyunluq, xalta və gəzinti məhsulları', en: 'Collars, leashes and walking products', ru: 'Ошейники, поводки и товары для прогулок' } },
  { key: 'carriers', icon: '👜', name: { az: 'Çantalar', en: 'Carriers', ru: 'Переноски' }, description: { az: 'Daşıma çantaları', en: 'Pet carriers', ru: 'Сумки-переноски' } },
  { key: 'aquariums', icon: '🐟', name: { az: 'Akvariumlar', en: 'Aquariums', ru: 'Аквариумы' }, description: { az: 'Balıq və akvarium məhsulları', en: 'Fish and aquarium products', ru: 'Товары для рыб и аквариумов' } },
  { key: 'dog-cages', icon: '🐕', name: { az: 'İt qəfəsləri', en: 'Dog crates', ru: 'Клетки для собак' }, description: { az: 'İtlər üçün ev və səyahət qəfəsləri', en: 'Crates for dogs at home and travel', ru: 'Клетки для собак: для дома и поездок' } },
  { key: 'bird-cages', icon: '🐦', name: { az: 'Quş qəfəsləri', en: 'Bird cages', ru: 'Клетки для птиц' }, description: { az: 'Quşlar üçün qəfəslər', en: 'Cages for birds', ru: 'Клетки для птиц' } },
  { key: 'hamsters', icon: '🐹', name: { az: 'Gəmirici məhsulları', en: 'Rodent products', ru: 'Товары для грызунов' }, description: { az: 'Gəmirici yemləri və aksesuarları', en: 'Rodent food and accessories', ru: 'Корма и аксессуары для грызунов' } },
  { key: 'care', icon: '🧴', name: { az: 'Baxım', en: 'Care', ru: 'Уход' }, description: { az: 'Qulluq məhsulları', en: 'Care products', ru: 'Товары для ухода' } },
  { key: 'grooming', icon: '✂️', name: { az: 'Grooming', en: 'Grooming', ru: 'Услуги груминга' }, description: { az: 'Tük kəsimi, yuma və gigiyena xidməti', en: 'Haircut, washing and hygiene service', ru: 'Стрижка, купание и гигиенический уход' } }
];

export const products: Product[] = [
  {
    id: 1,
    slug: 'premium-pisik-quru-yemi',
    name: { az: 'Premium pişik quru yemi', en: 'Premium cat dry food', ru: 'Премиум сухой корм для кошек' },
    categoryKey: 'dry-food',
    typeKey: 'dryFood',
    audiences: ['cats'],
    collections: ['discount', 'popular'],
    price: 25,
    oldPrice: 30,
    image: '/products/cat-food.svg',
    images: ['/products/cat-food.svg', '/products/cat-food-alt.svg', '/products/cat-treat.svg'],
    badge: { az: 'Endirim', en: 'Sale', ru: 'Скидка' },
    stock: 'inStock',
    description: { az: 'Pişiklər üçün gündəlik istifadə oluna bilən balanslı quru yem.', en: 'Balanced dry food for daily cat nutrition.', ru: 'Сбалансированный сухой корм для ежедневного питания кошек.' },
    details: {
      az: ['Pişiklər üçün uyğundur', 'Vitamin və minerallarla zəngindir', 'Gündəlik qidalanma üçün rahat seçim'],
      en: ['Suitable for cats', 'Rich in vitamins and minerals', 'A convenient option for daily feeding'],
      ru: ['Подходит для кошек', 'Содержит витамины и минералы', 'Удобный вариант для ежедневного кормления']
    }
  },
  {
    id: 2,
    slug: 'itler-ucun-quru-yem',
    name: { az: 'İtlər üçün quru yem', en: 'Dry food for dogs', ru: 'Сухой корм для собак' },
    categoryKey: 'dry-food',
    typeKey: 'dryFood',
    audiences: ['dogs'],
    collections: ['popular'],
    price: 28,
    image: '/products/dog-food.svg',
    images: ['/products/dog-food.svg', '/products/dog-food-alt.svg', '/products/dog-toy.svg'],
    badge: { az: 'Populyar', en: 'Popular', ru: 'Популярное' },
    stock: 'inStock',
    description: { az: 'Aktiv itlər üçün doyumlu və balanslı quru yem seçimi.', en: 'A filling and balanced dry food option for active dogs.', ru: 'Сытный и сбалансированный сухой корм для активных собак.' },
    details: {
      az: ['İtlər üçün hazırlanıb', 'Böyüklər üçün uyğundur', 'Enerji dəstəyi verir'],
      en: ['Made for dogs', 'Suitable for adult dogs', 'Supports daily energy needs'],
      ru: ['Для собак', 'Подходит для взрослых собак', 'Поддерживает ежедневную активность']
    }
  },
  {
    id: 3,
    slug: 'pisik-ucun-oyuncaq-toplar',
    name: { az: 'Pişik üçün oyuncaq toplar', en: 'Toy balls for cats', ru: 'Игрушечные мячики для кошек' },
    categoryKey: 'toys',
    typeKey: 'toy',
    audiences: ['cats'],
    collections: ['new', 'popular'],
    price: 12,
    image: '/products/toy-balls.svg',
    images: ['/products/toy-balls.svg', '/products/toy-balls-alt.svg', '/products/cat-food-alt.svg'],
    badge: { az: 'Yeni', en: 'New', ru: 'Новинка' },
    stock: 'lowStock',
    description: { az: 'Pişiklər üçün yumşaq, sadə və əyləncəli oyuncaq toplar.', en: 'Soft, simple and fun toy balls for cats.', ru: 'Мягкие и весёлые мячики для кошек.' },
    details: {
      az: ['Pişiklər üçün oyun məhsulu', 'Ev içi oyunlar üçün rahatdır', 'Pastel və göz yormayan görünüş'],
      en: ['Play product for cats', 'Comfortable for indoor play', 'Soft pastel look'],
      ru: ['Игрушка для кошек', 'Подходит для домашних игр', 'Приятные пастельные цвета']
    }
  },
  {
    id: 4,
    slug: 'yumsaq-pet-yuvasi',
    name: { az: 'Yumşaq pet yuvası', en: 'Soft pet bed', ru: 'Мягкая лежанка для питомца' },
    categoryKey: 'beds',
    typeKey: 'bed',
    audiences: ['cats', 'dogs'],
    collections: ['discount', 'new'],
    price: 42,
    oldPrice: 50,
    image: '/products/pet-bed.svg',
    images: ['/products/pet-bed.svg', '/products/pet-bed-alt.svg', '/products/carrier-alt.svg'],
    badge: { az: 'Rahat', en: 'Cozy', ru: 'Уютно' },
    stock: 'preOrder',
    description: { az: 'Pişik və kiçik itlər üçün rahat, yumşaq və isti yuva.', en: 'A soft and warm bed for cats and small dogs.', ru: 'Мягкая и тёплая лежанка для кошек и маленьких собак.' },
    details: {
      az: ['Pişik və balaca itlər üçün', 'Yumşaq içlik', 'Ev şəraitində rahat istifadə'],
      en: ['For cats and small dogs', 'Soft filling', 'Comfortable for home use'],
      ru: ['Для кошек и маленьких собак', 'Мягкий наполнитель', 'Подходит для дома']
    }
  },
  {
    id: 5,
    slug: 'pisik-qumu',
    name: { az: 'Pişik qumu', en: 'Cat litter', ru: 'Наполнитель для кошачьего туалета' },
    categoryKey: 'litter',
    typeKey: 'litter',
    audiences: ['cats'],
    collections: ['popular'],
    price: 18,
    image: '/products/cat-litter.svg',
    images: ['/products/cat-litter.svg', '/products/cat-litter-alt.svg', '/products/cat-toilet-alt.svg'],
    stock: 'inStock',
    description: { az: 'Gündəlik gigiyena üçün rahat istifadə olunan pişik qumu.', en: 'Easy-to-use cat litter for daily hygiene.', ru: 'Удобный наполнитель для ежедневной гигиены кошек.' },
    details: {
      az: ['Pişiklər üçün gigiyena məhsulu', 'Qoxu nəzarəti', 'Rahat təmizlənmə'],
      en: ['Hygiene product for cats', 'Odor control', 'Easy cleaning'],
      ru: ['Гигиенический товар для кошек', 'Контроль запаха', 'Лёгкая уборка']
    }
  },
  {
    id: 6,
    slug: 'dasima-cantasi',
    name: { az: 'Daşıma çantası', en: 'Pet carrier', ru: 'Сумка-переноска' },
    categoryKey: 'carriers',
    typeKey: 'carrier',
    audiences: ['cats', 'dogs'],
    collections: ['new'],
    price: 35,
    image: '/products/carrier.svg',
    images: ['/products/carrier.svg', '/products/carrier-alt.svg', '/products/pet-bed-alt.svg'],
    badge: { az: 'Səyahət', en: 'Travel', ru: 'Для поездок' },
    stock: 'inStock',
    description: { az: 'Baytar, səyahət və gündəlik daşınma üçün praktik çanta.', en: 'A practical carrier for vet visits, travel and daily use.', ru: 'Практичная переноска для ветеринара, поездок и повседневного использования.' },
    details: {
      az: ['Pişik və kiçik itlər üçün', 'Hava dəlikləri var', 'Rahat tutacaq'],
      en: ['For cats and small dogs', 'Ventilation holes', 'Comfortable handle'],
      ru: ['Для кошек и маленьких собак', 'Есть отверстия для воздуха', 'Удобная ручка']
    }
  },
  {
    id: 7,
    slug: 'qush-qefesi',
    name: { az: 'Quş qəfəsi', en: 'Bird cage', ru: 'Клетка для птиц' },
    categoryKey: 'bird-cages',
    typeKey: 'cage',
    audiences: ['birds'],
    collections: ['discount'],
    price: 45,
    oldPrice: 52,
    image: '/products/bird-cage.svg',
    images: ['/products/bird-cage.svg', '/products/bird-cage-alt.svg', '/products/dog-cage-alt.svg'],
    badge: { az: 'Endirim', en: 'Sale', ru: 'Скидка' },
    stock: 'lowStock',
    description: { az: 'Quşlar üçün sadə, rahat və təmiz görünüşlü qəfəs.', en: 'A simple, comfortable and clean-looking cage for birds.', ru: 'Простая, удобная и аккуратная клетка для птиц.' },
    details: {
      az: ['Quşlar üçün nəzərdə tutulub', 'Yem qabı üçün yer', 'Asan təmizlənmə'],
      en: ['Designed for birds', 'Space for a food cup', 'Easy to clean'],
      ru: ['Для птиц', 'Есть место для кормушки', 'Легко очищается']
    }
  },
  {
    id: 8,
    slug: 'grooming-baxim-paketi',
    name: { az: 'Grooming baxım paketi', en: 'Grooming care package', ru: 'Пакет груминга' },
    categoryKey: 'grooming',
    typeKey: 'grooming',
    audiences: ['cats', 'dogs'],
    collections: ['popular'],
    price: 30,
    image: '/products/grooming.svg',
    images: ['/products/grooming.svg', '/products/grooming-alt.svg', '/products/bowl-alt.svg'],
    badge: { az: 'Xidmət', en: 'Service', ru: 'Услуга' },
    stock: 'preOrder',
    description: { az: 'Tük kəsimi, yuma və gigiyena üçün ilkin grooming paketi.', en: 'A starter grooming package for haircut, washing and hygiene.', ru: 'Базовый пакет груминга: стрижка, купание и гигиенический уход.' },
    details: {
      az: ['Pişik və itlər üçün', 'WhatsApp ilə vaxt razılaşdırılır', 'Qiymət ölçüyə görə dəyişə bilər'],
      en: ['For cats and dogs', 'Appointment is arranged via WhatsApp', 'Price may vary by pet size'],
      ru: ['Для кошек и собак', 'Время согласовывается через WhatsApp', 'Цена может зависеть от размера питомца']
    }
  },
  {
    id: 9,
    slug: 'pisik-biotualeti',
    name: { az: 'Qapalı pişik biotualeti', en: 'Covered cat toilet', ru: 'Закрытый туалет для кошек' },
    categoryKey: 'toilets',
    typeKey: 'toilet',
    audiences: ['cats'],
    collections: ['new'],
    price: 39,
    image: '/products/cat-litter.svg',
    images: ['/products/cat-litter.svg', '/products/cat-toilet-alt.svg', '/products/cat-litter-alt.svg'],
    badge: { az: 'Yeni', en: 'New', ru: 'Новинка' },
    stock: 'inStock',
    description: { az: 'Pişiklər üçün qapalı və səliqəli biotualet modeli.', en: 'A covered and tidy cat toilet model.', ru: 'Аккуратный закрытый туалет для кошек.' },
    details: {
      az: ['Pişiklər üçün biotualet', 'Evdə səliqəli görünür', 'Qoxu yayılmasını azaltmağa kömək edir'],
      en: ['Cat toilet', 'Looks tidy at home', 'Helps reduce odor spread'],
      ru: ['Туалет для кошек', 'Аккуратно смотрится дома', 'Помогает уменьшить распространение запаха']
    }
  },
  {
    id: 10,
    slug: 'gemirici-qefesi',
    name: { az: 'Gəmirici qəfəsi', en: 'Rodent cage', ru: 'Клетка для грызунов' },
    categoryKey: 'hamsters',
    typeKey: 'cage',
    audiences: ['hamsters'],
    collections: ['discount', 'new'],
    price: 32,
    oldPrice: 38,
    image: '/products/bird-cage.svg',
    images: ['/products/bird-cage.svg', '/products/dog-cage-alt.svg', '/products/hamster-food.svg'],
    badge: { az: 'Endirim', en: 'Sale', ru: 'Скидка' },
    stock: 'inStock',
    description: { az: 'Gəmiricilər üçün kompakt və rahat qəfəs.', en: 'A compact and comfortable cage for rodents.', ru: 'Компактная и удобная клетка для грызунов.' },
    details: {
      az: ['Gəmiricilər üçün', 'Kompakt ölçü', 'Aksesuarlar üçün yer'],
      en: ['For rodents', 'Compact size', 'Space for accessories'],
      ru: ['Для грызунов', 'Компактный размер', 'Есть место для аксессуаров']
    }
  },
  {
    id: 11,
    slug: 'akvarium-start-desti',
    name: { az: 'Akvarium start dəsti', en: 'Aquarium starter set', ru: 'Стартовый набор для аквариума' },
    categoryKey: 'aquariums',
    typeKey: 'aquarium',
    audiences: ['fish'],
    collections: ['popular', 'new'],
    price: 55,
    image: '/products/toy-balls.svg',
    images: ['/products/toy-balls.svg', '/products/fish-food.svg', '/products/bowl-alt.svg'],
    badge: { az: 'Yeni', en: 'New', ru: 'Новинка' },
    stock: 'preOrder',
    description: { az: 'Balıqlar üçün sadə akvarium start dəsti.', en: 'A simple aquarium starter set for fish.', ru: 'Простой стартовый набор для аквариума.' },
    details: {
      az: ['Balıqlar üçün', 'Start üçün rahat seçim'],
      en: ['For fish', 'Convenient starter choice'],
      ru: ['Для рыб', 'Подходит для старта']
    }
  },
  {
    id: 12,
    slug: 'baxim-sampunu',
    name: { az: 'Heyvanlar üçün baxım şampunu', en: 'Pet care shampoo', ru: 'Шампунь для ухода за питомцами' },
    categoryKey: 'care',
    typeKey: 'care',
    audiences: ['cats', 'dogs'],
    collections: ['discount'],
    price: 16,
    oldPrice: 20,
    image: '/products/grooming.svg',
    images: ['/products/grooming.svg', '/products/grooming-alt.svg', '/products/cat-litter-alt.svg'],
    badge: { az: 'Endirim', en: 'Sale', ru: 'Скидка' },
    stock: 'inStock',
    description: { az: 'Pişik və itlərin gündəlik baxımı üçün yumşaq şampun.', en: 'A gentle shampoo for daily care of cats and dogs.', ru: 'Мягкий шампунь для ухода за кошками и собаками.' },
    details: {
      az: ['Pişik və itlər üçün', 'Yumşaq qulluq', 'Grooming bölməsi ilə uyğun məhsul'],
      en: ['For cats and dogs', 'Gentle care', 'Works well with the grooming section'],
      ru: ['Для кошек и собак', 'Мягкий уход', 'Подходит для раздела груминга']
    }
  }
,
  {
    id: 13,
    slug: 'it-ucun-qefes',
    name: { az: 'İt üçün qatlanan qəfəs', en: 'Foldable dog crate', ru: 'Складная клетка для собак' },
    categoryKey: 'dog-cages',
    typeKey: 'cage',
    audiences: ['dogs'],
    collections: ['popular', 'new'],
    price: 68,
    oldPrice: 78,
    image: '/products/dog-cage.svg',
    images: ['/products/dog-cage.svg', '/products/dog-cage-alt.svg', '/products/pet-bed-alt.svg'],
    badge: { az: 'Populyar', en: 'Popular', ru: 'Популярное' },
    stock: 'inStock',
    description: { az: 'İtlər üçün evdə və səyahətdə rahat istifadə olunan qatlanan qəfəs.', en: 'A foldable crate for dogs, convenient for home and travel.', ru: 'Складная клетка для собак, удобная для дома и поездок.' },
    details: {
      az: ['İtlər üçün nəzərdə tutulub', 'Qatlanan konstruksiya', 'Ev və səyahət üçün rahatdır'],
      en: ['Designed for dogs', 'Foldable construction', 'Convenient for home and travel'],
      ru: ['Для собак', 'Складная конструкция', 'Подходит для дома и поездок']
    }
  },
  {
    id: 14,
    slug: 'it-ucun-gezinti-xaltasi',
    name: { az: 'İt üçün gəzinti xaltası', en: 'Dog walking leash', ru: 'Поводок для прогулки с собакой' },
    categoryKey: 'leashes',
    typeKey: 'leash',
    audiences: ['dogs'],
    collections: ['discount'],
    price: 14,
    oldPrice: 18,
    image: '/products/dog-leash.svg',
    images: ['/products/dog-leash.svg', '/products/carrier-alt.svg', '/products/dog-toy.svg'],
    badge: { az: 'Endirim', en: 'Sale', ru: 'Скидка' },
    stock: 'inStock',
    description: { az: 'Gündəlik gəzinti üçün yüngül və rahat xalta.', en: 'A light and comfortable leash for daily walks.', ru: 'Лёгкий и удобный поводок для ежедневных прогулок.' },
    details: {
      az: ['İtlər üçün gəzinti məhsulu', 'Rahat tutacaq', 'Gündəlik istifadə üçün uyğundur'],
      en: ['Walking product for dogs', 'Comfortable handle', 'Suitable for daily use'],
      ru: ['Для прогулок с собакой', 'Удобная ручка', 'Подходит для ежедневного использования']
    }
  },
  {
    id: 15,
    slug: 'it-ucun-yumsaq-yuva',
    name: { az: 'İt üçün yumşaq yuva', en: 'Soft dog bed', ru: 'Мягкая лежанка для собак' },
    categoryKey: 'beds',
    typeKey: 'bed',
    audiences: ['dogs'],
    collections: ['new', 'popular'],
    price: 49,
    image: '/products/pet-bed-alt.svg',
    images: ['/products/pet-bed-alt.svg', '/products/pet-bed.svg', '/products/dog-cage-alt.svg'],
    badge: { az: 'Yeni', en: 'New', ru: 'Новинка' },
    stock: 'lowStock',
    description: { az: 'Kiçik və orta ölçülü itlər üçün yumşaq və isti yuva.', en: 'A soft and warm bed for small and medium dogs.', ru: 'Мягкая и тёплая лежанка для маленьких и средних собак.' },
    details: {
      az: ['İtlər üçün rahat yuva', 'Yumşaq içlik', 'Yuyulması rahat material'],
      en: ['Comfortable dog bed', 'Soft filling', 'Easy-to-clean material'],
      ru: ['Удобная лежанка для собак', 'Мягкий наполнитель', 'Материал легко чистится']
    }
  },
  {
    id: 16,
    slug: 'it-ucun-oyuncaq-ayicik',
    name: { az: 'İt üçün yumşaq oyuncaq', en: 'Soft toy for dogs', ru: 'Мягкая игрушка для собак' },
    categoryKey: 'toys',
    typeKey: 'toy',
    audiences: ['dogs'],
    collections: ['popular'],
    price: 11,
    image: '/products/dog-toy.svg',
    images: ['/products/dog-toy.svg', '/products/toy-balls-alt.svg', '/products/dog-food-alt.svg'],
    stock: 'inStock',
    description: { az: 'İtlərin gündəlik oyunu üçün yumşaq və yüngül oyuncaq.', en: 'A soft and light toy for dogs to play with daily.', ru: 'Мягкая и лёгкая игрушка для ежедневных игр собак.' },
    details: {
      az: ['İtlər üçün oyuncaq', 'Ev içi oyunlara uyğundur', 'Yüngül və yumşaqdır'],
      en: ['Toy for dogs', 'Good for indoor play', 'Light and soft'],
      ru: ['Игрушка для собак', 'Подходит для домашних игр', 'Лёгкая и мягкая']
    }
  },
  {
    id: 17,
    slug: 'pisik-ucun-odul-mamasi',
    name: { az: 'Pişik üçün ödül maması', en: 'Cat treats', ru: 'Лакомство для кошек' },
    categoryKey: 'treats',
    typeKey: 'treat',
    audiences: ['cats'],
    collections: ['discount', 'new'],
    price: 9,
    oldPrice: 12,
    image: '/products/cat-treat.svg',
    images: ['/products/cat-treat.svg', '/products/cat-food-alt.svg', '/products/toy-balls-alt.svg'],
    badge: { az: 'Endirim', en: 'Sale', ru: 'Скидка' },
    stock: 'inStock',
    description: { az: 'Pişikləri sevindirmək və təlim üçün dadlı ödül maması.', en: 'Tasty cat treats for rewards and training.', ru: 'Вкусное лакомство для поощрения и тренировки кошек.' },
    details: {
      az: ['Pişiklər üçün', 'Təlim və mükafat üçün', 'Kiçik porsiyalar'],
      en: ['For cats', 'For training and rewards', 'Small portions'],
      ru: ['Для кошек', 'Для дрессировки и поощрения', 'Небольшие порции']
    }
  },
  {
    id: 18,
    slug: 'yem-su-qabi',
    name: { az: 'Yem və su qabı', en: 'Food and water bowl', ru: 'Миска для корма и воды' },
    categoryKey: 'bowls',
    typeKey: 'bowl',
    audiences: ['cats', 'dogs'],
    collections: ['new'],
    price: 13,
    image: '/products/bowl-alt.svg',
    images: ['/products/bowl-alt.svg', '/products/dog-food-alt.svg', '/products/cat-food-alt.svg'],
    stock: 'inStock',
    description: { az: 'Pişik və itlər üçün gündəlik istifadə edilən sadə yem və su qabı.', en: 'A simple food and water bowl for cats and dogs.', ru: 'Простая миска для корма и воды для кошек и собак.' },
    details: {
      az: ['Pişik və itlər üçün', 'Yüngül və rahat', 'Gündəlik istifadə üçün'],
      en: ['For cats and dogs', 'Light and convenient', 'For daily use'],
      ru: ['Для кошек и собак', 'Лёгкая и удобная', 'Для ежедневного использования']
    }
  },
  {
    id: 19,
    slug: 'baliq-yemi',
    name: { az: 'Balıqlar üçün yem', en: 'Fish food', ru: 'Корм для рыб' },
    categoryKey: 'aquariums',
    typeKey: 'dryFood',
    audiences: ['fish'],
    collections: ['popular'],
    price: 8,
    image: '/products/fish-food.svg',
    images: ['/products/fish-food.svg', '/products/toy-balls.svg', '/products/bowl-alt.svg'],
    stock: 'inStock',
    description: { az: 'Akvarium balıqları üçün gündəlik yem.', en: 'Daily food for aquarium fish.', ru: 'Ежедневный корм для аквариумных рыб.' },
    details: {
      az: ['Balıqlar üçün', 'Gündəlik yem', 'Akvarium məhsulları ilə uyğun'],
      en: ['For fish', 'Daily food', 'Works with aquarium products'],
      ru: ['Для рыб', 'Ежедневный корм', 'Подходит для аквариумного раздела']
    }
  },
  {
    id: 20,
    slug: 'gemirici-yemi',
    name: { az: 'Gəmiricilər üçün yem', en: 'Rodent food', ru: 'Корм для грызунов' },
    categoryKey: 'hamsters',
    typeKey: 'dryFood',
    audiences: ['hamsters'],
    collections: ['new'],
    price: 10,
    image: '/products/hamster-food.svg',
    images: ['/products/hamster-food.svg', '/products/bird-cage-alt.svg', '/products/dog-cage-alt.svg'],
    stock: 'inStock',
    description: { az: 'Gəmiricilərin gündəlik qidalanması üçün yem qarışığı.', en: 'Food mix for daily rodent nutrition.', ru: 'Кормовая смесь для ежедневного рациона грызунов.' },
    details: {
      az: ['Gəmiricilər üçün', 'Gündəlik istifadə', 'Qəfəs aksesuarları ilə uyğun'],
      en: ['For rodents', 'Daily use', 'Works with cage accessories'],
      ru: ['Для грызунов', 'Для ежедневного использования', 'Подходит к аксессуарам для клетки']
    }
  }
];

export const deliverySettings = {
  workingHours: '10:00 – 22:00',
  workingDays: {
    az: 'Hər gün',
    en: 'Every day',
    ru: 'Каждый день'
  },
  provider: 'Bolt',
  deliveryOnlyText: {
    az: 'Çatdırılma yalnız Bolt vasitəsilə həyata keçirilir.',
    en: 'Delivery is available only via Bolt.',
    ru: 'Доставка осуществляется только через Bolt.'
  },
  deliveryTimeText: {
    az: 'Hər gün 10:00-dan 22:00-dək',
    en: 'Every day from 10:00 to 22:00',
    ru: 'Каждый день с 10:00 до 22:00'
  },
  metroDeliveryPrice: 'Bolt',
  addressDeliveryFromPrice: {
    az: 'Bolt vasitəsilə',
    en: 'via Bolt',
    ru: 'через Bolt'
  },
  regionPostDeliveryFromPrice: {
    az: 'Yalnız Bolt çatdırılması',
    en: 'Bolt delivery only',
    ru: 'Только доставка Bolt'
  },
  regionPostDeliveryTime: {
    az: 'Yalnız Bolt çatdırılması',
    en: 'Bolt delivery only',
    ru: 'Только доставка Bolt'
  },
  addressDeliveryNote: {
    az: 'Sifarişlər hər gün 10:00–22:00 aralığında Bolt ilə göndərilir',
    en: 'Orders are delivered by Bolt every day between 10:00 and 22:00',
    ru: 'Заказы доставляются через Bolt каждый день с 10:00 до 22:00'
  },
  postDeliveryNote: {
    az: 'Çatdırılma yalnız Bolt ilə edilir',
    en: 'Delivery is available only via Bolt',
    ru: 'Доставка осуществляется только через Bolt'
  }
};

export const groomingServices: Record<Lang, string[]> = {
  az: ['Tük kəsimi', 'Yuma və qurutma', 'Daraq və tükləmə', 'Dırnaq baxımı', 'Gigiyenik baxım', 'Qulluq məsləhəti'],
  en: ['Haircut', 'Washing and drying', 'Brushing and deshedding', 'Nail care', 'Hygiene care', 'Care advice'],
  ru: ['Стрижка', 'Купание и сушка', 'Расчёсывание и вычёсывание', 'Уход за когтями', 'Гигиенический уход', 'Консультация по уходу']
};


export function getDepartmentForProductType(key: ProductTypeKey) {
  return productTypeDepartmentMap[key] ?? 'care';
}

export function getDepartmentLabel(key: ProductDepartmentKey, lang: Lang) {
  return productDepartmentOptions.find(department => department.key === key)?.label[lang] ?? key;
}

export function getSubcategoryOptionsForDepartment(key: ProductDepartmentKey | 'all') {
  if (key === 'all') return productTypeOptions;
  const department = productDepartmentOptions.find(item => item.key === key);
  const allowed = department?.subcategories ?? [];
  return productTypeOptions.filter(item => allowed.includes(item.key));
}

export function getCategory(key: string) {
  return categories.find(category => category.key === key) ?? categories[0];
}

export function getCategoryLabel(key: string, lang: Lang) {
  return getCategory(key).name[lang];
}

export function getProductTypeLabel(key: ProductTypeKey, lang: Lang) {
  return productTypeOptions.find(type => type.key === key)?.label[lang] ?? key;
}

export function getAudienceLabel(key: AudienceKey, lang: Lang) {
  return audienceOptions.find(audience => audience.key === key)?.label[lang] ?? key;
}

export function getCatalogDepartmentOptions(filters: CatalogFilters = emptyCatalogFilters) {
  const seen = new Set<string>();

  return [...productDepartmentOptions, ...filters.departments].filter(option => {
    if (!option.key || seen.has(option.key)) return false;
    seen.add(option.key);
    return true;
  });
}

export function getCatalogSubcategoryOptionsForDepartment(
  departmentKey: ProductDepartmentKey | 'all',
  filters: CatalogFilters = emptyCatalogFilters
) {
  const staticOptions = getSubcategoryOptionsForDepartment(departmentKey);
  const customOptions = departmentKey === 'all'
    ? filters.subcategories
    : filters.subcategories.filter(option => option.departmentKey === departmentKey);
  const seen = new Set<string>();

  return [...staticOptions, ...customOptions].filter(option => {
    if (!option.key || seen.has(option.key)) return false;
    seen.add(option.key);
    return true;
  });
}

export function getCatalogDepartmentForProductType(
  typeKey: ProductTypeKey,
  filters: CatalogFilters = emptyCatalogFilters
) {
  return filters.subcategories.find(option => option.key === typeKey)?.departmentKey
    || getDepartmentForProductType(typeKey);
}

export function getProductDepartmentKey(
  product: Pick<Product, 'departmentKey' | 'typeKey' | 'categoryKey'>,
  filters: CatalogFilters = emptyCatalogFilters
) {
  if (product.departmentKey) return product.departmentKey;

  const customTypeDepartment = filters.subcategories.find(option => option.key === product.typeKey)?.departmentKey;
  if (customTypeDepartment) return customTypeDepartment;

  if (filters.departments.some(option => option.key === product.categoryKey)) return product.categoryKey;

  return getDepartmentForProductType(product.typeKey);
}

export function getCatalogDepartmentLabel(
  key: ProductDepartmentKey,
  lang: Lang,
  filters: CatalogFilters = emptyCatalogFilters
) {
  return filters.departments.find(option => option.key === key)?.label[lang]
    || getDepartmentLabel(key, lang);
}

export function getCatalogProductTypeLabel(
  key: ProductTypeKey,
  lang: Lang,
  filters: CatalogFilters = emptyCatalogFilters
) {
  return filters.subcategories.find(option => option.key === key)?.label[lang]
    || getProductTypeLabel(key, lang);
}

export function getProductCategoryLabel(
  product: Pick<Product, 'departmentKey' | 'departmentLabel' | 'typeKey' | 'categoryKey'>,
  lang: Lang,
  filters: CatalogFilters = emptyCatalogFilters
) {
  const embeddedDepartmentLabel = product.departmentLabel?.[lang]
    || product.departmentLabel?.az
    || product.departmentLabel?.en
    || product.departmentLabel?.ru;

  if (embeddedDepartmentLabel) return embeddedDepartmentLabel;

  const customSubcategory = filters.subcategories.find(option => option.key === product.typeKey);
  if (customSubcategory) {
    return getCatalogDepartmentLabel(customSubcategory.departmentKey, lang, filters);
  }

  const customDepartment = filters.departments.find(option => (
    option.key === product.departmentKey || option.key === product.categoryKey
  ));

  if (customDepartment) return customDepartment.label[lang];

  const category = categories.find(option => option.key === product.categoryKey);
  if (category) return category.name[lang];

  return getCatalogDepartmentLabel(getProductDepartmentKey(product, filters), lang, filters);
}

export function getProductTypeDisplayLabel(
  product: Pick<Product, 'typeKey' | 'typeLabel'>,
  lang: Lang,
  filters: CatalogFilters = emptyCatalogFilters
) {
  return product.typeLabel?.[lang]
    || product.typeLabel?.az
    || product.typeLabel?.en
    || product.typeLabel?.ru
    || getCatalogProductTypeLabel(product.typeKey, lang, filters);
}
