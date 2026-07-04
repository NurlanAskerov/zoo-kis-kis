'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Lang } from '@/lib/data';

export type { Lang } from '@/lib/data';

type Dict = Record<string, string>;

const dictionaries: Record<Lang, Dict> = {
  az: {
    home: 'Ana səhifə',
    products: 'Məhsullar',
    grooming: 'Grooming',
    delivery: 'Çatdırılma',
    about: 'Haqqımızda',
    contact: 'Əlaqə',
    cart: 'Səbətim',
    favorites: 'Seçilmişlər',
    profile: 'Profil',
    menu: 'Menyu',
    categories: 'Kateqoriyalar',
    workHours: 'İş saatları',
    demoCopy: 'Next.js e-commerce demo',

    heroKicker: 'Zooshop • Grooming • Pet care',
    heroTitle: 'Sevimli dostlarınız üçün rahat alış-veriş.',
    heroText: 'Zoo Kis-Kis-də yemlər, aksesuarlar, qulluq məhsulları və grooming xidməti bir ünvandadır.',
    viewProducts: 'Məhsullara bax',
    orderGrooming: 'Grooming sifariş et',
    whatsapp: 'WhatsApp ilə yaz',
    deliveryAvailable: 'Çatdırılma var',
    easyChoice: 'Rahat seçim',
    petCare: 'Pet care dəstəyi',
    saleLabel: 'Endirimlər',

    why: 'Niyə biz?',
    whyTitle: 'Zoo Kis-Kis-i seçmək niyə rahatdır?',
    catalog: 'Rahat seçim',
    catalogText: 'Məhsullar pişik, it, quş, balıq və gəmiricilər üzrə ayrılıb. Yem, yuva, biotualet və aksesuar kimi seçimlər filtrdə aydın görünür.',
    care: 'Mağaza və baxım bir yerdə',
    careText: 'Məhsul seçimi, qulluq xidməti, ünvan və əlaqə məlumatları eyni yerdə olduğu üçün müştəri əlavə axtarış etmədən sifarişini tamamlayır.',

    discountedProducts: 'Endirimli məhsullar',
    popularProducts: 'Populyar məhsullar',
    newProducts: 'Yeni məhsullar',
    seeAll: 'Hamısını göstər',

    groomingTitle: 'Grooming üçün rahat müraciət',
    groomingText: 'Tük kəsimi, yuma, daraq/tükləmə və dırnaq baxımı üçün qısa məlumat göndərin. Komanda uyğun vaxtı WhatsApp-da sizinlə dəqiqləşdirəcək.',
    groomingPage: 'Grooming səhifəsi',
    groomingHomeNote: 'Ünvan tələb olunmur. Sadəcə heyvanın növü/cinsi, adı, xidmət və uyğun vaxt yazılır.',
    applyNow: 'İndi müraciət et',
    deliveryTitle: 'Wolt ilə çatdırılma',
    metro: 'Wolt çatdırılma',
    addressDelivery: 'Wolt çatdırılma',
    regionPost: 'Wolt çatdırılma',
    moreInfo: 'Ətraflı məlumat',
    deliveryText: 'Çatdırılma yalnız Wolt vasitəsilədir. Sifarişlər hər gün 10:00-dan 22:00-dək göndərilir.',
    deliveryBenefitText: 'Çatdırılma yalnız Wolt ilə, hər gün 10:00–22:00 aralığında aktivdir.',
    toastAdded: 'səbətə əlavə olundu',
    toastRemoved: 'səbətdən silindi',
    toastCleared: 'Səbət təmizləndi',

    addToCart: 'Səbətə əlavə et',
    details: 'Detallara bax',
    price: 'Qiymət',
    stock: 'Stok',
    productDetails: 'Məhsul detalları',
    backToProducts: 'Məhsullara qayıt',
    shareOnWhatsapp: 'WhatsApp-da soruş',

    productsKicker: 'Zooshop kataloqu',
    productsTitle: 'Məhsulu rahat tapın',
    productsText: 'İtlər, pişiklər və digər dostlar üçün məhsulları növə, kateqoriyaya və məhsul tipinə görə süzün.',
    allProducts: 'Bütün məhsullar',
    petType: 'Heyvan növü',
    productType: 'Alt kateqoriya',
    department: 'Bölmə',
    subcategory: 'Alt kateqoriya',
    allInDepartment: 'Bu bölmədə hamısı',
    category: 'Kateqoriya',
    collection: 'Seçim',
    clearFilters: 'Filtrləri təmizlə',
    results: 'nəticə',
    noProducts: 'Bu filtrə uyğun məhsul tapılmadı.',
    all: 'Hamısı',
    searchProducts: 'Məhsul adı ilə axtar',
    filters: 'Filtrlər',
    filterHint: 'Əvvəl heyvan növünü, sonra bölməni və alt kateqoriyanı seçin. Belə istifadəçi nə axtardığını daha rahat tapır.',
    filterResultsSuffix: 'nəticələri:',
    showResults: 'Nəticələri göstər',
    shareProduct: 'Paylaş',

    categoryCatsTitle: 'Pişik məhsulları',
    categoryCatsText: 'Yemlər, qumlar, biotualetlər və oyuncaqlar',
    categoryDogsTitle: 'İt məhsulları',
    categoryDogsText: 'Yemlər, yuvalar, çantalar və xaltalar',
    categoryBirdsTitle: 'Quş məhsulları',
    categoryBirdsText: 'Qəfəslər və quş aksesuarları',
    categoryFishTitle: 'Balıq məhsulları',
    categoryFishText: 'Akvariumlar, balıq yemləri və aksesuarlar',
    categoryHamstersTitle: 'Gəmirici məhsulları',
    categoryHamstersText: 'Gəmirici qəfəsləri, yemlər və aksesuarlar',

    aboutKicker: 'Haqqımızda',
    aboutTitle: 'Zoo Kis-Kis nə edir?',
    aboutText: 'Zoo Kis-Kis sevimli dostlarınız üçün yem, aksesuar, qulluq məhsulları və grooming xidmətini bir ünvanda təqdim edir. Məqsədimiz məhsulu rahat tapmaq, sifarişi tez göndərmək və müştəriyə aydın seçim imkanı yaratmaqdır.',
    aboutPoint1: 'Quru yem, yaş yem, oyuncaqlar və aksesuarlar',
    aboutPoint2: 'Grooming və qulluq xidməti',
    aboutGreenTitle: 'Sevimli dostlara daha yaxın.',
    aboutGreenText: 'Xəritə və sosial media hesabları vasitəsilə mağaza ilə rahat əlaqə saxlayın.',
    mapAndSocial: 'Xəritə və sosial media',
    mapAndSocialText: 'Ünvanı xəritədən görün, Instagram və TikTok hesablarına keçin və WhatsApp ilə tez əlaqə saxlayın.',

    cartEmptyTitle: 'Səbətiniz hələ boşdur.',
    cartEmptyText: 'Məhsullara baxın və sevimli dostunuz üçün lazım olanları əlavə edin.',
    goToProducts: 'Məhsullara keç',
    cartTitle: 'Sifarişinizi tamamlayın',
    cartText: 'Səbət məlumatları brauzerdə saxlanılır və sifariş WhatsApp vasitəsilə göndərilir.',
    remove: 'Sil',
    summary: 'Yekun',
    deliveryPriceInfo: 'Çatdırılma Wolt vasitəsilədir və hər gün 10:00–22:00 aralığında aktivdir.',
    checkout: 'Sifarişi tamamla',
    clearCart: 'Səbəti təmizlə',

    checkoutKicker: 'Sifariş',
    checkoutTitle: 'Sifariş məlumatları',
    checkoutText: 'Səbətdəki məhsullar hazır WhatsApp mesajına çevrilir. Məlumatları bir dəfə profildə saxlasanız, növbəti sifarişdə avtomatik gələcək.',
    fullName: 'Ad Soyad',
    phone: 'Telefon',
    address: 'Ünvan',
    deliveryType: 'Çatdırılma üsulu',
    postDelivery: 'Wolt çatdırılma',
    note: 'Əlavə qeyd',
    sendOrder: 'Sifariş göndər',
    whatsappFastTitle: 'WhatsApp ilə daha sürətli sifariş',
    whatsappFastText: 'Düyməyə basın, məlumatlarınızı yoxlayın və hazır sifariş mətnini WhatsApp-a göndərin.',

    contactTitle: 'Bizimlə əlaqə',
    sendMessage: 'Mesaj göndər',
    yourName: 'Adınız',
    yourMessage: 'Mesajınız',
    send: 'Göndər',

    deliveryPageTitle: 'Wolt ilə çatdırılma',
    deliveryPageText: 'Çatdırılma yalnız Wolt vasitəsilədir',
    toMetro: 'Çatdırılma platforması',
    toAddress: 'İş saatı',
    toRegions: 'Qeyd',

    groomingPageTitle: 'Grooming və qulluq xidməti',
    groomingPageText: 'Tük kəsimi, yuma, daraq/tükləmə, gigiyena və dırnaq baxımı üçün müraciətinizi WhatsApp-a hazır formada göndərin.',
    bookGrooming: 'Grooming sifariş et',
    groomingBookText: 'Qiymət heyvanın növü, ölçüsü və xidmətə görə dəyişə bilər. Ən rahat yol WhatsApp ilə yazmaqdır.',
    serviceTypes: 'Xidmət növləri',
    workWithUs: 'Bizimlə işlə',
    groomerTitle: 'Peşəkar grooming bacarığınız var?',
    groomerText: 'Zoo Kis-Kis komandası ilə işləmək üçün bizimlə əlaqə saxlayın. Təcrübəsi olan şəxslər WhatsApp və ya Instagram direct vasitəsilə əl işlərini göndərə bilərlər.',
    apply: 'Müraciət et',

    adminPanel: 'Admin panel',
    adminTitle: 'İdarəetmə paneli',
    adminText: 'Məhsulları, şəkilləri, stok statusunu, çatdırılma məlumatlarını və sifarişləri buradan idarə edin.',
    productList: 'Məhsul siyahısı',
    addProduct: 'Məhsul əlavə et',
    deliverySettings: 'Çatdırılma ayarları',
    orders: 'Sifarişlər',
    productName: 'Məhsul adı',
    chooseCategory: 'Kateqoriya seç',
    imagePath: 'Şəkil URL və ya upload yolu',
    save: 'Yadda saxla',
    settings: 'Ayarlar',
    updateSettings: 'Ayarları yenilə',
    lastOrders: 'Son sifarişlər',
    customer: 'Müştəri',
    status: 'Status',
    amount: 'Məbləğ',
    demoCustomer: 'Demo müştəri',
    pending: 'Gözləmədə',
    confirmed: 'Təsdiq olunub',
    whatsappOrder: 'WhatsApp sifarişi',
    name: 'Ad',
    otherImages: 'Digər şəkillər',
    call: 'Zəng et',
    close: 'Bağla',
    favoritesTitle: 'Seçilmiş məhsullarınız',
    favoritesText: 'Bəyəndiyiniz məhsullar burada saxlanılır. İstənilən vaxt səbətə əlavə edə bilərsiniz.',
    favoritesEmptyTitle: 'Hələ seçilmiş məhsul yoxdur.',
    favoritesEmptyText: 'Məhsul kartlarında ürək işarəsinə toxunaraq məhsulları sevimlilərə əlavə edin.',
    favoriteProducts: 'Seçilmişləriniz',
    similarProducts: 'Oxşar məhsullar',
    sameTypeProducts: 'Eyni tip məhsullar',
    moreForThisPet: 'Bu heyvan növü üçün',
    recommendedForYou: 'Sizin üçün seçdik',
    clearFavorites: 'Seçilmişləri təmizlə',
    city: 'Şəhər',
    saveProfile: 'Məlumatları yadda saxla',
    sendWhatsappOrder: 'WhatsApp ilə sifariş göndər',
    sendToWhatsapp: 'WhatsApp-a göndər',
    profileSaved: 'Məlumatlar saxlanıldı',
    profileFormHint: 'Profil məlumatlarını bir dəfə doldursanız, sifariş və WhatsApp müraciətlərində avtomatik istifadə olunacaq.',
    groomingFormTitle: 'Grooming müraciət forması',
    groomingFormText: 'İndi müraciət et düyməsinə basanda forma açılır. Ad və telefon profilinizdə varsa avtomatik gəlir, yoxdursa forma içində yazıb göndərə bilərsiniz.',
    groomingMiniStep1: 'Heyvanın növünü və cinsini yazın: məsələn, çihuahua iti, pişik, gəmirici.',
    groomingMiniStep2: 'İstədiyiniz xidməti seçin və uyğun günü qeyd edin.',
    groomingMiniStep3: 'Mesaj WhatsApp-a hazır formada gedir, mağaza uyğun vaxtı təsdiqləyir.',
    petTypeInput: 'Heyvanın növü / cinsi, məsələn: çihuahua iti',
    petName: 'Heyvanın adı',
    preferredTime: 'Sizə uyğun gün və saat',
    groomerApplyHint: 'Əl işlərini WhatsApp və ya Instagram direct ilə göndərə bilərsiniz.',
    adminLoginTitle: 'Admin panelə giriş',
    adminLoginText: 'Məhsul əlavə etmək və aktiv/passiv etmək üçün admin şifrəsini daxil edin.',
    adminPassword: 'Admin şifrəsi',
    login: 'Daxil ol',
    logout: 'Çıxış',
    adminProductEditor: 'Məhsul məlumatlarını doldur',
    adminProductEditorText: 'AZ məcburidir, EN/RU boş qalsa AZ mətn fallback kimi istifadə olunur. Sağ tərəfdə kartın saytda necə görünəcəyini canlı görürsünüz.',
    productPreview: 'Məhsul kartı preview',
    previewText: 'Bu kart istifadəçinin saytda görəcəyi görünüşdür.',
    filtersAndPrice: 'Filterlər və qiymət',
    imagesAndBadge: 'Şəkillər və qırmızı badge',
    mainImagePath: 'Əsas şəkil yolu',
    extraImagePaths: 'Əlavə şəkillər - hər sətirdə bir yol',
    oldPriceField: 'Köhnə qiymət / endirim üçün',
    activeProduct: 'Məhsul aktivdir',
    inactiveProduct: 'Məhsul passivdir',
    saving: 'Saxlanılır', checkoutSimpleText: 'Sifarişi uzatmadan WhatsApp-a göndərin. Lazım olan məlumatlar modalda görünəcək.', profileReadyOrder: 'Profil məlumatları tapıldı, sifariş modalında avtomatik dolacaq.', profileMissingOrder: 'Profil boşdursa, sifariş modalında məlumatları yazıb göndərə bilərsiniz.', orderModalTitle: 'Sifariş mesajını yoxlayın', orderProfileFound: 'Profil məlumatlarınız tapıldı və forma avtomatik dolduruldu.', orderProfileMissing: 'Profil məlumatları yoxdur. Lazım olan xanaları doldurun, sonra göndərin.', messagePreview: 'Göndəriləcək mesaj', profileReadyGrooming: 'Profil məlumatları tapıldı. Grooming modalında ad və telefon avtomatik dolacaq.', profileMissingGrooming: 'Profil boşdursa, grooming modalında ad və telefonu yazmaq kifayətdir.', groomingModalTitle: 'Grooming müraciətini yoxlayın'
  },
  en: {
    home: 'Home', products: 'Products', grooming: 'Grooming', delivery: 'Delivery', about: 'About us', contact: 'Contact', cart: 'Cart', favorites: 'Favorites', profile: 'Profile', menu: 'Menu', categories: 'Categories', workHours: 'Working hours', demoCopy: 'Next.js e-commerce demo',
    heroKicker: 'Zooshop • Grooming • Pet care', heroTitle: 'Easy shopping for your lovely pets.', heroText: 'At Zoo Kis-Kis, pet food, accessories, care products and grooming services are all in one place.', viewProducts: 'View products', orderGrooming: 'Book grooming', whatsapp: 'Write on WhatsApp', deliveryAvailable: 'Delivery available', easyChoice: 'Easy choice', petCare: 'Pet care support', saleLabel: 'Discounts',
    why: 'Why choose us?', whyTitle: 'Why is Zoo Kis-Kis easy to choose?', catalog: 'Easy selection', catalogText: 'Products are separated by cats, dogs, birds, fish and rodents, with clear filters for food, beds, toilets and accessories.', care: 'Shop and care together', careText: 'Products, grooming, address and contact details are kept in one place, so customers can complete the order without extra searching.',
    discountedProducts: 'Discounted products', popularProducts: 'Popular products', newProducts: 'New arrivals', seeAll: 'See all',
    groomingTitle: 'Easy grooming request', groomingText: 'Send short details for haircut, washing, brushing/deshedding or nail care. The team will confirm the suitable time on WhatsApp.', groomingPage: 'Grooming page', groomingHomeNote: 'No address is needed. Just enter pet type, size, service and preferred time.', applyNow: 'Apply now', deliveryTitle: 'Delivery and store pickup', metro: 'Delivery to metro stations', addressDelivery: 'Wolt delivery', regionPost: 'Regional postal delivery', moreInfo: 'More information', deliveryText: 'Delivery hours, metro delivery, address delivery and regional postal shipping conditions are shown separately.', deliveryBenefitText: 'Delivery price and timing are clear before the customer contacts the store.', toastAdded: 'added to cart', toastRemoved: 'removed from cart', toastCleared: 'Cart cleared',
    addToCart: 'Add to cart', details: 'View details', price: 'Price', stock: 'Stock', productDetails: 'Product details', backToProducts: 'Back to products', shareOnWhatsapp: 'Ask on WhatsApp',
    productsKicker: 'Zooshop catalog', productsTitle: 'Find the right product easily', productsText: 'Filter products for dogs, cats and other pets by pet type, category and product type.', allProducts: 'All products', petType: 'Pet type', productType: 'Subcategory', department: 'Department', subcategory: 'Subcategory', allInDepartment: 'All in this department', category: 'Category', collection: 'Collection', clearFilters: 'Clear filters', results: 'results', noProducts: 'No products match these filters.', all: 'All', searchProducts: 'Search by product name', filters: 'Filters', filterHint: 'Choose pet type first, then department and subcategory so products stay easy to understand.', filterResultsSuffix: 'results:', showResults: 'Show results', shareProduct: 'Share',
    categoryCatsTitle: 'Cat products', categoryCatsText: 'Food, litter, cat toilets and toys', categoryDogsTitle: 'Dog products', categoryDogsText: 'Food, beds, carriers and leashes', categoryBirdsTitle: 'Bird products', categoryBirdsText: 'Cages and bird accessories', categoryFishTitle: 'Fish products', categoryFishText: 'Aquariums, fish food and accessories', categoryHamstersTitle: 'Rodent products', categoryHamstersText: 'Rodent cages, food and accessories',
    aboutKicker: 'About us', aboutTitle: 'What does Zoo Kis-Kis do?', aboutText: 'Zoo Kis-Kis is a pet care place that combines a zooshop and grooming service. Our goal is a simple catalog, quick contact and the right product choices for your pets.', aboutPoint1: 'Dry food, wet food, toys and accessories', aboutPoint2: 'Grooming and care service', aboutGreenTitle: 'Closer to your lovely pets.', aboutGreenText: 'Use the map and social links to reach the store easily.', mapAndSocial: 'Map and social media', mapAndSocialText: 'See the address on the map, open Instagram and TikTok, or contact the store quickly on WhatsApp.',
    cartEmptyTitle: 'Your cart is empty.', cartEmptyText: 'Browse products and add what your pet needs.', goToProducts: 'Go to products', cartTitle: 'Complete your order', cartText: 'Cart data is stored in the browser and the order is sent through WhatsApp.', remove: 'Remove', summary: 'Summary', deliveryPriceInfo: 'Delivery is available via Wolt every day from 10:00 to 22:00.', checkout: 'Complete order', clearCart: 'Clear cart',
    checkoutKicker: 'Checkout', checkoutTitle: 'Order information', checkoutText: 'Cart items turn into a ready WhatsApp message. If you save your profile once, details are filled automatically next time.', fullName: 'Full name', phone: 'Phone', address: 'Address', deliveryType: 'Delivery type', postDelivery: 'Wolt delivery', note: 'Additional note', sendOrder: 'Send order', whatsappFastTitle: 'Order faster via WhatsApp', whatsappFastText: 'Press the button, check your details, and send the ready order text on WhatsApp.',
    contactTitle: 'Contact us', sendMessage: 'Send a message', yourName: 'Your name', yourMessage: 'Your message', send: 'Send',
    deliveryPageTitle: 'Delivery via Wolt', deliveryPageText: 'Delivery is available only via Wolt', toMetro: 'Delivery platform', toAddress: 'Working hours', toRegions: 'Note',
    groomingPageTitle: 'Grooming and care service', groomingPageText: 'Send a ready WhatsApp request for haircut, washing, brushing/deshedding, hygiene and nail care.', bookGrooming: 'Book grooming', groomingBookText: 'The price may vary depending on the pet type, size and service. The easiest way is to write on WhatsApp.', serviceTypes: 'Service types', workWithUs: 'Work with us', groomerTitle: 'Do you have professional grooming skills?', groomerText: 'Contact us to work with the Zoo Kis-Kis team. Experienced groomers can send examples of their work via WhatsApp or Instagram direct.', apply: 'Apply',
    adminPanel: 'Admin panel', adminTitle: 'Management panel', adminText: 'Manage products, images, stock status, delivery information and orders from this panel.', productList: 'Product list', addProduct: 'Add product', deliverySettings: 'Delivery settings', orders: 'Orders', productName: 'Product name', chooseCategory: 'Choose category', imagePath: 'Image URL or upload path', save: 'Save', settings: 'Settings', updateSettings: 'Update settings', lastOrders: 'Recent orders', customer: 'Customer', status: 'Status', amount: 'Amount', demoCustomer: 'Demo customer', pending: 'Pending', confirmed: 'Confirmed', whatsappOrder: 'WhatsApp order', name: 'Name', otherImages: 'Other images', call: 'Call', close: 'Close', favoritesTitle: 'Your favorite products', favoritesText: 'Products you liked are saved here. You can add them to cart anytime.', favoritesEmptyTitle: 'No favorite products yet.', favoritesEmptyText: 'Tap the heart icon on product cards to save products here.', favoriteProducts: 'Your favorites', similarProducts: 'Similar products', sameTypeProducts: 'Same product type', moreForThisPet: 'For this pet type', recommendedForYou: 'Picked for you', clearFavorites: 'Clear favorites', city: 'City', saveProfile: 'Save details', sendWhatsappOrder: 'Send order via WhatsApp', sendToWhatsapp: 'Send to WhatsApp', profileSaved: 'Details saved', profileFormHint: 'Fill your profile once and it will be reused in orders and WhatsApp requests.', groomingFormTitle: 'Grooming request form', groomingFormText: 'Press Apply now to open the form. Name and phone are prefilled if saved in your profile; otherwise fill them in the form and send.', groomingMiniStep1: 'Write the pet type or breed, for example Chihuahua dog, cat or hamster.', groomingMiniStep2: 'Choose the needed service and add a preferred day.', groomingMiniStep3: 'The message opens ready in WhatsApp and the store confirms the suitable time.', petTypeInput: 'Pet type / breed', petName: 'Pet name', preferredTime: 'Preferred day and time', groomerApplyHint: 'You can send work examples via WhatsApp or Instagram direct.', adminLoginTitle: 'Admin login', adminLoginText: 'Enter the admin password to add products and manage active status.', adminPassword: 'Admin password', login: 'Login', logout: 'Logout', adminProductEditor: 'Fill product details', adminProductEditorText: 'AZ is required; EN/RU can be empty and will use AZ fallback. The live product card shows how it appears on the site.', productPreview: 'Product card preview', previewText: 'This card is how users will see the product.', filtersAndPrice: 'Filters and price', imagesAndBadge: 'Images and red badge', mainImagePath: 'Main image path', extraImagePaths: 'Extra images - one path per line', oldPriceField: 'Old price for discount', activeProduct: 'Product is active', inactiveProduct: 'Product is inactive', saving: 'Saving', checkoutSimpleText: 'Send your order to WhatsApp without a long checkout. The needed details will appear in the modal.', profileReadyOrder: 'Profile details found and will be prefilled in the order modal.', profileMissingOrder: 'If your profile is empty, you can fill the details in the order modal.', orderModalTitle: 'Check the order message', orderProfileFound: 'Your profile details were found and the form is prefilled.', orderProfileMissing: 'No profile details yet. Fill the required fields, then send.', messagePreview: 'Message preview', profileReadyGrooming: 'Profile details found. Name and phone will be prefilled in the grooming modal.', profileMissingGrooming: 'If your profile is empty, only name and phone are needed in the grooming modal.', groomingModalTitle: 'Check the grooming request'
  },
  ru: {
    home: 'Главная', products: 'Товары', grooming: 'Груминг', delivery: 'Доставка', about: 'О нас', contact: 'Контакты', cart: 'Корзина', favorites: 'Избранное', profile: 'Профиль', menu: 'Меню', categories: 'Категории', workHours: 'Время работы', demoCopy: 'Демонстрация e-commerce на Next.js',
    heroKicker: 'Зоомагазин • Груминг • Всё для питомцев', heroTitle: 'Всё необходимое для ваших питомцев.', heroText: 'В Zoo Kis-Kis корма, аксессуары, товары для ухода и услуги груминга собраны в одном удобном месте.', viewProducts: 'Смотреть товары', orderGrooming: 'Записаться на груминг', whatsapp: 'Написать в WhatsApp', deliveryAvailable: 'Есть доставка', easyChoice: 'Удобный выбор', petCare: 'Поддержка по уходу', saleLabel: 'Скидки',
    why: 'Почему выбирают нас?', whyTitle: 'Почему выбирают Zoo Kis-Kis?', catalog: 'Удобный выбор', catalogText: 'Товары удобно распределены по категориям для кошек, собак, птиц, рыб и грызунов, а фильтры помогают быстро найти корма, лежанки, туалеты и аксессуары.', care: 'Зоомагазин и уход в одном месте', careText: 'Каталог, услуги груминга, адрес и контакты собраны в одном месте, поэтому оформить заказ можно быстро и без лишних шагов.',
    discountedProducts: 'Товары со скидкой', popularProducts: 'Популярные товары', newProducts: 'Новинки', seeAll: 'Смотреть все',
    groomingTitle: 'Быстрая заявка на груминг', groomingText: 'Отправьте короткую заявку на стрижку, купание, расчёсывание или уход за когтями — команда согласует удобное время в WhatsApp.', groomingPage: 'Страница груминга', groomingHomeNote: 'Адрес не требуется. Укажите вид питомца, размер, услугу и удобное время.', applyNow: 'Оставить заявку', deliveryTitle: 'Доставка через Wolt', metro: 'Доставка до станции метро', addressDelivery: 'Доставка Wolt', regionPost: 'Доставка Wolt', moreInfo: 'Подробнее',
    deliveryText: 'Доставка осуществляется только через Wolt. Заказы доставляются каждый день с 10:00 до 22:00.',
    deliveryBenefitText: 'Доставка доступна только через Wolt, каждый день с 10:00 до 22:00.',
    toastAdded: 'добавлен в корзину',
    toastRemoved: 'удалён из корзины',
    toastCleared: 'Корзина очищена',
    addToCart: 'В корзину', details: 'Подробнее', price: 'Цена', stock: 'Наличие', productDetails: 'Подробнее о товаре', backToProducts: 'Назад к товарам', shareOnWhatsapp: 'Уточнить в WhatsApp',
    productsKicker: 'Каталог товаров', productsTitle: 'Быстро найдите нужный товар', productsText: 'Фильтруйте товары по виду питомца, разделу и категории.', allProducts: 'Все товары', petType: 'Вид питомца', productType: 'Категория товара', department: 'Раздел', subcategory: 'Категория товара', allInDepartment: 'Все товары раздела', category: 'Категория', collection: 'Подборка', clearFilters: 'Сбросить фильтры', results: 'результатов', noProducts: 'По выбранным фильтрам товары не найдены.', all: 'Все', searchProducts: 'Поиск по названию товара', filters: 'Фильтры', filterHint: 'Сначала выберите вид питомца, затем раздел и подкатегорию — так нужный товар найти проще.', filterResultsSuffix: 'найдено:', showResults: 'Показать результаты', shareProduct: 'Поделиться',
    categoryCatsTitle: 'Товары для кошек', categoryCatsText: 'Корма, наполнители, туалеты и игрушки', categoryDogsTitle: 'Товары для собак', categoryDogsText: 'Корма, лежанки, переноски и поводки', categoryBirdsTitle: 'Товары для птиц', categoryBirdsText: 'Клетки и аксессуары для птиц', categoryFishTitle: 'Товары для рыб', categoryFishText: 'Аквариумы, корм для рыб и аксессуары', categoryHamstersTitle: 'Товары для грызунов', categoryHamstersText: 'Клетки, корм и аксессуары для грызунов',
    aboutKicker: 'О нас', aboutTitle: 'Что делает Zoo Kis-Kis?', aboutText: 'Zoo Kis-Kis — это пространство заботы о питомцах, объединяющее зоомагазин и услуги груминга. Наша цель — удобный каталог, быстрая связь и правильный выбор товаров для ваших питомцев.', aboutPoint1: 'Сухие и влажные корма, игрушки и аксессуары', aboutPoint2: 'Услуги груминга', aboutGreenTitle: 'Ближе к вашим питомцам.', aboutGreenText: 'Используйте карту и социальные сети, чтобы быстро связаться с магазином.', mapAndSocial: 'Карта и социальные сети', mapAndSocialText: 'Посмотрите адрес на карте, откройте Instagram и TikTok или быстро напишите в WhatsApp.',
    cartEmptyTitle: 'Ваша корзина пока пуста.', cartEmptyText: 'Посмотрите товары и добавьте всё необходимое для питомца.', goToProducts: 'Перейти к товарам', cartTitle: 'Завершите заказ', cartText: 'Данные корзины сохраняются в браузере, а заказ отправляется через WhatsApp.', remove: 'Удалить', summary: 'Итого', deliveryPriceInfo: 'Стоимость доставки согласуется по адресу заказа.', checkout: 'Оформить заказ', clearCart: 'Очистить корзину',
    checkoutKicker: 'Оформление', checkoutTitle: 'Данные для заказа', checkoutText: 'Товары из корзины автоматически добавляются в готовое сообщение для WhatsApp. Если один раз сохранить профиль, данные будут подставляться автоматически.', fullName: 'Имя и фамилия', phone: 'Телефон', address: 'Адрес', deliveryType: 'Тип доставки', postDelivery: 'Отправка почтой', note: 'Комментарий к заказу', sendOrder: 'Отправить заказ в WhatsApp', whatsappFastTitle: 'Быстрый заказ через WhatsApp', whatsappFastText: 'Нажмите кнопку, проверьте данные и отправьте готовый текст заказа в WhatsApp.',
    contactTitle: 'Свяжитесь с нами', sendMessage: 'Отправить сообщение', yourName: 'Ваше имя', yourMessage: 'Ваше сообщение', send: 'Отправить',
    deliveryPageTitle: 'Доставка через Wolt', deliveryPageText: 'Доставка осуществляется только через Wolt', toMetro: 'Платформа доставки', toAddress: 'Время работы', toRegions: 'Примечание',
    groomingPageTitle: 'Услуги груминга', groomingPageText: 'Отправьте заявку в WhatsApp на стрижку, купание, расчёсывание, гигиенический уход или уход за когтями.', bookGrooming: 'Записаться на груминг', groomingBookText: 'Цена зависит от вида питомца, размера и выбранной услуги. Самый удобный способ уточнить детали — написать в WhatsApp.', serviceTypes: 'Виды услуг', workWithUs: 'Сотрудничество', groomerTitle: 'Вы профессиональный грумер?', groomerText: 'Свяжитесь с нами, если хотите сотрудничать с командой Zoo Kis-Kis. Опытные грумеры могут отправить примеры работ через WhatsApp или в Direct Instagram.', apply: 'Откликнуться',
    adminPanel: 'Админ-панель', adminTitle: 'Панель управления', adminText: 'Управляйте товарами, изображениями, статусом наличия, доставкой и заказами из этой панели.', productList: 'Список товаров', addProduct: 'Добавить товар', deliverySettings: 'Настройки доставки', orders: 'Заказы', productName: 'Название товара', chooseCategory: 'Выберите категорию', imagePath: 'Ссылка на изображение или путь загрузки', save: 'Сохранить', settings: 'Настройки', updateSettings: 'Обновить настройки', lastOrders: 'Последние заказы', customer: 'Клиент', status: 'Статус', amount: 'Сумма', demoCustomer: 'Тестовый клиент', pending: 'В ожидании', confirmed: 'Подтверждено', whatsappOrder: 'WhatsApp заказ', name: 'Название', otherImages: 'Другие изображения', call: 'Позвонить', close: 'Закрыть', favoritesTitle: 'Избранные товары', favoritesText: 'Здесь сохраняются товары, которые вам понравились. Их можно быстро добавить в корзину.', favoritesEmptyTitle: 'В избранном пока нет товаров.', favoritesEmptyText: 'Нажмите на сердечко в карточке товара, чтобы сохранить его здесь.', favoriteProducts: 'Избранное', similarProducts: 'Похожие товары', sameTypeProducts: 'Товары того же типа', moreForThisPet: 'Для этого вида питомца', recommendedForYou: 'Подобрали для вас', clearFavorites: 'Очистить избранное', city: 'Город', saveProfile: 'Сохранить данные', sendWhatsappOrder: 'Отправить заказ в WhatsApp в WhatsApp', sendToWhatsapp: 'Отправить в WhatsApp', profileSaved: 'Данные сохранены', profileFormHint: 'Заполните профиль один раз — данные будут использоваться в заказах и заявках WhatsApp.', groomingFormTitle: 'Форма заявки на груминг', groomingFormText: 'Нажмите кнопку заявки, чтобы открыть форму. Имя и телефон подставятся из профиля, если они сохранены. Если данных нет — заполните форму вручную и отправьте.', groomingMiniStep1: 'Укажите вид или породу питомца, например: собака чихуахуа, кошка или грызун.', groomingMiniStep2: 'Выберите услугу и удобный день.', groomingMiniStep3: 'Готовое сообщение откроется в WhatsApp, а магазин подтвердит удобное время.', petTypeInput: 'Вид или порода питомца', petName: 'Имя питомца', preferredTime: 'Удобный день и время', groomerApplyHint: 'Примеры работ можно отправить через WhatsApp или Direct в Instagram.', adminLoginTitle: 'Вход в админ-панель', adminLoginText: 'Введите пароль администратора, чтобы добавлять товары и управлять их статусом.', adminPassword: 'Пароль администратора', login: 'Войти', logout: 'Выйти', adminProductEditor: 'Заполните данные товара', adminProductEditorText: 'Поле AZ обязательно. Поля EN/RU можно оставить пустыми — тогда будет использован текст AZ. Справа показано, как карточка будет выглядеть на сайте.', productPreview: 'Предпросмотр карточки', previewText: 'Так пользователь увидит товар на сайте.', filtersAndPrice: 'Фильтры, цена и остаток', imagesAndBadge: 'Изображения и метка', mainImagePath: 'Ссылка на основное изображение', extraImagePaths: 'Дополнительные изображения — по одной ссылке в строке', oldPriceField: 'Старая цена', activeProduct: 'Товар активен', inactiveProduct: 'Товар неактивен', saving: 'Сохранение', checkoutSimpleText: 'Отправьте заказ в WhatsApp без долгого оформления. Все нужные данные откроются в модальном окне.', profileReadyOrder: 'Данные профиля найдены и будут подставлены в заказ.', profileMissingOrder: 'Если профиль не заполнен, укажите данные прямо в окне заказа.', orderModalTitle: 'Проверьте текст заказа', orderProfileFound: 'Данные профиля найдены, форма заполнена автоматически.', orderProfileMissing: 'Данных профиля пока нет. Заполните необходимые поля и отправьте заказ в WhatsApp.', messagePreview: 'Предпросмотр сообщения', profileReadyGrooming: 'Данные профиля найдены. Имя и телефон будут подставлены в заявку на груминг.', profileMissingGrooming: 'Если профиль не заполнен, в заявке на груминг достаточно указать имя и телефон.', groomingModalTitle: 'Проверьте текст заявки на груминг'
  }
};

type LanguageContextValue = { lang: Lang; setLang: (lang: Lang) => void; t: (key: string) => string; };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('az');

  useEffect(() => {
    const saved = window.localStorage.getItem('zookiskis-lang') as Lang | null;
    if (saved === 'az' || saved === 'en' || saved === 'ru') setLangState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (next: Lang) => {
    setLangState(next);
    window.localStorage.setItem('zookiskis-lang', next);
    document.documentElement.lang = next;
  };

  const value = useMemo(() => ({ lang, setLang, t: (key: string) => dictionaries[lang][key] ?? dictionaries.az[key] ?? key }), [lang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
