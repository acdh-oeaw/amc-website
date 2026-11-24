import { log } from "@acdh-oeaw/lib";
import { createEnv, ValidationError } from "@acdh-oeaw/validate-env/astro";
import * as v from "valibot";

// Only public values are compiled into the bundle. Private values and validation
// settings must come from the environment of the running server.
const environment: Record<string, unknown> = {
	...(import.meta.env.SSR ? process.env : {}),
	PUBLIC_APP_BASE_PATH: import.meta.env.PUBLIC_APP_BASE_PATH,
	PUBLIC_APP_BASE_URL: import.meta.env.PUBLIC_APP_BASE_URL,
	PUBLIC_BOTS: import.meta.env.PUBLIC_BOTS,
	PUBLIC_GOOGLE_SITE_VERIFICATION: import.meta.env.PUBLIC_GOOGLE_SITE_VERIFICATION,
	PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: import.meta.env.PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
	PUBLIC_KEYSTATIC_GITHUB_REPO_NAME: import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO_NAME,
	PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER: import.meta.env.PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER,
	PUBLIC_KEYSTATIC_MODE: import.meta.env.PUBLIC_KEYSTATIC_MODE,
	PUBLIC_MATOMO_BASE_URL: import.meta.env.PUBLIC_MATOMO_BASE_URL,
	PUBLIC_MATOMO_ID: import.meta.env.PUBLIC_MATOMO_ID,
	PUBLIC_REDMINE_ID: import.meta.env.PUBLIC_REDMINE_ID,
};

export const env = createEnv({
	environment,
	isClient: !import.meta.env.SSR,
	schemas: {
		system(input) {
			const Schema = v.object({
				NODE_ENV: v.optional(v.picklist(["development", "production", "test"]), "production"),
			});
			return parseEnvironment(Schema, input);
		},
		private(input) {
			const Schema = v.object({
				EMAIL_CONTACT_ADDRESS: v.optional(v.pipe(v.string(), v.email())),
				EMAIL_CONTACT_ADDRESS_BCC: v.optional(v.pipe(v.string(), v.email())),
				EMAIL_SMTP_PORT: v.optional(
					v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1)),
				),
				EMAIL_SMTP_SERVER: v.optional(v.pipe(v.string(), v.nonEmpty())),
				EMAIL_SMTP_USERNAME: v.optional(v.pipe(v.string(), v.nonEmpty())),
				EMAIL_SMTP_PASSWORD: v.optional(v.pipe(v.string(), v.nonEmpty())),
				KEYSTATIC_GITHUB_CLIENT_ID: v.optional(v.pipe(v.string(), v.nonEmpty())),
				KEYSTATIC_GITHUB_CLIENT_SECRET: v.optional(v.pipe(v.string(), v.nonEmpty())),
				KEYSTATIC_SECRET: v.optional(v.pipe(v.string(), v.nonEmpty())),
			});
			return parseEnvironment(Schema, input);
		},
		public(input) {
			const Schema = v.object({
				PUBLIC_APP_BASE_PATH: v.optional(v.pipe(v.string(), v.nonEmpty())),
				PUBLIC_APP_BASE_URL: v.pipe(v.string(), v.url()),
				PUBLIC_BOTS: v.optional(v.picklist(["disabled", "enabled"]), "disabled"),
				PUBLIC_GOOGLE_SITE_VERIFICATION: v.optional(v.string()),
				PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: v.optional(v.pipe(v.string(), v.nonEmpty())),
				PUBLIC_KEYSTATIC_GITHUB_REPO_NAME: v.optional(v.pipe(v.string(), v.nonEmpty())),
				PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER: v.optional(v.pipe(v.string(), v.nonEmpty())),
				PUBLIC_KEYSTATIC_MODE: v.optional(v.picklist(["github", "local"]), "local"),
				PUBLIC_MATOMO_BASE_URL: v.optional(v.pipe(v.string(), v.url())),
				PUBLIC_MATOMO_ID: v.optional(
					v.pipe(v.string(), v.transform(Number), v.number(), v.integer(), v.minValue(1)),
				),
				PUBLIC_REDMINE_ID: v.pipe(
					v.string(),
					v.transform(Number),
					v.number(),
					v.integer(),
					v.minValue(1),
				),
			});
			return parseEnvironment(Schema, input);
		},
	},
	validation: v.parse(
		v.optional(v.picklist(["disabled", "enabled", "public"]), "enabled"),
		environment.ENV_VALIDATION,
	),
});

function parseEnvironment<TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>(
	schema: TSchema,
	input: unknown,
): v.InferOutput<TSchema> {
	try {
		return v.parse(schema, input);
	} catch (error) {
		if (error instanceof v.ValiError) {
			const message = "Invalid environment variables";
			log.error(`${message}:`, v.flatten(error.issues).nested);
			const validationError = new ValidationError(message, { cause: error });
			delete validationError.stack;
			throw validationError;
		}
		throw error;
	}
}
