import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Phone, MapPin, Clock, Send } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const t = useTranslations("footer");
  const tn = useTranslations("nav");
  const locale = useLocale();

  return (
    <footer className="bg-gradient-to-br from-cream-100 via-cream-100 to-cream-200 text-brown-900">
      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Image
              src="/images/chef-girl.jpeg"
              alt="Sweet Cake logo"
              width={40}
              height={40}
              className="rounded-full object-cover object-top"
            />
            <span className="font-bold text-xl text-brown-700">Sweet Cake</span>
          </div>
          <p className="text-sm text-brown-700/70 leading-relaxed">
            {locale === "uz"
              ? "Toshkentda eng mazali tortlar va shirinliklar"
              : "Самые вкусные торты и сладости в Ташкенте"}
          </p>
        </div>

        {/* Nav links */}
        <div>
          <h4 className="text-brown-700 font-semibold mb-4">
            {locale === "uz" ? "Sahifalar" : "Страницы"}
          </h4>
          <ul className="space-y-2">
            {[
              { href: `/${locale}`, label: tn("home") },
              { href: `/${locale}/menu`, label: tn("menu") },
              { href: `/${locale}/order`, label: tn("order") },
              { href: `/${locale}/about`, label: tn("about") },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-brown-800/70 hover:text-salmon-600 transition-colors text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-brown-700 font-semibold mb-4">
            {locale === "uz" ? "Aloqa" : "Контакты"}
          </h4>
          <ul className="space-y-3 text-sm text-brown-800/70">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-salmon-400 shrink-0" />
              <a href="tel:+998901234567" className="hover:text-salmon-600 transition-colors">+998 90 123 45 67</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-salmon-400 shrink-0" />
              <span>Toshkent, Chilonzor</span>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-salmon-400 shrink-0" />
              <span>{t("hours")}</span>
            </li>
            <li className="flex items-center gap-2">
              <Send className="w-4 h-4 text-salmon-400 shrink-0" />
              <a href="https://t.me/sweetcake_uz" className="hover:text-salmon-600 transition-colors">
                Telegram
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div suppressHydrationWarning className="border-t border-cream-300/50 py-4 text-center text-xs text-brown-700/60">
        © {new Date().getFullYear()} Sweet Cake. {t("rights")}.
      </div>
    </footer>
  );
}
