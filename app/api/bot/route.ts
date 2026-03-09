import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getProducts, addProduct, deleteProduct, updateProduct, seedProducts } from "@/lib/products-store";
import { uploadFromUrl } from "@/lib/cloudinary";
import { redis } from "@/lib/redis";
import type { Product } from "@/lib/products";

const TOKEN = process.env.ADMIN_BOT_TOKEN!;
const SUPER_ADMIN = process.env.ADMIN_TELEGRAM_ID!;
const ADMINS_KEY = "sweetcake:admins";
const CATS_KEY = "sweetcake:categories";

// ── Category ────────────────────────────────────────────────────────────────

interface Category {
  slug: string;
  emoji: string;
  nameUz: string;
  nameRu: string;
}

const DEFAULT_CATS: Category[] = [
  { slug: "cakes",    emoji: "🎂", nameUz: "Tortlar",  nameRu: "Торты"    },
  { slug: "cupcakes", emoji: "🧁", nameUz: "Kekslar",  nameRu: "Капкейки" },
  { slug: "cookies",  emoji: "🍪", nameUz: "Pechenye", nameRu: "Печенье"  },
  { slug: "pastries", emoji: "🥐", nameUz: "Pishiriq", nameRu: "Выпечка"  },
];

async function getCategories(): Promise<Category[]> {
  const data = await redis.get<Category[]>(CATS_KEY);
  return data ?? DEFAULT_CATS;
}

async function saveCategories(cats: Category[]): Promise<void> {
  await redis.set(CATS_KEY, cats);
}

// ── Telegram helpers ─────────────────────────────────────────────────────────

type Btn = { text: string; data: string };

async function reply(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

async function replyKb(chatId: number, text: string, rows: Btn[][]) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: rows.map((r) => r.map((b) => ({ text: b.text, callback_data: b.data }))),
      },
    }),
  });
}

async function answerCb(id: string, text?: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: id, text, show_alert: false }),
  });
}

async function editMsgKb(chatId: number, msgId: number, text: string, rows: Btn[][]) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: msgId,
      text,
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: rows.map((r) => r.map((b) => ({ text: b.text, callback_data: b.data }))),
      },
    }),
  });
}

async function editMsgText(chatId: number, msgId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TOKEN}/editMessageText`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, message_id: msgId, text, parse_mode: "HTML" }),
  });
}

async function getTgFileUrl(fileId: string): Promise<string> {
  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
  const d = await res.json();
  return `https://api.telegram.org/file/bot${TOKEN}/${d.result.file_path}`;
}

async function isAdmin(chatId: number): Promise<boolean> {
  if (String(chatId) === SUPER_ADMIN) return true;
  const admins = await redis.smembers(ADMINS_KEY);
  return admins.includes(String(chatId));
}

// ── Menu screens ─────────────────────────────────────────────────────────────

async function showMenu(chatId: number) {
  await replyKb(chatId, "🎂 <b>Sweet Cake Admin Panel</b>\n\nNimani boshqarmoqchisiz?", [
    [{ text: "📦 Mahsulotlar", data: "menu:products" }, { text: "📂 Kategoriyalar", data: "menu:cats" }],
    [{ text: "🏷 Badgelar",    data: "menu:badges"   }, { text: "ℹ️ Yordam",        data: "menu:help"  }],
  ]);
}

async function showProductsMenu(chatId: number) {
  const products = await getProducts();
  const rows: Btn[][] = products.map((p, i) => [
    { text: `${i + 1}. ${p.nameUz} — ${p.price.toLocaleString()} so'm`, data: `pv:${p.slug}` },
    { text: "✏️", data: `edit:${p.slug}` },
    { text: "🗑", data: `del:${p.slug}` },
  ]);
  await replyKb(
    chatId,
    `📦 <b>Mahsulotlar</b> — jami ${products.length} ta`,
    [
      [{ text: "➕ Yangi mahsulot qo'shish", data: "prod:add" }],
      ...rows,
      [{ text: "🔙 Asosiy menyu", data: "menu" }],
    ]
  );
}

async function showProductActions(chatId: number, slug: string, msgId?: number) {
  const products = await getProducts();
  const p = products.find((x) => x.slug === slug);
  if (!p) { await reply(chatId, "❌ Mahsulot topilmadi."); return; }
  const badge = p.badge === "popular" ? "🔥 Popular" : p.badge === "new" ? "✨ Yangi" : "badge yo'q";
  const text = `📦 <b>${p.nameUz}</b>\n💰 ${p.price.toLocaleString()} so'm | ${badge}`;
  const rows = [
    [{ text: "✏️ Tahrirlash", data: `edit:${slug}` }, { text: "🗑 O'chirish", data: `del:${slug}` }],
    [{ text: "🔙 Mahsulotlar", data: "menu:products" }],
  ];
  if (msgId) await editMsgKb(chatId, msgId, text, rows);
  else await replyKb(chatId, text, rows);
}

