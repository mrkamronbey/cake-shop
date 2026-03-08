"use client";

import { useLocale } from "next-intl";
import { Send } from "lucide-react";

export default function CustomOrderSection() {
  const locale = useLocale();
  const isUz = locale === "uz";

  const features = isUz
    ? ["O'zingiz istagan dizayn", "Istalgan o'lcham", "Maxsus yozuvlar", "Allergen hisobi"]
    : ["Дизайн на ваш выбор", "Любой размер", "Именные надписи", "Учёт аллергенов"];

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-gradient-to-br from-salmon-400 to-salmon-600 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
          <div className="text-6xl md:text-8xl shrink-0">🎨</div>
          <div className="text-white flex-1">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-3">
              {isUz ? "Individual buyurtma" : "Индивидуальный заказ"}
            </h2>
            <p className="text-white/80 text-sm mb-5 leading-relaxed">
              {isUz
                ? "O'zingizning orzuingizdagi tortni yaratamiz. Dizayn, o'lcham, ta'm — hammasi sizning xohishingizga ko'ra."
                : "Создадим торт вашей мечты. Дизайн, размер, вкус — всё по вашему желанию."}
            </p>
            <ul className="grid grid-cols-2 gap-2 mb-6">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a
              href="https://t.me/sweetcake_uz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-salmon-500 font-bold px-6 py-3 rounded-full hover:bg-white/90 transition-colors text-sm"
            >
              <Send className="w-4 h-4" />
              {isUz ? "Telegram orqali buyurtma" : "Заказать через Telegram"}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
