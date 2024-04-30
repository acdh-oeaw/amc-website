import type { IntlMessages, Locale } from "@/config/i18n.config";

export async function getIntlMessages(locale: Locale): Promise<IntlMessages> {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
	const messages = await import(`../messages/${locale}.json`);
	const metadata = await import(`../../content/metadata.json`);
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	return { metadata, ...messages };
}
