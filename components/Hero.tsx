"use client";

import { useTranslations, useLocale } from "next-intl";
import { Star, Zap, Sparkles, ArrowRight } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  const t = useTranslations("hero");
  const locale = useLocale();

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-cream-200 via-cream-100 to-cream-50 flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-4 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* Left: Text */}
        <div>
          <motion.span
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-cream-100 text-salmon-600 text-sm font-semibold px-4 py-1.5 rounded-full mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" /> {t("badge")}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-800 leading-tight mb-4"
          >
            {t("title")}{" "}
            <span className="text-salmon-500">{t("titleAccent")}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-500 text-lg mb-8 leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <a
              href="#order"
              className="bg-salmon-500 text-white px-8 py-3.5 rounded-full font-semibold text-lg hover:bg-salmon-600 transition-all shadow-lg shadow-cream-200 hover:shadow-cream-300"
            >
              {t("cta")} <ArrowRight className="inline w-4 h-4 ml-1" />
            </a>
            <a
              href="#menu"
              className="bg-white text-salmon-600 px-8 py-3.5 rounded-full font-semibold text-lg border-2 border-cream-200 hover:border-cream-300 transition-all"
            >
              {t("menu")}
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="flex gap-8 mt-12"
          >
            <div>
              <p className="text-3xl font-extrabold text-gray-800">2000+</p>
              <p className="text-gray-500 text-sm mt-1">{t("stat1")}</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div>
              <p className="text-3xl font-extrabold text-gray-800">50+</p>
              <p className="text-gray-500 text-sm mt-1">{t("stat2")}</p>
            </div>
            <div className="w-px bg-gray-200"></div>
            <div>
              <p className="text-3xl font-extrabold text-gray-800">5+</p>
              <p className="text-gray-500 text-sm mt-1">{t("stat3")}</p>
            </div>
          </motion.div>
        </div>

        {/* Right: Hero cake image */}
        <div className="relative flex justify-center">
          <div className="w-[420px] h-[420px] md:w-[520px] md:h-[520px]">
            <Image
              src="/images/hero.webp"
              alt="Sweet Cake tort"
              width={520}
              height={520}
              className="w-full h-full object-contain mix-blend-multiply"
              priority
            />
          </div>

          {/* Floating badges */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="absolute top-8 right-8 bg-white rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="font-bold text-gray-800">4.9</span>
            <span className="text-gray-400 text-sm">rating</span>
          </motion.div>

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-12 left-4 bg-white rounded-2xl px-4 py-2 shadow-lg flex items-center gap-2"
          >
            <Zap className="w-4 h-4 text-salmon-500" />
            <span className="text-sm font-semibold text-gray-700">2-3 soat</span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
