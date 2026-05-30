import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Phase 1: locale is hardcoded to EN.
  // Will become dynamic in Iter 1 when ES/RU support is activated.
  const locale = "en";
  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
