import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { products } from "@/lib/products";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const locales = ["uz", "ru"];
  return locales.flatMap((locale) =>
    products.map((p) => ({ locale, slug: p.slug }))
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};
  const name = locale === "uz" ? product.nameUz : product.nameRu;
  const desc = locale === "uz" ? product.descUz : product.descRu;
  return {
    title: `${name} | Sweet Cake`,
    description: desc,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const t = await getTranslations({ locale, namespace: "products" });

  const name = locale === "uz" ? product.nameUz : product.nameRu;
  const desc = locale === "uz" ? product.descUz : product.descRu;
  const price = product.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const emojiMap: Record<string, string> = {
    cakes: "🎂",
    cupcakes: "🧁",
    cookies: "🍪",
    pastries: "🥐",
  };
  const emoji = emojiMap[product.category] || "🍰";

  return (
    <ProductDetailClient
      product={product}
      name={name}
      desc={desc}
      price={price}
      emoji={emoji}
      locale={locale}
      labels={{
        back: t("back"),
        quantity: t("quantity"),
        order: t("order"),
        total: t("total"),
        popular: t("popular"),
        newLabel: t("new"),
      }}
    />
  );
}
