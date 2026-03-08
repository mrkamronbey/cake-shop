export const products = [
  {
    id: 1,
    slug: "chocolate-drip",
    category: "cakes",
    price: 150000,
    badge: "popular",
    image: "/images/cake1.jpg",
    nameUz: "Shokoladli Drip Tort",
    nameRu: "Шоколадный Дрип Торт",
    descUz: "Belgiya shokoladi va krem bilan",
    descRu: "С бельгийским шоколадом и кремом",
    longDescUz:
      "Belgiyaning eng sifatli qora shokoladidan tayyorlangan ushbu tort nafaqat ko'rinishi, balki ta'mi bilan ham hayratga soladi. Har bir qatlam yumshoq biskvit, qaymoqli ganash va shokoladli drip bilan bezatilgan. Tug'ilgan kun, to'y yoki istalgan bayram uchun ideal tanlov.",
    longDescRu:
      "Этот торт из высококачественного бельгийского тёмного шоколада восхищает не только своим видом, но и вкусом. Каждый слой — нежный бисквит, сливочный ганаш и шоколадный дрип. Идеальный выбор для дня рождения, свадьбы или любого праздника.",
  },
  {
    id: 2,
    slug: "strawberry-dream",
    category: "cakes",
    price: 130000,
    badge: "new",
    image: "/images/cake2.jpg",
    nameUz: "Qulupnayli Tort",
    nameRu: "Клубничный Торт",
    descUz: "Yangi qulupnay va vanil krem",
    descRu: "Свежая клубника и ванильный крем",
    longDescUz:
      "Har kuni erta tongda terib olingan yangi qulupnaylar va nafis vanil krem bilan tayyorlangan bu tort yoz faslining eng yoqimli ta'mini beradi. Yengil va muqobil tarkibi bilan bolalar ham, kattalar ham sevib yeydi.",
    longDescRu:
      "Этот торт со свежей клубникой, собранной каждое утро, и нежным ванильным кремом дарит самый приятный вкус лета. Лёгкий состав нравится и детям, и взрослым.",
  },
  {
    id: 3,
    slug: "red-velvet",
    category: "cakes",
    price: 160000,
    badge: "popular",
    image: "/images/cake3.jpg",
    nameUz: "Qizil Velvet Tort",
    nameRu: "Красный Бархат",
    descUz: "Klassik amerikalik tort",
    descRu: "Классический американский торт",
    longDescUz:
      "Amerika oshxonasining eng mashhur torti — Qizil Velvet. Qoʻng'ir rangli yumshoq biskvit va klassik krem-pishloq (cream cheese) frosting bilan tayyorlangan. Rangi va ta'mi bilan har qanday dasturxonni bezaydi.",
    longDescRu:
      "Красный Бархат — один из самых знаменитых тортов американской кухни. Нежный бисквит насыщенного цвета с классическим кремом из сливочного сыра. Украсит любой стол своим видом и вкусом.",
  },
  {
    id: 4,
    slug: "vanilla-cupcake",
    category: "cupcakes",
    price: 25000,
    badge: "new",
    image: "/images/cupcake1.jpg",
    nameUz: "Vanil Keks",
    nameRu: "Ванильный Капкейк",
    descUz: "6 tadan to'plam",
    descRu: "Набор из 6 штук",
    longDescUz:
      "6 tadan iborat to'plamda taqdim etiladigan ushbu vanil kekslar kichik bayramlar va mehmonlar uchun ideal. Har biri yumshoq vanil biskvit asosida, ustiga chiroyli krem va bezak solingan. Ular farzandingizning tug'ilgan kuni uchun ham ajoyib sovg'a bo'ladi.",
    longDescRu:
      "Набор из 6 капкейков на нежной ванильной основе с красивым кремом и декором — идеально для небольших праздников и угощения гостей. Отличный подарок на день рождения ребёнка.",
  },
  {
    id: 5,
    slug: "macarons",
    category: "pastries",
    price: 45000,
    badge: null,
    image: "/images/macaron1.jpg",
    nameUz: "Makaron (12 ta)",
    nameRu: "Макаруны (12 шт)",
    descUz: "Assorted ranglar va ta'mlar",
    descRu: "Ассорти цветов и вкусов",
    longDescUz:
      "Fransuz oshxonasining nozik shirinligi — 12 donali makaron to'plami. Har biri turli rang va ta'mda: limon, malina, fistiq, shokolad, lavanda va boshqalar. Nafis qadoqda taqdim etiladi — sovg'a sifatida ham juda mos.",
    longDescRu:
      "Изысканное французское лакомство — набор из 12 макарунов. Каждый в своём цвете и вкусе: лимон, малина, фисташка, шоколад, лаванда и другие. Подаётся в изящной упаковке — отличный подарок.",
  },
  {
    id: 6,
    slug: "cookie-box",
    category: "cookies",
    price: 60000,
    badge: null,
    image: "/images/cookie1.jpg",
    nameUz: "Pechenye To'plami",
    nameRu: "Набор Печенья",
    descUz: "20 ta aralash pechenye",
    descRu: "20 штук ассорти печенья",
    longDescUz:
      "20 donali aralash pechenye to'plami: shokoladli chip, yong'oqli, vanil va limonli navlar. Har kuni ertalab yangi pishiriladi. Choy yoki qahva bilan juda mos keladi. Ofisga, uyga yoki sovg'a uchun qulay tanlov.",
    longDescRu:
      "Набор из 20 ассорти печенья: с шоколадной крошкой, ореховое, ванильное и лимонное. Выпекается каждое утро. Отлично сочетается с чаем или кофе. Удобный выбор для офиса, дома или в подарок.",
  },
];

export type Product = (typeof products)[0];
