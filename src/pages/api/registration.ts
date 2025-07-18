import { join } from "node:path";

import { getFormDataValues, isoDate, log } from "@acdh-oeaw/lib";
import type { APIContext } from "astro";
import PDFDocument from "pdfkit";
import * as v from "valibot";

import { sendEmail } from "@/lib/email";

export const prerender = false;

const RegistrationFormSchema = v.pipe(
	v.object({
		"first-name": v.pipe(v.string(), v.nonEmpty()),
		"last-name": v.pipe(v.string(), v.nonEmpty()),
		email: v.pipe(v.string(), v.email()),
		affiliation: v.pipe(v.string(), v.nonEmpty()),
		renewal: v.picklist(["yes", "no"]),
		"research-type": v.picklist([
			"(Pro-)Seminarabeit",
			"Bachelor- oder Masterarbeit",
			"Dissertation oder Habilitationsschrift",
			"Forschungsprojekt",
			"other",
		]),
		"research-type-other": v.optional(v.pipe(v.string(), v.nonEmpty())),
		funding: v.picklist(["no", "other"]),
		"funding-other": v.optional(v.pipe(v.string(), v.nonEmpty())),
		"short-title": v.pipe(v.string(), v.nonEmpty()),
		description: v.pipe(v.string(), v.nonEmpty()),
		duration: v.pipe(v.string(), v.nonEmpty()),
		publication: v.picklist(["no", "other"]),
		"publication-other": v.optional(v.pipe(v.string(), v.nonEmpty())),
		ai: v.picklist(["no", "other"]),
		"ai-other": v.optional(v.pipe(v.string(), v.nonEmpty())),
		"terms-and-conditions": v.literal("on"),
		"data-consent": v.literal("on"),
	}),
	v.check((input) => {
		if (input.ai === "other" && input["ai-other"] == null) return false;
		if (input.funding === "other" && input["funding-other"] == null) return false;
		if (input.publication === "other" && input["publication-other"] == null) return false;
		if (input["research-type"] === "other" && input["research-type-other"] == null) return false;
		return true;
	}),
	v.transform((data) => {
		return {
			firstName: data["first-name"],
			lastName: data["last-name"],
			email: data.email,
			affiliation: data.affiliation,
			renewal: data.renewal === "no" ? "Nein" : "Ja",
			researchType:
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				data["research-type"] === "other" ? data["research-type-other"]! : data["research-type"],
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			funding: data.funding === "other" ? data["funding-other"]! : "Nein",
			shortTitle: data["short-title"],
			description: data.description,
			duration: data.duration,
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			publication: data.publication === "other" ? data["publication-other"]! : "Nein",
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			ai: data.ai === "other" ? data["ai-other"]! : "Nein",
			termsAndConditions: true,
			dataConsent: true,
			date: isoDate(new Date()),
		};
	}),
);

type RegistrationFormSchema = v.InferOutput<typeof RegistrationFormSchema>;

const dateTime = new Intl.DateTimeFormat("de", { dateStyle: "medium" });

export async function POST(context: APIContext) {
	const formData = await context.request.formData();

	const result = await v.safeParseAsync(RegistrationFormSchema, getFormDataValues(formData));

	if (!result.success) {
		return Response.json({ message: "Invalid input." }, { status: 400 });
	}

	const submission = result.output;
	// filenames: add lastname + date and make sure filename does not contain \s or '
	const suffix = [submission.lastName.toLowerCase().replace(/[\s']+/g, "_"), submission.date].join(
		"_",
	);

	try {
		const subject = `[AMC website] registration form submission ${submission.lastName}`;
		const message =
			"Dear maintainer,\n\nplease find attached details about a new request for AMC access permissions in json and pdf formats.\n\nBest,\nAMC website.";

		await sendEmail({
			from: submission.email,
			subject,
			text: message,
			attachments: [
				{
					filename: `amc-registration-form-${suffix}.json`,
					content: JSON.stringify(submission, null, 2),
				},
				{
					filename: `amc-registration-form-${suffix}.pdf`,
					content: await createPdf(submission),
				},
			],
		});

		return context.redirect("/success", 303);
	} catch (error) {
		log.error(error);

		return Response.json({ message: "Failed to send message." }, { status: 500 });
	}
}

//

function createPdf(submission: RegistrationFormSchema): Promise<Buffer> {
	const date = dateTime.format(new Date(submission.date));

	return new Promise((resolve, reject) => {
		const pdf = new PDFDocument();

		const chunks: Array<Buffer> = [];

		pdf.on("data", (chunk: Buffer) => {
			chunks.push(chunk);
		});

		pdf.on("end", () => {
			resolve(Buffer.concat(chunks));
		});

		pdf.on("error", (error: Error) => {
			reject(error);
		});

		pdf.image(join(process.cwd(), "./public/assets/images/amc-logo.png"), 20, 20, { height: 50 });

		pdf.fontSize(16).text(`Antrag auf Nutzung des amc: ${submission.lastName} - ${date}`, 25, 125);

		pdf.fontSize(12).text("\n\n1. Allgemeines\n\n");

		pdf
			.fontSize(10)
			.text(
				"Dieser Antrag zur Nutzung des austrian media corpus erfolgt auf Basis der Kooperationsvereinbarung zwischen der Österreichischen Akademie der Wissenschaften und der APA Austria Presseagentur (aktuelle Fassung: Version 4.0 vom 1.12.2023).Der Antrag wurde von Seiten des Austrian Centre for Digital Humanities (ACDH) geprüft und befürwortet.",
			);

		pdf.fontSize(12).text("\n\n2. Antrag\n\n");

		pdf
			.fontSize(10)
			.text(
				[
					`Vorname: ${submission.firstName}`,
					`Familienname: ${submission.lastName}`,
					`Email: ${submission.email}`,
					`Affiliation: ${submission.affiliation}`,
					"",
					`Verlängerungsantrag für eine bestehende Registrierung: ${submission.renewal}`,
					`Art des Forschungsvorhabens: ${submission.researchType}`,
					`Gefördertes Projekt: ${submission.funding}`,
					`Kurztitel des Forschungsvorhabens: ${submission.shortTitle}`,
					`Beschreibung des Forschungsvorhabens: ${submission.description}`,
					"",
					`Publikation geplant: ${submission.publication}`,
					`KI-Modelle verwendet: ${submission.ai}`,
					`Nutzungsbedingungen mit Fassung 21.1.2021 akzeptiert: Ja`,
					`Ausdrückliche Zustimmung zur Datenspeicherung erteilt: Ja`,
					`Vorgesehene Laufzeit des Forschungsvorhabens: ${submission.duration}`,
					`Datum der Antragstellung: ${date}`,
					"",
					"Die Zugangsberechtigung wird für einen Zeitraum von 6 Monaten ab dem Datum der Bewilligung vergeben.",
				].join("\n"),
			);

		pdf
			.fontSize(8)
			.text("\n\nAustrian Centre for Digital Humanities - ACDH\nContact: info@acdh.oeaw.ac.at\n");

		pdf.end();
	});
}
