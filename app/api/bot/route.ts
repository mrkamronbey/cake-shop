import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProducts, addProduct, deleteProduct, seedProducts } from "@/lib/products-store";
import { uploadFromUrl } from "@/lib/cloudinary";
import { redis } from "@/lib/redis";
import type { Product } from "@/lib/products";

const TOKEN = process.env.ADMIN_BOT_TOKEN!;
const SUPER_ADMIN = process.env.ADMIN_TELEGRAM_ID!;
const ADMINS_KEY = "sweetcake:admins";

// ── Helpers ────────────────────────────────────────────────────────────────

async function reply(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

async function replyWithButtons(
  chatId: number,
  text: string,
  buttons: { text: string; data: string }[][]
) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: buttons.map((row) =>
          row.map((btn) => ({ text: btn.text, callback_data: btn.data }))
        ),
      },
    }),
  });
}

async function answerCallback(id: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: id }),
  });
}

async function getTelegramFileUrl(fileId: string): Promise<string> {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
  const data = await res.json();
  return `https://api.telegram.org/file/bot${TOKEN}/${data.result.file_path}`;
}

async function isAdmin(chatId: number): Promise<boolean> {
  if (String(chatId) === SUPER_ADMIN) return true;
  const admins = await redis.smembers(ADMINS_KEY);
  return admins.includes(String(chatId));
}

// ── Wizard ─────────────────────────────────────────────────────────────────

type WizardStep = "name" | "price" | "category" | "desc" | "badge" | "photo";

interface WizardState {
  step: WizardStep;
  data: Partial<{
    nameUz: string;
    nameRu: string;
    price: number;
    category: string;
    descUz: string;
    descRu: string;
    badge: string;
  }>;
}

async function getWizard(chatId: number): Promise<WizardState | null> {
  return redis.get<WizardState>(`sweetcake:wizard:${chatId}`);
}

async function setWizard(chatId: number, state: WizardState) {
  await redis.set(`sweetcake:wizard:${chatId}`, state, { ex: 1800 }); // 30 daqiqa
}

async function delWizard(chatId: number) {
  await redis.del(`sweetcake:wizard:${chatId}`);
}

async function askStep(chatId: number, step: WizardStep) {
  const messages: Record<WizardStep, () => Promise<void>> = {
    name: () =>
      reply(
        chatId,
        "📝 <b>1/5</b> — Mahsulot nomi:\n\nUZ va RU tilida, ikki qatorda yuboring:\n\n<i>Shokolad torti\nШоколадный торт</i>"
      ),
    price: () => reply(chatId, "💰 <b>2/5</b> — Narxi <b>(so'm)</b>:\n\nMisol: <i>150000</i>"),
    category: () =>
      replyWithButtons(chatId, "📂 <b>3/5</b> — Kategoriyani tanlang:", [
        [
          { text: "🎂 Tortlar", data: "cat:cakes" },
          { text: "🧁 Kekslar", data: "cat:cupcakes" },
        ],
        [
          { text: "🍪 Pechenye", data: "cat:cookies" },
          { text: "🥐 Pishiriq", data: "cat:pastries" },
        ],
      ]),
    desc: () =>
      reply(
        chatId,
        "📄 <b>4/5</b> — Qisqa tavsif:\n\nUZ va RU tilida, ikki qatorda yuboring:\n\n<i>Belgiya shokoladi bilan\nС бельгийским шоколадом</i>"
      ),
    badge: () =>
      replyWithButtons(chatId, "🏷 <b>5/5</b> — Nishon (badge):", [
        [
          { text: "🔥 Popular", data: "badge:popular" },
          { text: "✨ Yangi", data: "badge:new" },
          { text: "— Yo'q", data: "badge:none" },
        ],
      ]),
    photo: () =>
      reply(
        chatId,
        "📸 <b>Rasm yuboring</b>\n\nYoki:\n/skip — rasmsiz saqlash\n/cancel — bekor qilish"
      ),
  };
  await messages[step]();
}

