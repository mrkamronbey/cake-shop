import { NextResponse } from "next/server";

const TOKEN = process.env.ADMIN_BOT_TOKEN!;

export async function GET() {
  const commands = [
    { command: "start",        description: "Botni ishga tushirish" },
    { command: "help",         description: "Barcha buyruqlar ro'yxati" },
    { command: "list",         description: "Mahsulotlar ro'yxatini ko'rish" },
    { command: "add",          description: "Yangi mahsulot qo'shish" },
    { command: "delete",       description: "Mahsulot o'chirish (slug orqali)" },
    { command: "seed",         description: "Standart mahsulotlarni yuklash" },
    { command: "admins",       description: "Adminlar ro'yxati" },
    { command: "add_admin",    description: "Yangi admin qo'shish (ID orqali)" },
    { command: "remove_admin", description: "Adminni o'chirish (ID orqali)" },
    { command: "myid",         description: "Telegram ID'ingizni ko'rish" },
  ];

  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/setMyCommands`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ commands }),
  });

  const data = await res.json();

  if (data.ok) {
    return NextResponse.json({ ok: true, message: "Commands muvaffaqiyatli o'rnatildi ✅" });
  } else {
    return NextResponse.json({ ok: false, error: data }, { status: 500 });
  }
}
