import { expect, test } from "~/e2e/lib/test";

test.describe("imprint page", () => {
	test("should have document title", async ({ createImprintPage }) => {
		const { i18n, imprintPage } = await createImprintPage();
		await imprintPage.goto();

		await expect(imprintPage.page).toHaveTitle(
			[i18n.t("ImprintPage.meta.title"), i18n.t("metadata.title")].join(" | "),
		);
	});

	test("should have imprint text", async ({ createImprintPage }) => {
		const { imprintPage } = await createImprintPage();
		await imprintPage.goto();

		await expect(imprintPage.page.getByRole("main")).toContainText("Offenlegung");
	});

	test("should not have any automatically detectable accessibility issues", async ({
		createAccessibilityScanner,
		createImprintPage,
	}) => {
		const { imprintPage } = await createImprintPage();
		await imprintPage.goto();

		const { getViolations } = await createAccessibilityScanner();
		expect(await getViolations()).toEqual([]);
	});

	/*
	test("should not have visible changes", async ({ createImprintPage }) => {
		const { imprintPage } = await createImprintPage();
		await imprintPage.goto();

		await expect(imprintPage.page).toHaveScreenshot();
	});
	 */
});
