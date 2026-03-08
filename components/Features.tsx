"use client";

import { useTranslations } from "next-intl";
import { Truck, BadgeCheck, Palette, Sunrise } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Truck, key: "delivery" },
  { icon: BadgeCheck, key: "quality" },
  { icon: Palette, key: "custom" },
  { icon: Sunrise, key: "fresh" },
];

export default function Features() {
  const t = useTranslations("features");

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-salmon-500 mb-4">
            {t("title")} <span className="text-salmon-500">✨</span>
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Bizning ustunliklarimiz va siz uchun eng yaxshi xizmatni taqdim etamiz
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 text-center hover:bg-cream-100 transition-colors group shadow-sm"
            >
              <div className="w-16 h-16 bg-cream-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                <f.icon className="w-7 h-7 text-salmon-500" />
              </div>
              <h3 className="font-bold text-gray-800 mb-2">
                {t(`${f.key}` as any)}
              </h3>
              <p className="text-gray-500 text-sm">
                {t(`${f.key}Desc` as any)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
