import { defaultLocale, isLocale, type Locale } from "./config";

/**
 * Copy for the 404 and error screens. Those boundaries receive no route params,
 * so they read the locale from the URL and use this small table instead of the
 * full dictionary.
 */
export const errorCopy: Record<
  Locale,
  { notFoundTitle: string; notFoundBody: string; errorTitle: string; errorBody: string; retry: string; home: string }
> = {
  en: {
    notFoundTitle: "Page not found",
    notFoundBody: "This page does not exist or has moved. Everything about the Games is on the home page.",
    errorTitle: "Something went wrong",
    errorBody: "This page could not load. Please try again in a moment.",
    retry: "Try again",
    home: "Go to the home page",
  },
  pt: {
    notFoundTitle: "Página não encontrada",
    notFoundBody: "Esta página não existe ou foi movida. Tudo sobre os Jogos está na página inicial.",
    errorTitle: "Algo correu mal",
    errorBody: "Não foi possível carregar esta página. Tente novamente dentro de momentos.",
    retry: "Tentar novamente",
    home: "Ir para a página inicial",
  },
};

export function localeFromPath(pathname: string | null): Locale {
  const first = pathname?.split("/")[1] ?? "";
  return isLocale(first) ? first : defaultLocale;
}
