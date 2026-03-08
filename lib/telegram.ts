export interface CartItemData {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderData {
  name: string;
  phone: string;
  items: CartItemData[];
  address: string;
  entrance?: string;
  floor?: string;
  apartment?: string;
  intercom?: string;
  note?: string;
  locale: string;
}

function fmt(n: number) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export async function sendOrderToTelegram(order: OrderData) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  if (!BOT_TOKEN || !CHAT_ID) {
    throw new Error("Telegram config missing");
  }

  const total = order.items.reduce((s, i) => s + i.price * i.quantity, 0);

  const itemLines = order.items
    .map((i) => `▪️ ${i.name} × ${i.quantity} — <b>${fmt(i.price * i.quantity)} so'm</b>`)
    .join("\n");

  const addressParts = [
    order.address,
    order.entrance  ? `пд. ${order.entrance}` : null,
    order.floor     ? `эт. ${order.floor}`    : null,
    order.apartment ? `кв. ${order.apartment}` : null,
    order.intercom  ? `дом. ${order.intercom}` : null,
  ].filter(Boolean).join(", ");

  const time = new Date().toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

  const message = `🛍 <b>YANGI BUYURTMA</b>

👤 <b>Mijoz:</b> ${order.name}
📞 <b>Telefon:</b> <code>${order.phone}</code>

🎂 <b>Buyurtma:</b>
${itemLines}

💰 <b>Jami: ${fmt(total)} so'm</b>

📍 <b>Manzil:</b> ${addressParts}${order.note ? `\n💬 <b>Izoh:</b> ${order.note}` : ""}

⏰ ${time}`;

  const res = await fetch(
    `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: "HTML",
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error: ${err}`);
  }

  return res.json();
}
