import { getFormDataValues, log } from "@acdh-oeaw/lib";
import type { APIContext } from "astro";
import * as v from "valibot";

import { sendEmail } from "@/lib/email";

// TODO: refine: check required "other" values
const RegistrationFormSchema = v.object({
	"first-name": v.string([v.minLength(1)]),
	"last-name": v.string([v.minLength(1)]),
	email: v.string([v.email()]),
	affiliation: v.string([v.minLength(1)]),
	renewal: v.picklist(["yes", "no"]),
	"research-type": v.picklist([
		"(Pro-)Seminarabeit",
		"Bachelor- oder Masterarbeit",
		"Dissertation oder Habilitationsschrift",
		"Forschungsprojekt",
		"other",
	]),
	"research-type-other": v.optional(v.string([v.minLength(1)])),
	funding: v.picklist(["no", "other"]),
	"funding-other": v.optional(v.string([v.minLength(1)])),
	"short-title": v.string([v.minLength(1)]),
	description: v.string([v.minLength(1)]),
	duration: v.string([v.minLength(1)]),
	publication: v.picklist(["no", "other"]),
	"publication-other": v.optional(v.string([v.minLength(1)])),
	ai: v.picklist(["no", "other"]),
	"ai-other": v.optional(v.string([v.minLength(1)])),
	"terms-and-conditions": v.literal("on"),
	"data-consent": v.literal("on"),
});

export async function POST(context: APIContext) {
	const formData = await context.request.formData();

	const result = await v.safeParseAsync(RegistrationFormSchema, getFormDataValues(formData));

	if (!result.success) {
		return Response.json({ message: "Invalid input." }, { status: 400 });
	}

	const data = result.output;
	const subject = "[AMC website] registriation form submission";
	const message = JSON.stringify(
		{
			firstName: data["first-name"],
			lastName: data["last-name"],
			email: data.email,
			affiliation: data.affiliation,
			renewal: data.renewal,
			researchType:
				data["research-type"] === "other" ? data["research-type-other"] : data["research-type"],
			funding: data.funding === "other" ? data["funding-other"] : data.funding,
			shortTitle: data["short-title"],
			description: data.description,
			duration: data.duration,
			publication: data.publication === "other" ? data["publication-other"] : data.publication,
			ai: data.ai === "other" ? data["ai-other"] : data.ai,
			termsAndConditions: true,
			dataConsent: true,
		},
		null,
		2,
	);

	try {
		await sendEmail({
			from: data.email,
			subject,
			text: message,
		});
		return context.redirect("/success", 303);
	} catch (error) {
		log.error(error);
		return Response.json({ message: "Failed to send message." }, { status: 500 });
	}
}

export const prerender = false;