async function showEditMenu(chatId: number, slug: string, msgId?: number) {
  const text = `✏️ <b>Tahrirlash:</b> <code>${slug}</code>\n\nQaysi maydonni o'zgartirish kerak?`;
  const rows = [
    [{ text: "📝 Nom",        data: `ef:${slug}:name`     }, { text: "💰 Narx",       data: `ef:${slug}:price`    }],
    [{ text: "📄 Tavsif",     data: `ef:${slug}:desc`     }, { text: "📸 Rasm",       data: `ef:${slug}:photo`    }],
    [{ text: "📂 Kategoriya", data: `ef:${slug}:category` }],
    [{ text: "🔥 Popular",    data: `eb:${slug}:popular`  }, { text: "✨ Yangi",      data: `eb:${slug}:new`      }, { text: "🏷 Badge yo'q", data: `eb:${slug}:none` }],
    [{ text: "🔙 Orqaga",     data: `pv:${slug}` }],
  ];
  if (msgId) await editMsgKb(chatId, msgId, text, rows);
  else await replyKb(chatId, text, rows);
}

async function showCatsMenu(chatId: number) {
  const cats = await getCategories();
  const products = await getProducts();
  const rows: Btn[][] = cats.map((c) => {
    const cnt = products.filter((p) => p.category === c.slug).length;
    return [
      { text: `${c.emoji} ${c.nameUz} (${cnt} ta)`, data: `cm:info:${c.slug}` },
      { text: "✏️", data: `cm:edit:${c.slug}` },
      { text: "🗑", data: `cm:del:${c.slug}` },
    ];
  });
  await replyKb(chatId, `📂 <b>Kategoriyalar</b> — jami ${cats.length} ta`, [
    ...rows,
    [{ text: "➕ Yangi kategoriya qo'shish", data: "cm:add" }],
    [{ text: "🔙 Asosiy menyu", data: "menu" }],
  ]);
}

async function showBadgesMenu(chatId: number) {
  const products = await getProducts();
  const pop  = products.filter((p) => p.badge === "popular");
  const nw   = products.filter((p) => p.badge === "new");
  const none = products.filter((p) => !p.badge);

  const lines = [
    `🔥 <b>Popular</b> (${pop.length} ta): ${pop.map((p) => p.nameUz).join(", ") || "—"}`,
    `✨ <b>Yangi</b> (${nw.length} ta):    ${nw.map((p) => p.nameUz).join(", ") || "—"}`,
    `🚫 <b>Badgesiz</b> (${none.length} ta): ${none.map((p) => p.nameUz).join(", ") || "—"}`,
    "",
    "Qaysi mahsulot badge'ini o'zgartirmoqchisiz?",
  ].join("\n");

  const rows: Btn[][] = products.map((p) => {
    const icon = p.badge === "popular" ? "🔥" : p.badge === "new" ? "✨" : "🚫";
    return [{ text: `${icon} ${p.nameUz}`, data: `bp:${p.slug}` }];
  });

  await replyKb(chatId, `🏷 <b>Badge boshqaruvi</b>\n\n${lines}`, [
    ...rows,
    [{ text: "🔙 Asosiy menyu", data: "menu" }],
  ]);
}

async function showBadgePicker(chatId: number, slug: string) {
  const products = await getProducts();
  const p = products.find((x) => x.slug === slug);
  if (!p) { await reply(chatId, "❌ Topilmadi."); return; }
  await replyKb(
    chatId,
    `🏷 <b>${p.nameUz}</b>\nJoriy badge: ${p.badge || "yo'q"}`,
    [
      [{ text: "🔥 Popular", data: `eb:${slug}:popular` }, { text: "✨ Yangi", data: `eb:${slug}:new` }, { text: "🚫 Yo'q", data: `eb:${slug}:none` }],
      [{ text: "🔙 Badgelar", data: "menu:badges" }],
    ]
  );
}

