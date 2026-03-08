import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";

export default function AboutPage() {
  const t = useTranslations("about");
  const locale = useLocale();
  const isUz = locale === "uz";

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-gradient-to-r from-salmon-500 to-salmon-600 py-16 text-center text-white">
        <h1 className="text-4xl font-extrabold">{t("title")}</h1>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-16 space-y-12">
        {/* Story */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <div className="text-5xl mb-4">🏪</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {isUz ? "Bizning Hikoyamiz" : "Наша История"}
          </h2>
          <p className="text-gray-500 leading-relaxed mb-4">{t("description")}</p>
          <p className="text-gray-500 leading-relaxed">{t("mission")}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: "2019", label: isUz ? "Asos solingan" : "Основан" },
            { num: "2000+", label: isUz ? "Mijozlar" : "Клиентов" },
            { num: "50+", label: isUz ? "Mahsulotlar" : "Продуктов" },
            { num: "100%", label: isUz ? "Sifat" : "Качество" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-cream-50 rounded-2xl p-6 text-center"
            >
              <p className="text-3xl font-extrabold text-salmon-600">{s.num}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {isUz ? "Aloqa" : "Контакты"}
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-xs text-gray-400">{isUz ? "Telefon" : "Телефон"}</p>
                  <a href="tel:+998901234567" className="font-semibold text-gray-700 hover:text-salmon-500">
                    +998 90 123 45 67
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✈️</span>
                <div>
                  <p className="text-xs text-gray-400">Telegram</p>
                  <a href="https://t.me/sweetcake_uz" className="font-semibold text-gray-700 hover:text-salmon-500">
                    @sweetcake_uz
                  </a>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-xs text-gray-400">{isUz ? "Manzil" : "Адрес"}</p>
                  <p className="font-semibold text-gray-700">Toshkent, Chilonzor</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🕐</span>
                <div>
                  <p className="text-xs text-gray-400">{isUz ? "Ish vaqti" : "Время работы"}</p>
                  <p className="font-semibold text-gray-700">09:00 – 21:00</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href={`/${locale}/order`}
            className="bg-cream-500 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-salmon-600 transition-colors shadow-lg shadow-cream-200 inline-block"
          >
            {isUz ? "Buyurtma Berish →" : "Заказать →"}
          </Link>
        </div>
      </div>
    </div>
  );
}
