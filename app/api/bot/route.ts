import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProducts, addProduct, deleteProduct, seedProducts } from "@/lib/products-store";
import { uploadFromUrl } from "@/lib/cloudinary";
import { redis } from "@/lib/redis";
import type { Product } from "@/lib/products";

const TOKEN = process.env.ADMIN_BOT_TOKEN!;
const SUPER_ADMIN = process.env.ADMIN_TELEGRAM_ID!;
const ADMINS_KEY = "sweetcake:admins";

async function reply(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

async function isAdmin(chatId: number): Promise<boolean> {
  if (String(chatId) === SUPER_ADMIN) return true;
  const admins = await redis.smembers(ADMINS_KEY);
  return admins.includes(String(chatId));
}

async function getTelegramFileUrl(fileId: string): Promise<string> {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
  const data = await res.json();
  return `https://api.telegram.org/file/bot${TOKEN}/${data.result.file_path}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const message = body.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId: number = message.chat.id;
  const text: string = (message.text ?? "").split("@")[0].trim();

  // Har kim o'z ID'sini bilib olishi uchun
  if (text === "/myid") {
    await reply(chatId, `Sizning Telegram ID: <code>${chatId}</code>`);
    return NextResponse.json({ ok: true });
  }

  // Admin tekshiruvi
  if (!(await isAdmin(chatId))) {
    await reply(chatId, "⛔ Sizda ruxsat yo'q.");
    return NextResponse.json({ ok: true });
  }

  const isSuperAdmin = String(chatId) === SUPER_ADMIN;
  const pendingKey = `sweetcake:pending:${chatId}`;

  // ── RASM QABUL QILISH (photo yoki document) ───────────────────────────────
  const fileId = message.photo
    ? message.photo[message.photo.length - 1].file_id
    : message.document?.mime_type?.startsWith("image/")
    ? message.document.file_id
    : null;

  if (fileId) {
    const pending = await redis.get<Omit<Product, "image">>(pendingKey);

    if (!pending) {
      await reply(chatId, "❓ Avval /add orqali mahsulot ma'lumotlarini yuboring.");
      return NextResponse.json({ ok: true });
    }

    await reply(chatId, "⏳ Rasm yuklanmoqda...");

    try {
      const fileUrl = await getTelegramFileUrl(fileId);
      const imageUrl = await uploadFromUrl(fileUrl);

      const product: Product = { ...pending, image: imageUrl };
      await addProduct(product);
      await redis.del(pendingKey);
      revalidatePath("/uz");
      revalidatePath("/ru");

      await reply(
        chatId,
        `✅ <b>${product.nameUz}</b> muvaffaqiyatli qo'shildi!\n\nNarx: ${product.price.toLocaleString()} so'm\nKategoriya: ${product.category}`
      );
    } catch {
      await reply(chatId, "❌ Rasm yuklanmadi. Qayta urinib ko'ring.");
    }
    return NextResponse.json({ ok: true });
  }

  // ── /skip — Rasmsiz saqlash ────────────────────────────────────────────────
  if (text === "/skip") {
    const pending = await redis.get<Omit<Product, "image">>(pendingKey);
    if (!pending) {
      await reply(chatId, "❓ Kutilayotgan mahsulot yo'q.");
      return NextResponse.json({ ok: true });
    }
    const product: Product = { ...pending, image: "" };
    await addProduct(product);
    await redis.del(pendingKey);
    revalidatePath("/uz");
    revalidatePath("/ru");
    await reply(chatId, `✅ <b>${product.nameUz}</b> rasmsiz qo'shildi.`);
    return NextResponse.json({ ok: true });
  }

  // ── /cancel — Bekor qilish ─────────────────────────────────────────────────
  if (text === "/cancel") {
    await redis.del(pendingKey);
    await reply(chatId, "❌ Bekor qilindi.");
    return NextResponse.json({ ok: true });
  }

  // ── /start, /help ──────────────────────────────────────────────────────────
  if (text === "/start" || text === "/help") {
    const superCmds = isSuperAdmin
      ? `\n\n<b>Super admin:</b>\n/add_admin ID — admin qo'shish\n/remove_admin ID — adminni o'chirish\n/admins — adminlar ro'yxati`
      : "";

    await reply(
      chatId,
      `🎂 <b>Sweet Cake Admin Bot</b>\n\n` +
        `<b>Mahsulot qo'shish:</b>\n` +
        `/add nomUz | nomRu | narx | kategoriya | tavsifUz | tavsifRu\n` +
        `↳ So'ng rasm yuboring yoki /skip\n\n` +
        `<b>Kategoriyalar:</b> cakes · cupcakes · cookies · pastries\n\n` +
        `<b>Buyruqlar:</b>\n` +
        `/list — barcha mahsulotlar\n` +
        `/delete slug — o'chirish\n` +
        `/cancel — joriy amalni bekor qilish\n` +
        `/seed — standart mahsulotlarni yuklash` +
        superCmds +
        `\n\n<b>Misol:</b>\n` +
        `/add Shokolad torti | Шоколадный торт | 150000 | cakes | Mazali shokolad torti | Вкусный торт`
    );
    return NextResponse.json({ ok: true });
  }

  // ── /admins ────────────────────────────────────────────────────────────────
  if (text === "/admins") {
    if (!isSuperAdmin) {
      await reply(chatId, "⛔ Faqat super admin uchun.");
      return NextResponse.json({ ok: true });
    }
    const admins = await redis.smembers(ADMINS_KEY);
    const list = admins.length > 0 ? admins.map((id) => `• <code>${id}</code>`).join("\n") : "— yo'q";
    await reply(chatId, `👥 <b>Adminlar:</b>\n\n⭐ <code>${SUPER_ADMIN}</code> (super)\n${list}`);
    return NextResponse.json({ ok: true });
  }

  // ── /add_admin ─────────────────────────────────────────────────────────────
  if (text.startsWith("/add_admin")) {
    if (!isSuperAdmin) {
      await reply(chatId, "⛔ Faqat super admin uchun.");
      return NextResponse.json({ ok: true });
    }
    const newId = text.replace("/add_admin", "").trim();
    if (!newId || isNaN(Number(newId))) {
      await reply(chatId, "❌ Format: /add_admin 123456789");
      return NextResponse.json({ ok: true });
    }
    if (newId === SUPER_ADMIN) {
      await reply(chatId, "ℹ️ Siz allaqachon super adminsiz.");
      return NextResponse.json({ ok: true });
    }
    await redis.sadd(ADMINS_KEY, newId);
    await reply(chatId, `✅ <code>${newId}</code> admin qilib qo'shildi.`);
    return NextResponse.json({ ok: true });
  }

  // ── /remove_admin ──────────────────────────────────────────────────────────
  if (text.startsWith("/remove_admin")) {
    if (!isSuperAdmin) {
      await reply(chatId, "⛔ Faqat super admin uchun.");
      return NextResponse.json({ ok: true });
    }
    const removeId = text.replace("/remove_admin", "").trim();
    if (!removeId) {
      await reply(chatId, "❌ Format: /remove_admin 123456789");
      return NextResponse.json({ ok: true });
    }
    await redis.srem(ADMINS_KEY, removeId);
    await reply(chatId, `✅ <code>${removeId}</code> adminlikdan olib tashlandi.`);
    return NextResponse.json({ ok: true });
  }

  // ── /list ──────────────────────────────────────────────────────────────────
  if (text === "/list") {
    const products = await getProducts();
    if (products.length === 0) {
      await reply(chatId, "📭 Mahsulotlar yo'q.");
      return NextResponse.json({ ok: true });
    }
    const lines = products.map(
      (p, i) =>
        `${i + 1}. <b>${p.nameUz}</b> — ${p.price.toLocaleString()} so'm\n   <code>${p.slug}</code> · ${p.category} ${p.image ? "🖼" : "—"}`
    );
    await reply(chatId, `📦 <b>Mahsulotlar (${products.length} ta):</b>\n\n${lines.join("\n\n")}`);
    return NextResponse.json({ ok: true });
  }

  // ── /delete slug ───────────────────────────────────────────────────────────
  if (text.startsWith("/delete ")) {
    const slug = text.slice(8).trim();
    const deleted = await deleteProduct(slug);
    if (!deleted) {
      await reply(chatId, `❌ <code>${slug}</code> topilmadi.`);
    } else {
      revalidatePath("/uz");
      revalidatePath("/ru");
      await reply(chatId, `✅ <b>${deleted.nameUz}</b> o'chirildi.`);
    }
    return NextResponse.json({ ok: true });
  }

  // ── /seed ──────────────────────────────────────────────────────────────────
  if (text === "/seed") {
    await seedProducts();
    revalidatePath("/uz");
    revalidatePath("/ru");
    await reply(chatId, `✅ Standart mahsulotlar yuklandi.`);
    return NextResponse.json({ ok: true });
  }

  // ── /add ───────────────────────────────────────────────────────────────────
  if (text.startsWith("/add ")) {
    const parts = text.slice(5).split("|").map((s) => s.trim());

    if (parts.length < 6) {
      await reply(
        chatId,
        `❌ Noto'g'ri format. Misol:\n\n/add Shokolad torti | Шоколадный торт | 150000 | cakes | Mazali shokolad torti | Вкусный шоколадный торт`
      );
      return NextResponse.json({ ok: true });
    }

    const [nameUz, nameRu, priceStr, category, descUz, descRu, badge] = parts;
    const validCategories = ["cakes", "cupcakes", "cookies", "pastries"];

    if (!validCategories.includes(category)) {
      await reply(chatId, `❌ Kategoriya noto'g'ri.\nFaqat: <code>cakes · cupcakes · cookies · pastries</code>`);
      return NextResponse.json({ ok: true });
    }

    const price = parseInt(priceStr.replace(/\D/g, ""));
    if (isNaN(price) || price <= 0) {
      await reply(chatId, `❌ Narx noto'g'ri: <code>${priceStr}</code>`);
      return NextResponse.json({ ok: true });
    }

    const existing = await getProducts();
    const id = existing.length > 0 ? Math.max(...existing.map((p) => p.id)) + 1 : 1;

    const pending = {
      id,
      slug: `product-${id}`,
      nameUz,
      nameRu,
      descUz,
      descRu,
      longDescUz: descUz,
      longDescRu: descRu,
      price,
      category: category as Product["category"],
      badge: (badge === "popular" || badge === "new" ? badge : null) as Product["badge"],
    };

    await redis.set(pendingKey, pending, { ex: 600 }); // 10 daqiqa

    await reply(
      chatId,
      `✅ Ma'lumotlar saqlandi!\n\n<b>${nameUz}</b> · ${price.toLocaleString()} so'm\n\n📸 Endi mahsulot rasmini yuboring.\nYoki /skip — rasmsiz qo'shish\nYoki /cancel — bekor qilish`
    );
    return NextResponse.json({ ok: true });
  }

  await reply(chatId, `❓ Noma'lum buyruq. /help yuboring.`);
  return NextResponse.json({ ok: true });
}
