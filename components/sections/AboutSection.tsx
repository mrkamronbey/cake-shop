"use client";

import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Phone, MapPin, Clock, Send } from "lucide-react";

export default function AboutSection() {
  const t = useTranslations("about");
  const locale = useLocale();
  const isUz = locale === "uz";

  return (
    <section id="about" className="py-20 scroll-mt-16">
      <div className="max-w-4xl mx-auto px-4 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-salmon-500 mb-2">{t("title")}</h2>
        </motion.div>

        <div className="bg-white rounded-3xl p-8">
          <p className="text-gray-600 leading-relaxed mb-4">{t("description")}</p>
          <p className="text-gray-600 leading-relaxed">{t("mission")}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { num: "2019", label: isUz ? "Asos solingan" : "Основан" },
            { num: "2000+", label: isUz ? "Mijozlar" : "Клиентов" },
            { num: "50+", label: isUz ? "Mahsulotlar" : "Продуктов" },
            { num: "100%", label: isUz ? "Sifat" : "Качество" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 text-center">
              <p className="text-3xl font-extrabold text-salmon-600">{s.num}</p>
              <p className="text-gray-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl p-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6">{isUz ? "Aloqa" : "Контакты"}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-salmon-500 shrink-0" />
              <a href="tel:+998901234567" className="font-semibold text-gray-700 hover:text-salmon-500">+998 90 123 45 67</a>
            </div>
            <div className="flex items-center gap-3">
              <Send className="w-5 h-5 text-salmon-500 shrink-0" />
              <a href="https://t.me/sweetcake_uz" className="font-semibold text-gray-700 hover:text-salmon-500">@sweetcake_uz</a>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-salmon-500 shrink-0" />
              <span className="font-semibold text-gray-700">Toshkent, Chilonzor</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-salmon-500 shrink-0" />
              <span className="font-semibold text-gray-700">09:00 – 21:00</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
