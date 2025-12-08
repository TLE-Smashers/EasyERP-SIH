import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  // Try to read `locale` cookie (set by client toggle). Fallback to 'en'.
  let locale = "en";

  try {
    const cookieStore = await cookies();
    const c = cookieStore.get("locale") || cookieStore.get("NEXT_LOCALE");
    if (c && typeof c.value === "string") locale = c.value;
  } catch (e) {
    // ignore and fallback
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});