"use client";

import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function ReviewsSection() {
  const locale = useLocale();
  const isUz = locale === "uz";

  const reviews = isUz
    ? [
        { name: "Malika T.", rating: 5, text: "Tort juda mazali va chiroyli bo'ldi! Tug'ilgan kun uchun buyurtma berdim, hammaga yoqdi.", date: "15 Fevral" },
        { name: "Jasur R.", rating: 5, text: "Tez yetkazib berishdi, qadoqlash a'lo darajada. Albatta yana buyurtma beraman!", date: "2 Mart" },
        { name: "Nilufar K.", rating: 5, text: "To'y uchun 3 ta katta tort buyurtma berdik. Hammasi a'lo! Dizayn va ta'm mukammal.", date: "20 Fevral" },
        { name: "Bobur A.", rating: 5, text: "Bolam uchun tug'ilgan kun torti buyurtma berdim. Bola juda xursand bo'ldi!", date: "8 Mart" },
        { name: "Shahnoza M.", rating: 5, text: "Narx sifatga to'la mos keladi. Har doim shu yerdan olamiz, hech qachon xafalanmaganmiz.", date: "1 Mart" },
        { name: "Dilshod U.", rating: 5, text: "Korporativ tadbir uchun ko'p miqdorda buyurtma berdik. Hammasi o'z vaqtida yetkazildi!", date: "25 Fevral" },
      ]
    : [
        { name: "Малика Т.", rating: 5, text: "Торт получился очень вкусным и красивым! Заказала на день рождения, всем понравилось.", date: "15 Февраля" },
        { name: "Жасур Р.", rating: 5, text: "Доставили быстро, упаковка отличная. Обязательно закажу ещё раз!", date: "2 Марта" },
        { name: "Нилуфар К.", rating: 5, text: "Заказали 3 больших торта на свадьбу. Всё на высшем уровне! Дизайн и вкус — идеальные.", date: "20 Февраля" },
        { name: "Бобур А.", rating: 5, text: "Заказал торт на день рождения ребёнка. Ребёнок был в восторге!", date: "8 Марта" },
        { name: "Шахноза М.", rating: 5, text: "Цена полностью соответствует качеству. Всегда берём здесь, никогда не разочаровывались.", date: "1 Марта" },
        { name: "Дилшод У.", rating: 5, text: "Заказали большую партию для корпоратива. Всё доставили вовремя!", date: "25 Февраля" },
      ];

  return (
    <section className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-salmon-500 mb-2">
            {isUz ? "Mijozlar sharhlari" : "Отзывы клиентов"}
          </h2>
          <p className="text-gray-400">
            {isUz ? "Bizning mijozlarimiz nima deydi" : "Что говорят наши клиенты"}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="bg-white rounded-2xl p-5 flex flex-col gap-3"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: r.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed flex-1">"{r.text}"</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="font-bold text-gray-800 text-sm">{r.name}</span>
                <span className="text-xs text-gray-400">{r.date}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