async function sendProductCard(chatId: number, p: Product, index: number) {
  const cats = await getCategories();
  const cat  = cats.find((c) => c.slug === p.category);
  const catLabel   = cat ? `${cat.emoji} ${cat.nameUz}` : p.category;
  const badgeLine  = p.badge === "popular"
    ? "🔥 <b>Popular</b>"
    : p.badge === "new"
    ? "✨ <b>Yangi</b>"
    : "🏷 Badge yo'q";
  const priceStr = p.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  const badgeTop = p.badge === "popular"
    ? "🔥 <b>Popular</b>"
    : p.badge === "new"
    ? "✨ <b>Yangi</b>"
    : "";

  const caption =
    (badgeTop ? `${badgeTop}  |  ` : "") + `${catLabel}  <i>#${index}</i>\n\n` +
    `🇺🇿 <b>${p.nameUz}</b>\n` +
    `🇷🇺 <i>${p.nameRu}</i>\n\n` +
    `💬 ${p.descUz}\n` +
    `<i>    ${p.descRu}</i>\n\n` +
    `💰 <b>${priceStr} so'm</b>\n` +
    `🔑 <code>${p.slug}</code>`;

  const kb = { inline_keyboard: [[
    { text: "✏️ Tahrirlash", callback_data: `edit:${p.slug}` },
    { text: "🗑 O'chirish",  callback_data: `del:${p.slug}`  },
  ]]};

  if (p.image && p.image.startsWith("http")) {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, photo: p.image, caption, parse_mode: "HTML", reply_markup: kb }),
    });
  } else {
    await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: caption, parse_mode: "HTML", reply_markup: kb }),
    });
  }
}

// ── Edit state ────────────────────────────────────────────────────────────────

type EditField = "name" | "price" | "desc" | "photo" | "category";
interface EditState { slug: string; field: EditField; msgId?: number }

async function getEdit(chatId: number): Promise<EditState | null> {
  return redis.get<EditState>(`sweetcake:edit:${chatId}`);
}
async function setEdit(chatId: number, s: EditState) {
  await redis.set(`sweetcake:edit:${chatId}`, s, { ex: 900 });
}
async function delEdit(chatId: number) {
  await redis.del(`sweetcake:edit:${chatId}`);
}

// ── Category wizard ───────────────────────────────────────────────────────────

interface CatWiz { step: "name" | "emoji"; editSlug?: string; data: Partial<{ nameUz: string; nameRu: string; emoji: string }> }

async function getCatWiz(chatId: number): Promise<CatWiz | null> {
  return redis.get<CatWiz>(`sweetcake:catwiz:${chatId}`);
}
async function setCatWiz(chatId: number, s: CatWiz) {
  await redis.set(`sweetcake:catwiz:${chatId}`, s, { ex: 900 });
}
async function delCatWiz(chatId: number) {
  await redis.del(`sweetcake:catwiz:${chatId}`);
}

// ── Product wizard ────────────────────────────────────────────────────────────

type WizStep = "name" | "price" | "category" | "desc" | "badge" | "photo";
interface WizState {
  step: WizStep;
  data: Partial<{ nameUz: string; nameRu: string; price: number; category: string; descUz: string; descRu: string; badge: string }>;
}

async function getWiz(chatId: number): Promise<WizState | null> {
  return redis.get<WizState>(`sweetcake:wizard:${chatId}`);
}
async function setWiz(chatId: number, s: WizState) {
  await redis.set(`sweetcake:wizard:${chatId}`, s, { ex: 1800 });
}
async function delWiz(chatId: number) {
  await redis.del(`sweetcake:wizard:${chatId}`);
}

async function askWizStep(chatId: number, step: WizStep) {
  if (step === "category") {
    const cats = await getCategories();
    const rows: Btn[][] = [];
    for (let i = 0; i < cats.length; i += 2) {
      const row: Btn[] = [{ text: `${cats[i].emoji} ${cats[i].nameUz}`, data: `cat:${cats[i].slug}` }];
      if (cats[i + 1]) row.push({ text: `${cats[i + 1].emoji} ${cats[i + 1].nameUz}`, data: `cat:${cats[i + 1].slug}` });
      rows.push(row);
    }
    await replyKb(chatId, "📂 <b>3/5</b> — Kategoriyani tanlang:", rows);
    return;
  }
  const msgs: Partial<Record<WizStep, string>> = {
    name:  "📝 <b>1/5</b> — Mahsulot nomi:\n\nUZ va RU tilida, ikki qatorda:\n\n<i>Shokolad torti\nШоколадный торт</i>",
    price: "💰 <b>2/5</b> — Narxi <b>(so'm)</b>:\n\nMisol: <i>150000</i>",
    desc:  "📄 <b>4/5</b> — Qisqa tavsif:\n\nUZ va RU tilida, ikki qatorda:\n\n<i>Belgiya shokoladi bilan\nС бельгийским шоколадом</i>",
    photo: "📸 <b>Rasm yuboring</b>\n\nYoki /skip — rasmsiz saqlash",
  };
  if (step === "badge") {
    await replyKb(chatId, "🏷 <b>5/5</b> — Nishon (badge):", [
      [{ text: "🔥 Popular", data: "badge:popular" }, { text: "✨ Yangi", data: "badge:new" }, { text: "— Yo'q", data: "badge:none" }],
    ]);
    return;
  }
  if (msgs[step]) await reply(chatId, msgs[step]!);
}

