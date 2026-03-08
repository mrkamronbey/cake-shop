import { getRequestConfig } from "next-intl/server";
import uzMessages from "../messages/uz.json";
import ruMessages from "../messages/ru.json";

const allMessages: Record<string, Record<string, unknown>> = {
  uz: uzMessages as unknown as Record<string, unknown>,
  ru: ruMessages as unknown as Record<string, unknown>,
};

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = (await requestLocale) || "uz";
  return {
    locale,
    messages: allMessages[locale] ?? allMessages.uz,
  };
});