// ── Main handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();

  // ── Callback query (tugma bosilganda) ────────────────────────────────────
  if (body.callback_query) {
    const cb = body.callback_query;
    const chatId: number = cb.message.chat.id;
    const data: string = cb.data;

    await answerCallback(cb.id);

    if (!(await isAdmin(chatId))) return NextResponse.json({ ok: true });

    const wizard = await getWizard(chatId);
    if (!wizard) return NextResponse.json({ ok: true });

    // O'chirish tugmasi bosildi — tasdiqlash so'ra
    if (data.startsWith("del:")) {
      const slug = data.replace("del:", "");
      await replyWithButtons(
        chatId,
        `🗑 <b>O'chirishni tasdiqlaysizmi?</b>\n\n<code>${slug}</code>`,
        [
          [
            { text: "✅ Ha, o'chir", data: `del_confirm:${slug}` },
            { text: "❌ Yo'q", data: "del_cancel" },
          ],
        ]
      );
      return NextResponse.json({ ok: true });
    }

    // O'chirishni tasdiqladi
    if (data.startsWith("del_confirm:")) {
      const slug = data.replace("del_confirm:", "");
      const deleted = await deleteProduct(slug);
      if (deleted) {
        revalidatePath("/uz");
        revalidatePath("/ru");
        await reply(chatId, `✅ <b>${deleted.nameUz}</b> o'chirildi.`);
      } else {
        await reply(chatId, `❌ <code>${slug}</code> topilmadi.`);
      }
      return NextResponse.json({ ok: true });
    }

    // O'chirishni bekor qildi
    if (data === "del_cancel") {
      await reply(chatId, "❌ Bekor qilindi.");
      return NextResponse.json({ ok: true });
    }

    // Kategoriya tanlandi
    if (data.startsWith("cat:") && wizard.step === "category") {
      const category = data.replace("cat:", "");
      const categoryNames: Record<string, string> = {
        cakes: "🎂 Tortlar", cupcakes: "🧁 Kekslar",
        cookies: "🍪 Pechenye", pastries: "🥐 Pishiriq",
      };
      wizard.data.category = category;
      wizard.step = "desc";
      await setWizard(chatId, wizard);
      await reply(chatId, `✅ ${categoryNames[category]} tanlandi.`);
      await askStep(chatId, "desc");
    }

    // Badge tanlandi
    if (data.startsWith("badge:") && wizard.step === "badge") {
      const badge = data.replace("badge:", "");
      wizard.data.badge = badge === "none" ? "" : badge;
      wizard.step = "photo";
      await setWizard(chatId, wizard);
      await askStep(chatId, "photo");
    }

    return NextResponse.json({ ok: true });
  }

  // ── Message ──────────────────────────────────────────────────────────────
  const message = body.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId: number = message.chat.id;
  const text: string = (message.text ?? "").split("@")[0].trim();

  if (text === "/myid") {
    await reply(chatId, `Sizning Telegram ID: <code>${chatId}</code>`);
    return NextResponse.json({ ok: true });
  }

  if (!(await isAdmin(chatId))) {
    await reply(chatId, "⛔ Sizda ruxsat yo'q.");
    return NextResponse.json({ ok: true });
  }

  const isSuperAdmin = String(chatId) === SUPER_ADMIN;

  // ── /cancel ──────────────────────────────────────────────────────────────
  if (text === "/cancel") {
    await delWizard(chatId);
    await reply(chatId, "❌ Bekor qilindi.");
    return NextResponse.json({ ok: true });
  }

  // ── Wizard davomida matn qabul qilish ─────────────────────────────────────
  const wizard = await getWizard(chatId);

  if (wizard && text && !text.startsWith("/")) {
    switch (wizard.step) {
      case "name": {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          await reply(chatId, "❌ Ikki qator kerak:\n\n<i>Shokolad torti\nШоколадный торт</i>");
          return NextResponse.json({ ok: true });
        }
        wizard.data.nameUz = lines[0];
        wizard.data.nameRu = lines[1];
        wizard.step = "price";
        break;
      }
      case "price": {
        const price = parseInt(text.replace(/\D/g, ""));
        if (isNaN(price) || price <= 0) {
          await reply(chatId, "❌ Narx noto'g'ri. Faqat raqam kiriting:");
          return NextResponse.json({ ok: true });
        }
        wizard.data.price = price;
        wizard.step = "category";
        break;
      }
      case "desc": {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) {
          await reply(chatId, "❌ Ikki qator kerak:\n\n<i>Belgiya shokoladi bilan\nС бельгийским шоколадом</i>");
          return NextResponse.json({ ok: true });
        }
        wizard.data.descUz = lines[0];
        wizard.data.descRu = lines[1];
        wizard.step = "badge";
        break;
      }
    }
    await setWizard(chatId, wizard);
    await askStep(chatId, wizard.step);
    return NextResponse.json({ ok: true });
  }

  // ── Rasm qabul qilish (wizard photo bosqichi) ─────────────────────────────
  const fileId = message.photo
    ? message.photo[message.photo.length - 1].file_id
    : message.document?.mime_type?.startsWith("image/")
    ? message.document.file_id
    : null;

  if (fileId && wizard?.step === "photo") {
    await reply(chatId, "⏳ Rasm yuklanmoqda...");
    try {
      const fileUrl = await getTelegramFileUrl(fileId);
      const imageUrl = await uploadFromUrl(fileUrl);
      await saveProduct(chatId, wizard, imageUrl);
    } catch {
      await reply(chatId, "❌ Rasm yuklanmadi. Qayta yuboring.");
    }
    return NextResponse.json({ ok: true });
  }

  // ── /skip — rasmsiz saqlash ───────────────────────────────────────────────
  if (text === "/skip" && wizard?.step === "photo") {
    await saveProduct(chatId, wizard, "");
    return NextResponse.json({ ok: true });
  }

  // ── /add — wizard boshlash ─────────────────────────────────────────────────
  if (text === "/add") {
    await delWizard(chatId);
    const newWizard: WizardState = { step: "name", data: {} };
    await setWizard(chatId, newWizard);
    await reply(chatId, "➕ <b>Yangi mahsulot qo'shish</b>\n\n/cancel — istalgan vaqt bekor qilish");
    await askStep(chatId, "name");
    return NextResponse.json({ ok: true });
  }

  // ── /list ─────────────────────────────────────────────────────────────────
  if (text === "/list") {
    const products = await getProducts();
    if (products.length === 0) {
      await reply(chatId, "📭 Mahsulotlar yo'q.");
      return NextResponse.json({ ok: true });
    }
    for (const [i, p] of products.entries()) {
      await replyWithButtons(
        chatId,
        `${i + 1}. <b>${p.nameUz}</b>\n💰 ${p.price.toLocaleString()} so'm · ${p.category} ${p.image ? "🖼" : ""}`,
        [[{ text: "🗑 O'chirish", data: `del:${p.slug}` }]]
      );
    }
    return NextResponse.json({ ok: true });
  }

  // ── /delete slug ──────────────────────────────────────────────────────────
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

  // ── /seed ─────────────────────────────────────────────────────────────────
  if (text === "/seed") {
    await seedProducts();
    revalidatePath("/uz");
    revalidatePath("/ru");
    await reply(chatId, "✅ Standart mahsulotlar yuklandi.");
    return NextResponse.json({ ok: true });
  }

  // ── /start, /help ─────────────────────────────────────────────────────────
  if (text === "/start" || text === "/help") {
    const superCmds = isSuperAdmin
      ? `\n\n<b>Super admin:</b>\n/add_admin ID\n/remove_admin ID\n/admins`
      : "";
    await reply(
      chatId,
      `🎂 <b>Sweet Cake Admin Bot</b>\n\n` +
        `/add — yangi mahsulot qo'shish\n` +
        `/list — mahsulotlar ro'yxati\n` +
        `/delete slug — o'chirish\n` +
        `/seed — standart mahsulotlarni yuklash\n` +
        `/cancel — joriy amalni bekor qilish` +
        superCmds
    );
    return NextResponse.json({ ok: true });
  }

  // ── Super admin buyruqlari ────────────────────────────────────────────────
  if (text === "/admins") {
    if (!isSuperAdmin) return NextResponse.json({ ok: true });
    const admins = await redis.smembers(ADMINS_KEY);
    const list = admins.length > 0 ? admins.map((id) => `• <code>${id}</code>`).join("\n") : "— yo'q";
    await reply(chatId, `👥 <b>Adminlar:</b>\n\n⭐ <code>${SUPER_ADMIN}</code> (super)\n${list}`);
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/add_admin")) {
    if (!isSuperAdmin) return NextResponse.json({ ok: true });
    const id = text.replace("/add_admin", "").trim();
    if (!id || isNaN(Number(id))) {
      await reply(chatId, "❌ Format: /add_admin 123456789");
      return NextResponse.json({ ok: true });
    }
    await redis.sadd(ADMINS_KEY, id);
    await reply(chatId, `✅ <code>${id}</code> admin qilib qo'shildi.`);
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/remove_admin")) {
    if (!isSuperAdmin) return NextResponse.json({ ok: true });
    const id = text.replace("/remove_admin", "").trim();
    await redis.srem(ADMINS_KEY, id);
    await reply(chatId, `✅ <code>${id}</code> adminlikdan olib tashlandi.`);
    return NextResponse.json({ ok: true });
  }

  await reply(chatId, `❓ Noma'lum buyruq. /help yuboring.`);
  return NextResponse.json({ ok: true });
}

// ── Mahsulotni saqlash ─────────────────────────────────────────────────────

async function saveProduct(chatId: number, wizard: WizardState, imageUrl: string) {
  const { nameUz, nameRu, price, category, descUz, descRu, badge } = wizard.data;

  const existing = await getProducts();
  const id = existing.length > 0 ? Math.max(...existing.map((p) => p.id)) + 1 : 1;

  const product: Product = {
    id,
    slug: `product-${id}`,
    nameUz: nameUz!,
    nameRu: nameRu!,
    descUz: descUz!,
    descRu: descRu!,
    longDescUz: descUz!,
    longDescRu: descRu!,
    price: price!,
    category: category as Product["category"],
    badge: (badge === "popular" || badge === "new" ? badge : null) as Product["badge"],
    image: imageUrl,
  };

  await addProduct(product);
  await delWizard(chatId);
  revalidatePath("/uz");
  revalidatePath("/ru");

  await reply(
    chatId,
    `✅ <b>${nameUz}</b> muvaffaqiyatli qo'shildi!\n\n` +
      `💰 ${price!.toLocaleString()} so'm\n` +
      `📂 ${category}\n` +
      `🖼 ${imageUrl ? "Rasm bor" : "Rasmsiz"}`
  );
}