// ── Main handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const body = await req.json();

  // ── Callback query ──────────────────────────────────────────────────────────
  if (body.callback_query) {
    const cb     = body.callback_query;
    const chatId: number = cb.message.chat.id;
    const data: string   = cb.data;

    // photo message larni editMessageText bilan o'zgartirib bo'lmaydi
    const msgId = cb.message.photo ? undefined : cb.message.message_id;
    await answerCb(cb.id);
    if (!(await isAdmin(chatId))) return NextResponse.json({ ok: true });

    // ── Navigation ──
    if (data === "menu")          { await showMenu(chatId);         return NextResponse.json({ ok: true }); }
    if (data === "menu:products") { await showProductsMenu(chatId); return NextResponse.json({ ok: true }); }
    if (data === "menu:cats")     { await showCatsMenu(chatId);     return NextResponse.json({ ok: true }); }
    if (data === "menu:badges")   { await showBadgesMenu(chatId);   return NextResponse.json({ ok: true }); }
    if (data === "menu:help") {
      await reply(chatId, "ℹ️ <b>Yordam</b>\n\n/menu — asosiy menyu\n/add — mahsulot qo'shish\n/list — ro'yxat\n/seed — standart mahsulotlar\n/cancel — bekor qilish");
      return NextResponse.json({ ok: true });
    }

    // ── Products ──
    if (data === "prod:add") {
      await delWiz(chatId);
      await setWiz(chatId, { step: "name", data: {} });
      await reply(chatId, "➕ <b>Yangi mahsulot qo'shish</b>\n\n/cancel — istalgan vaqt bekor qilish");
      await askWizStep(chatId, "name");
      return NextResponse.json({ ok: true });
    }
    if (data.startsWith("pv:")) {
      await showProductActions(chatId, data.slice(3), msgId);
      return NextResponse.json({ ok: true });
    }

    // ── Edit product ──
    if (data.startsWith("edit:")) {
      await showEditMenu(chatId, data.slice(5), msgId);
      return NextResponse.json({ ok: true });
    }

    if (data.startsWith("ef:")) {
      const parts = data.split(":");           // ["ef", slug, field]
      const slug  = parts[1];
      const field = parts[2] as EditField;

      if (field === "category") {
        await setEdit(chatId, { slug, field, msgId });
        const cats = await getCategories();
        const rows: Btn[][] = [];
        for (let i = 0; i < cats.length; i += 2) {
          const row: Btn[] = [{ text: `${cats[i].emoji} ${cats[i].nameUz}`, data: `ecat:${cats[i].slug}` }];
          if (cats[i + 1]) row.push({ text: `${cats[i+1].emoji} ${cats[i+1].nameUz}`, data: `ecat:${cats[i+1].slug}` });
          rows.push(row);
        }
        rows.push([{ text: "🔙 Orqaga", data: `edit:${slug}` }]);
        await editMsgKb(chatId, msgId, "📂 Yangi kategoriyani tanlang:", rows);
        return NextResponse.json({ ok: true });
      }

      await setEdit(chatId, { slug, field, msgId });
      const prompts: Record<string, string> = {
        name:  "📝 <b>Nom tahrirlash</b>\n\nYangi nom ikki qatorda yuboring:\n\n<i>Shokolad torti\nШоколадный торт</i>\n\n/cancel — bekor qilish",
        price: "💰 <b>Narx tahrirlash</b>\n\nYangi narxni kiriting (so'm):\n\n/cancel — bekor qilish",
        desc:  "📄 <b>Tavsif tahrirlash</b>\n\nYangi tavsif ikki qatorda yuboring:\n\n<i>Mazali tort\nВкусный торт</i>\n\n/cancel — bekor qilish",
        photo: "📸 <b>Rasm tahrirlash</b>\n\nYangi rasmni yuboring:\n\n/cancel — bekor qilish",
      };
      await editMsgText(chatId, msgId, prompts[field] ?? "Yangi qiymat yuboring:\n\n/cancel — bekor qilish");
      return NextResponse.json({ ok: true });
    }

    // Category pick during edit
    if (data.startsWith("ecat:")) {
      const newCatSlug = data.slice(5);
      const editState  = await getEdit(chatId);
      if (editState?.field === "category") {
        await updateProduct(editState.slug, { category: newCatSlug as Product["category"] });
        await delEdit(chatId);
        revalidatePath("/uz"); revalidatePath("/ru");
        await answerCb(cb.id, "✅ Kategoriya yangilandi!");
        if (editState.msgId) await showEditMenu(chatId, editState.slug, editState.msgId);
      }
      return NextResponse.json({ ok: true });
    }

    // Badge set
    if (data.startsWith("eb:")) {
      const [, slug, badge] = data.split(":");
      const ok = await updateProduct(slug, { badge: (badge === "none" ? null : badge) as Product["badge"] });
      if (ok) {
        revalidatePath("/uz"); revalidatePath("/ru");
        await answerCb(cb.id, `✅ Badge yangilandi: ${badge === "none" ? "yo'q" : badge}`);
        await showEditMenu(chatId, slug, msgId);
      } else await reply(chatId, "❌ Mahsulot topilmadi.");
      return NextResponse.json({ ok: true });
    }

    // Badge picker (from badges menu)
    if (data.startsWith("bp:")) {
      await showBadgePicker(chatId, data.slice(3));
      return NextResponse.json({ ok: true });
    }

    // Delete product
    if (data.startsWith("del:")) {
      const slug = data.slice(4);
      await replyKb(chatId, `🗑 <b>O'chirishni tasdiqlaysizmi?</b>\n\n<code>${slug}</code>`, [
        [{ text: "✅ Ha, o'chir", data: `del_ok:${slug}` }, { text: "❌ Yo'q", data: `pv:${slug}` }],
      ]);
      return NextResponse.json({ ok: true });
    }
    if (data.startsWith("del_ok:")) {
      const slug    = data.slice(7);
      const deleted = await deleteProduct(slug);
      if (deleted) { revalidatePath("/uz"); revalidatePath("/ru"); await reply(chatId, `✅ <b>${deleted.nameUz}</b> o'chirildi.`); }
      else await reply(chatId, `❌ <code>${slug}</code> topilmadi.`);
      return NextResponse.json({ ok: true });
    }

    // ── Category management ──
    if (data === "cm:add") {
      await delCatWiz(chatId);
      await setCatWiz(chatId, { step: "name", data: {} });
      await reply(chatId, "📂 <b>Yangi kategoriya</b>\n\nNomi UZ va RU tilida, ikki qatorda:\n\n<i>Ichimliklar\nНапитки</i>\n\n/cancel — bekor qilish");
      return NextResponse.json({ ok: true });
    }

    if (data.startsWith("cm:edit:")) {
      const slug = data.slice(8);
      const cats = await getCategories();
      const cat  = cats.find((c) => c.slug === slug);
      if (!cat) { await reply(chatId, "❌ Kategoriya topilmadi."); return NextResponse.json({ ok: true }); }
      await replyKb(chatId, `✏️ <b>${cat.emoji} ${cat.nameUz}</b> — qaysi maydonni tahrirlash?`, [
        [{ text: "📝 Nom", data: `cm:ef:${slug}:name` }, { text: `${cat.emoji} Emoji`, data: `cm:ef:${slug}:emoji` }],
        [{ text: "🔙 Kategoriyalar", data: "menu:cats" }],
      ]);
      return NextResponse.json({ ok: true });
    }

    if (data.startsWith("cm:ef:")) {
      const parts = data.split(":");           // ["cm", "ef", slug, field]
      const slug  = parts[2];
      const field = parts[3] as "name" | "emoji";
      await setCatWiz(chatId, { step: field, editSlug: slug, data: {} });
      const prompts = {
        name:  "📝 Yangi nom (ikki qatorda):\n\n<i>Ichimliklar\nНапитки</i>",
        emoji: "🎨 Yangi emoji yuboring (masalan: 🍰):",
      };
      await reply(chatId, prompts[field] + "\n\n/cancel — bekor qilish");
      return NextResponse.json({ ok: true });
    }

    if (data.startsWith("cm:del:")) {
      const slug     = data.slice(7);
      const cats     = await getCategories();
      const cat      = cats.find((c) => c.slug === slug);
      if (!cat) { await reply(chatId, "❌ Kategoriya topilmadi."); return NextResponse.json({ ok: true }); }
      const products = await getProducts();
      const cnt      = products.filter((p) => p.category === slug).length;
      await replyKb(chatId,
        `🗑 <b>${cat.emoji} ${cat.nameUz}</b> kategoriyasini o'chirasizmi?\n⚠️ Bu kategoriyada <b>${cnt} ta</b> mahsulot bor.`,
        [[{ text: "✅ Ha, o'chir", data: `cm:delok:${slug}` }, { text: "❌ Yo'q", data: "menu:cats" }]]
      );
      return NextResponse.json({ ok: true });
    }

    if (data.startsWith("cm:delok:")) {
      const slug    = data.slice(9);
      const cats    = await getCategories();
      const newCats = cats.filter((c) => c.slug !== slug);
      await saveCategories(newCats);
      await reply(chatId, "✅ Kategoriya o'chirildi.");
      await showCatsMenu(chatId);
      return NextResponse.json({ ok: true });
    }

    // ── Wizard inline buttons ──
    const wiz = await getWiz(chatId);

    if (data.startsWith("cat:") && wiz?.step === "category") {
      const catSlug = data.slice(4);
      const cats    = await getCategories();
      const cat     = cats.find((c) => c.slug === catSlug);
      wiz.data.category = catSlug;
      wiz.step = "desc";
      await setWiz(chatId, wiz);
      await reply(chatId, `✅ ${cat ? cat.emoji + " " + cat.nameUz : catSlug} tanlandi.`);
      await askWizStep(chatId, "desc");
    }

    if (data.startsWith("badge:") && wiz?.step === "badge") {
      const badge = data.slice(6);
      wiz.data.badge = badge === "none" ? "" : badge;
      wiz.step = "photo";
      await setWiz(chatId, wiz);
      await askWizStep(chatId, "photo");
    }

    return NextResponse.json({ ok: true });
  }

  // ── Message ───────────────────────────────────────────────────────────────
  const message = body.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId: number = message.chat.id;
  const text: string   = (message.text ?? "").split("@")[0].trim();

  if (text === "/myid") {
    await reply(chatId, `Sizning Telegram ID: <code>${chatId}</code>`);
    return NextResponse.json({ ok: true });
  }

  if (!(await isAdmin(chatId))) {
    await reply(chatId, "⛔ Sizda ruxsat yo'q.");
    return NextResponse.json({ ok: true });
  }

  const isSuperAdmin = String(chatId) === SUPER_ADMIN;

  // /cancel
  if (text === "/cancel") {
    await delWiz(chatId); await delEdit(chatId); await delCatWiz(chatId);
    await reply(chatId, "❌ Bekor qilindi.");
    return NextResponse.json({ ok: true });
  }

  // ── Photo fileId ──────────────────────────────────────────────────────────
  const fileId = message.photo
    ? message.photo[message.photo.length - 1].file_id
    : message.document?.mime_type?.startsWith("image/")
    ? message.document.file_id
    : null;

  // ── Category wizard ───────────────────────────────────────────────────────
  const catWiz = await getCatWiz(chatId);

  if (catWiz && text && !text.startsWith("/")) {
    if (catWiz.step === "name") {
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) {
        await reply(chatId, "❌ Ikki qator kerak:\n\n<i>Ichimliklar\nНапитки</i>");
        return NextResponse.json({ ok: true });
      }
      if (catWiz.editSlug) {
        const cats = await getCategories();
        const idx  = cats.findIndex((c) => c.slug === catWiz.editSlug);
        if (idx !== -1) { cats[idx].nameUz = lines[0]; cats[idx].nameRu = lines[1]; await saveCategories(cats); }
        await delCatWiz(chatId);
        await reply(chatId, "✅ Kategoriya nomi yangilandi!");
      } else {
        catWiz.data.nameUz = lines[0];
        catWiz.data.nameRu = lines[1];
        catWiz.step = "emoji";
        await setCatWiz(chatId, catWiz);
        await reply(chatId, "🎨 Kategoriya emojisini yuboring (masalan: 🍰)\n\nYoki /skip — standart emoji ishlatish");
      }
      return NextResponse.json({ ok: true });
    }

    if (catWiz.step === "emoji") {
      await finishCatWiz(chatId, catWiz, text.trim());
      return NextResponse.json({ ok: true });
    }
  }

  // /skip for category emoji
  if (text === "/skip" && catWiz?.step === "emoji") {
    await finishCatWiz(chatId, catWiz, "🍰");
    return NextResponse.json({ ok: true });
  }

  // ── Edit state text ───────────────────────────────────────────────────────
  const editState = await getEdit(chatId);

  if (editState && text && !text.startsWith("/")) {
    switch (editState.field) {
      case "name": {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) { await reply(chatId, "❌ Ikki qator kerak."); return NextResponse.json({ ok: true }); }
        await updateProduct(editState.slug, { nameUz: lines[0], nameRu: lines[1] });
        break;
      }
      case "price": {
        const price = parseInt(text.replace(/\D/g, ""));
        if (isNaN(price) || price <= 0) { await reply(chatId, "❌ Faqat raqam kiriting:"); return NextResponse.json({ ok: true }); }
        await updateProduct(editState.slug, { price });
        break;
      }
      case "desc": {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) { await reply(chatId, "❌ Ikki qator kerak."); return NextResponse.json({ ok: true }); }
        await updateProduct(editState.slug, { descUz: lines[0], descRu: lines[1] });
        break;
      }
      default:
        return NextResponse.json({ ok: true });
    }
    const slug = editState.slug;
    const savedMsgId = editState.msgId;
    await delEdit(chatId);
    revalidatePath("/uz"); revalidatePath("/ru");
    await reply(chatId, "✅ Yangilandi!");
    if (savedMsgId) await showEditMenu(chatId, slug, savedMsgId);
    return NextResponse.json({ ok: true });
  }

  // Edit photo
  if (fileId && editState?.field === "photo") {
    await reply(chatId, "⏳ Rasm yuklanmoqda...");
    const photoSlug = editState.slug;
    const photoMsgId = editState.msgId;
    try {
      const url      = await getTgFileUrl(fileId);
      const imageUrl = await uploadFromUrl(url);
      await updateProduct(photoSlug, { image: imageUrl });
      await delEdit(chatId);
      revalidatePath("/uz"); revalidatePath("/ru");
      await reply(chatId, "✅ Rasm yangilandi!");
      if (photoMsgId) await showEditMenu(chatId, photoSlug, photoMsgId);
    } catch { await reply(chatId, "❌ Rasm yuklanmadi. Qayta yuboring."); }
    return NextResponse.json({ ok: true });
  }

  // ── Wizard text ───────────────────────────────────────────────────────────
  const wiz = await getWiz(chatId);

  if (wiz && text && !text.startsWith("/")) {
    switch (wiz.step) {
      case "name": {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) { await reply(chatId, "❌ Ikki qator kerak:\n\n<i>Shokolad torti\nШоколадный торт</i>"); return NextResponse.json({ ok: true }); }
        wiz.data.nameUz = lines[0]; wiz.data.nameRu = lines[1]; wiz.step = "price";
        break;
      }
      case "price": {
        const price = parseInt(text.replace(/\D/g, ""));
        if (isNaN(price) || price <= 0) { await reply(chatId, "❌ Narx noto'g'ri. Faqat raqam:"); return NextResponse.json({ ok: true }); }
        wiz.data.price = price; wiz.step = "category";
        break;
      }
      case "desc": {
        const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) { await reply(chatId, "❌ Ikki qator kerak:\n\n<i>Belgiya shokoladi bilan\nС бельгийским шоколадом</i>"); return NextResponse.json({ ok: true }); }
        wiz.data.descUz = lines[0]; wiz.data.descRu = lines[1]; wiz.step = "badge";
        break;
      }
    }
    await setWiz(chatId, wiz);
    await askWizStep(chatId, wiz.step);
    return NextResponse.json({ ok: true });
  }

  // Wizard photo
  if (fileId && wiz?.step === "photo") {
    await reply(chatId, "⏳ Rasm yuklanmoqda...");
    try {
      const url      = await getTgFileUrl(fileId);
      const imageUrl = await uploadFromUrl(url);
      await saveProduct(chatId, wiz, imageUrl);
    } catch { await reply(chatId, "❌ Rasm yuklanmadi. Qayta yuboring."); }
    return NextResponse.json({ ok: true });
  }

  // /skip wizard photo
  if (text === "/skip" && wiz?.step === "photo") {
    await saveProduct(chatId, wiz, "");
    return NextResponse.json({ ok: true });
  }

  // ── Commands ──────────────────────────────────────────────────────────────
  if (text === "/start" || text === "/menu" || text === "/help") {
    await showMenu(chatId);
    return NextResponse.json({ ok: true });
  }

  if (text === "/add") {
    await delWiz(chatId);
    await setWiz(chatId, { step: "name", data: {} });
    await reply(chatId, "➕ <b>Yangi mahsulot qo'shish</b>\n\n/cancel — istalgan vaqt bekor qilish");
    await askWizStep(chatId, "name");
    return NextResponse.json({ ok: true });
  }

  if (text === "/list") {
    const products = await getProducts();
    if (products.length === 0) { await reply(chatId, "📭 Mahsulotlar yo'q."); return NextResponse.json({ ok: true }); }
    await reply(chatId, `📦 <b>Jami ${products.length} ta mahsulot:</b>`);
    for (const [i, p] of products.entries()) await sendProductCard(chatId, p, i + 1);
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/delete ")) {
    const slug    = text.slice(8).trim();
    const deleted = await deleteProduct(slug);
    if (!deleted) await reply(chatId, `❌ <code>${slug}</code> topilmadi.`);
    else { revalidatePath("/uz"); revalidatePath("/ru"); await reply(chatId, `✅ <b>${deleted.nameUz}</b> o'chirildi.`); }
    return NextResponse.json({ ok: true });
  }

  if (text === "/seed") {
    await seedProducts();
    revalidatePath("/uz"); revalidatePath("/ru");
    await reply(chatId, "✅ Standart mahsulotlar yuklandi.");
    return NextResponse.json({ ok: true });
  }

  if (text === "/admins") {
    if (!isSuperAdmin) return NextResponse.json({ ok: true });
    const admins = await redis.smembers(ADMINS_KEY);
    const list   = admins.length ? admins.map((id) => `• <code>${id}</code>`).join("\n") : "— yo'q";
    await reply(chatId, `👥 <b>Adminlar:</b>\n\n⭐ <code>${SUPER_ADMIN}</code> (super)\n${list}`);
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/add_admin")) {
    if (!isSuperAdmin) return NextResponse.json({ ok: true });
    const id = text.replace("/add_admin", "").trim();
    if (!id || isNaN(Number(id))) { await reply(chatId, "❌ Format: /add_admin 123456789"); return NextResponse.json({ ok: true }); }
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

  await reply(chatId, "❓ Noma'lum buyruq. /menu yuboring.");
  return NextResponse.json({ ok: true });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function finishCatWiz(chatId: number, catWiz: CatWiz, emoji: string) {
  const cats = await getCategories();
  if (catWiz.editSlug) {
    const idx = cats.findIndex((c) => c.slug === catWiz.editSlug);
    if (idx !== -1) { cats[idx].emoji = emoji; await saveCategories(cats); }
    await delCatWiz(chatId);
    await reply(chatId, "✅ Emoji yangilandi!");
  } else {
    const newCat: Category = {
      slug:   `cat-${Date.now()}`,
      emoji,
      nameUz: catWiz.data.nameUz!,
      nameRu: catWiz.data.nameRu!,
    };
    await saveCategories([...cats, newCat]);
    await delCatWiz(chatId);
    await reply(chatId, `✅ <b>${newCat.emoji} ${newCat.nameUz}</b> kategoriyasi qo'shildi!`);
  }
}

async function saveProduct(chatId: number, wiz: WizState, imageUrl: string) {
  const { nameUz, nameRu, price, category, descUz, descRu, badge } = wiz.data;
  const existing = await getProducts();
  const id       = existing.length > 0 ? Math.max(...existing.map((p) => p.id)) + 1 : 1;
  const product: Product = {
    id,
    slug:       `product-${id}`,
    nameUz:     nameUz!,
    nameRu:     nameRu!,
    descUz:     descUz!,
    descRu:     descRu!,
    longDescUz: descUz!,
    longDescRu: descRu!,
    price:      price!,
    category:   category as Product["category"],
    badge:      (badge === "popular" || badge === "new" ? badge : null) as Product["badge"],
    image:      imageUrl,
  };
  await addProduct(product);
  await delWiz(chatId);
  revalidatePath("/uz"); revalidatePath("/ru");
  await reply(chatId,
    `✅ <b>${nameUz}</b> qo'shildi!\n\n💰 ${price!.toLocaleString()} so'm | 📂 ${category} | 🖼 ${imageUrl ? "Rasm bor" : "Rasmsiz"}`
  );
}
