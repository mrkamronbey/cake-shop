import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import FloatingContact from "@/components/FloatingContact";
import { CartProvider } from "@/lib/cart";
import { Toaster } from "sonner";

const locales = ["uz", "ru"];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const isUz = locale === "uz";

  return {
    title: {
      default: isUz ? "Sweet Cake | Toshkent" : "Sweet Cake | Ташкент",
      template: `%s | Sweet Cake`,
    },
    description: isUz
      ? "Toshkentda eng mazali tortlar va shirinliklar. Tez yetkazib berish. Buyurtma bering!"
      : "Самые вкусные торты и сладости в Ташкенте. Быстрая доставка. Заказывайте!",
    keywords: isUz
      ? ["tort", "keks", "shirinlik", "Toshkent", "buyurtma", "yetkazib berish"]
      : ["торт", "капкейк", "сладости", "Ташкент", "заказ", "доставка"],
    alternates: {
      canonical: `https://sweetcake.uz/${locale}`,
      languages: {
        uz: "https://sweetcake.uz/uz",
        ru: "https://sweetcake.uz/ru",
      },
    },
    openGraph: {
      title: isUz ? "Sweet Cake Toshkent" : "Sweet Cake Ташкент",
      description: t("subtitle"),
      locale: locale === "uz" ? "uz_UZ" : "ru_RU",
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <CartProvider>
        <Navbar />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
        <FloatingContact />
        <Toaster position="bottom-center" richColors />
      </CartProvider>
    </NextIntlClientProvider>
  );
}
