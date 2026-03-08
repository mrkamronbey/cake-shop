import { sendOrderToTelegram } from "@/lib/telegram";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, items, address, entrance, floor, apartment, intercom, note, locale } = body;

    if (!name || !phone || !address || !items?.length) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    await sendOrderToTelegram({ name, phone, items, address, entrance, floor, apartment, intercom, note, locale });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Order error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
