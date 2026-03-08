import { redis } from "./redis";
import { products as staticProducts, type Product } from "./products";

const KEY = "sweetcake:products";

export async function getProducts(): Promise<Product[]> {
  const data = await redis.get<Product[]>(KEY);
  if (!data) {
    await redis.set(KEY, staticProducts);
    return staticProducts;
  }
  return data;
}

export async function addProduct(product: Product): Promise<void> {
  const list = await getProducts();
  await redis.set(KEY, [...list, product]);
}

export async function deleteProduct(slug: string): Promise<Product | null> {
  const list = await getProducts();
  const target = list.find((p) => p.slug === slug) ?? null;
  await redis.set(KEY, list.filter((p) => p.slug !== slug));
  return target;
}

export async function seedProducts(): Promise<void> {
  await redis.set(KEY, staticProducts);
}
