"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

export default function InstagramSection() {
  const locale = useLocale();
  const isUz = locale === "uz";

  const posts = [
    { bg: "from-pink-100 to-rose-200", emoji: "🎂" },
    { bg: "from-amber-100 to-orange-200", emoji: "🧁" },
    { bg: "from-purple-100 to-pink-200", emoji: "🎀" },
    { bg: "from-rose-100 to-pink-200", emoji: "🍰" },
    { bg: "from-orange-100 to-amber-200", emoji: "🎂" },
    { bg: "from-pink-100 to-purple-200", emoji: "🧁" },
  ];

  return (
    <section className="py-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Instagram className="w-7 h-7 text-salmon-500" />
            <h2 className="text-3xl md:text-4xl font-extrabold text-salmon-500">Instagram</h2>
          </div>
          <a
            href="https://instagram.com/sweetcake_uz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-salmon-500 transition-colors text-sm"
          >
            @sweetcake_uz
          </a>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          {posts.map((p, i) => (
            <motion.a
              key={i}
              href="https://instagram.com/sweetcake_uz"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${p.bg} flex items-center justify-center text-5xl hover:scale-[1.03] transition-transform cursor-pointer`}
            >
              {p.emoji}
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-8"
        >
          <a
            href="https://instagram.com/sweetcake_uz"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-salmon-500 text-white font-bold px-6 py-3 rounded-full hover:bg-salmon-600 transition-colors"
          >
            <Instagram className="w-4 h-4" />
            {isUz ? "Instagramda kuzating" : "Подписаться в Instagram"}
          </a>
        </motion.div>
      </div>
    </section>
  );
}
