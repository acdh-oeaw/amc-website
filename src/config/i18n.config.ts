import type de from "@/messages/de.json";
import type metadataDe from "~/content/metadata.json";

export const locales = ["de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "de";

export function isValidLocale(value: string): value is Locale {
	return locales.includes(value as Locale);
}

export type IntlMessages = typeof de & { metadata: typeof metadataDe };

export interface Translations extends Record<Locale, IntlMessages> {
	de: typeof de & { metadata: typeof metadataDe };
}
