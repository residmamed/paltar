import { getRequestConfig } from "next-intl/server";

// Single-locale setup (Azerbaijani), no URL-prefix routing. If more locales are
// added later, switch to next-intl's routing-based configuration.
export const locale = "az";

export default getRequestConfig(async () => {
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
