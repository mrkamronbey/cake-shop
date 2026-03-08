"use client";

import { useLocale } from "next-intl";
import Image from "next/image";

export default function PromoBanner() {
  const locale = useLocale();
  const isUz = locale === "uz";

  return (
    <section className="py-10 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-cream-50 to-cream-100 rounded-3xl p-8 relative overflow-hidden border border-cream-200">
          <Image src="/images/gift.webp" alt="gift" width={120} height={120} className="absolute right-4 top-2 w-28 h-28 object-contain" />
          <p className="text-sm font-semibold text-salmon-500 mb-2">{isUz ? "Maxsus taklif" : "Специальное предложение"}</p>
          <h3 className="text-2xl font-extrabold text-salmon-700 mb-3">{isUz ? "Super Chegirma" : "Супер Скидка"}</h3>
          <p className="text-sm text-salmon-600/70 mb-5">{isUz ? "2 ta tort buyurtma bersa — 3-tasi sovg'a!" : "Закажи 2 торта — 3-й в подарок!"}</p>
          <a href="#menu" className="bg-salmon-500 text-white font-bold px-5 py-2 rounded-full text-sm hover:bg-salmon-600 transition-colors inline-block">
            {isUz ? "Buyurtma" : "Заказать"}
          </a>
        </div>

        <div className="bg-gradient-to-br from-cream-50 to-cream-100 rounded-3xl p-8 relative overflow-hidden border border-cream-200">
          <Image src="/images/sun-cake.webp" alt="cake" width={100} height={100} className="absolute right-4 top-4 w-24 h-24 object-contain" />
          <p className="text-sm font-semibold text-salmon-500 mb-2">{isUz ? "Yangi kolleksiya" : "Новая коллекция"}</p>
          <h3 className="text-2xl font-extrabold text-salmon-700 mb-3">{isUz ? "Bahor Tortlari" : "Весенние Торты"}</h3>
          <p className="text-sm text-salmon-600/70 mb-5">{isUz ? "Maxsus bahor dizaynidagi tortlar" : "Торты в специальном весеннем дизайне"}</p>
          <a href="#menu" className="bg-salmon-500 text-white font-bold px-5 py-2 rounded-full text-sm hover:bg-salmon-600 transition-colors inline-block">
            {isUz ? "Ko'rish" : "Смотреть"}
          </a>
        </div>
      </div>
    </section>
  );
}
