"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { useCart } from "@/lib/cart";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalCount, openCart } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll(); // sahifa yuklanganda darhol tekshir
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  const navLinks = [
    { href: "#", label: t("home") },
    { href: "#menu", label: t("menu") },
    { href: "#order", label: t("order") },
    { href: "#about", label: t("about") },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-1">
          <Image
            src="/images/chef-girl.jpeg"
            alt="Sweet Cake logo"
            width={44}
            height={44}
            className="rounded-full object-cover object-top"
          />
          <span className="font-bold text-xl text-salmon-600">Sweet Cake</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-salmon-600 font-medium transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language switcher */}
          <div
            className={`flex items-center rounded-full p-1 gap-1 transition-colors duration-300 ${
              scrolled ? "bg-gray-100" : "bg-white/40"
            }`}
          >
            <button
              onClick={() => switchLocale("uz")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                locale === "uz"
                  ? "bg-salmon-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              UZ
            </button>
            <button
              onClick={() => switchLocale("ru")}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                locale === "ru"
                  ? "bg-salmon-500 text-white shadow"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              RU
            </button>
          </div>

          {/* Cart button */}
          <button
            onClick={openCart}
            className="hidden md:flex items-center gap-2 bg-salmon-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-salmon-600 transition-colors relative cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            {locale === "uz" ? "Korzinka" : "Корзина"}
            {totalCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-salmon-500 text-xs font-extrabold w-5 h-5 rounded-full flex items-center justify-center shadow border border-salmon-100">
                {totalCount}
              </span>
            )}
          </button>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className={`md:hidden border-t px-4 py-4 flex flex-col gap-3 ${
            scrolled ? "bg-white/80 backdrop-blur-md" : "bg-cream-50"
          }`}
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-gray-700 hover:text-salmon-600 font-medium py-2"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </header>
  );
}
