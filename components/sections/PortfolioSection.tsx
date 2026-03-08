"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";

export default function PortfolioSection() {
  const locale = useLocale();
  const isUz = locale === "uz";

  const items = [
    { emoji: "🎂", label: isUz ? "Bayram torti" : "Праздничный торт", bg: "from-pink-100 to-rose-200" },
    { emoji: "🧁", label: isUz ? "Kapkeyk" : "Капкейк", bg: "from-purple-100 to-pink-200" },
    { emoji: "🎀", label: isUz ? "Sovg'a torti" : "Торт-подарок", bg: "from-amber-100 to-orange-200" },
    { emoji: "🍰", label: isUz ? "Mini tort" : "Мини торт", bg: "from-rose-100 to-pink-200" },
    { emoji: "🎂", label: isUz ? "To'y torti" : "Свадебный торт", bg: "from-orange-100 to-amber-200" },
    { emoji: "🍪", label: isUz ? "Pechenye" : "Печенье", bg: "from-yellow-100 to-orange-100" },
    { emoji: "🥐", label: isUz ? "Pishiriq" : "Выпечка", bg: "from-cream-100 to-amber-100" },
    { emoji: "🎂", label: isUz ? "Dizayn torti" : "Дизайн торт", bg: "from-pink-100 to-purple-200" },
  ];

  return (
    <section className="py-20">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-salmon-500 mb-2">
            {isUz ? "Bizning ishlarimiz" : "Наши работы"}
          </h2>
          <p className="text-gray-400">
            {isUz ? "Har bir tort — alohida san'at asari" : "Каждый торт — отдельное произведение искусства"}
          </p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              whileHover={{ scale: 1.04 }}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${item.bg} flex flex-col items-center justify-center gap-2 cursor-pointer`}
            >
              <span className="text-5xl">{item.emoji}</span>
              <span className="text-xs font-semibold text-gray-600">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
