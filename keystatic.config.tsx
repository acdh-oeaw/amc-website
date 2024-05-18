import { pick } from "@acdh-oeaw/lib";
import { collection, config, fields, singleton } from "@keystatic/core";
import { block, mark, wrapper } from "@keystatic/core/content-components";
import { DownloadIcon, ImageIcon, LinkIcon, ListIcon } from "lucide-react";

import { Logo } from "@/components/logo";
import { createAssetPaths, createPreviewUrl } from "@/config/content.config";
import { env } from "@/config/env.config";

function createComponents(
	assetPath: `/${string}/`,
	components?: Array<"Download" | "Figure" | "LinkButton">,
) {
	const allComponents = {
		Download: mark({
			label: "Download",
			// description: "A link to an uploaded file.",
			tag: "a",
			className: "underline decoration-dotted",
			icon: <DownloadIcon />,
			schema: {
				href: fields.file({
					label: "File",
					...createAssetPaths(assetPath),
					validation: { isRequired: true },
				}),
			},
		}),
		Figure: wrapper({
			label: "Figure",
			description: "An image with caption.",
			icon: <ImageIcon />,
			schema: {
				href: fields.image({
					label: "Image",
					...createAssetPaths(assetPath),
					validation: { isRequired: true },
				}),
				alt: fields.text({
					label: "Image description for screen readers",
					// validation: { isRequired: false },
				}),
			},
		}),
		LinkButton: block({
			label: "LinkButton",
			description: "A link which looks like a button",
			icon: <LinkIcon />,
			schema: {
				label: fields.text({
					label: "Label",
					validation: { isRequired: true },
				}),
				href: fields.url({
					label: "URL",
					validation: { isRequired: true },
				}),
			},
			ContentView(props) {
				return props.value.label;
			},
		}),
		TableOfContents: block({
			label: "Table of contents",
			description: "Insert a table of contents",
			icon: <ListIcon />,
			schema: {
				title: fields.text({
					label: "Title",
					// validation: { isRequired: false },
				}),
			},
		}),
	};

	if (components == null) return allComponents;

	return pick(allComponents, components);
}

export default config({
	ui: {
		brand: {
			name: "ACDH-CH",
			// @ts-expect-error `ReactNode` is a valid return type.
			mark: Logo,
		},
		navigation: {
			Pages: ["indexPage", "mediaListPage", "pages"],
			Navigation: ["navigation"],
			Settings: ["metadata"],
		},
	},
	storage:
		/**
		 * @see https://keystatic.com/docs/github-mode
		 */
		env.PUBLIC_KEYSTATIC_MODE === "github" &&
		env.PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER &&
		env.PUBLIC_KEYSTATIC_GITHUB_REPO_NAME
			? {
					kind: "github",
					repo: {
						owner: env.PUBLIC_KEYSTATIC_GITHUB_REPO_OWNER,
						name: env.PUBLIC_KEYSTATIC_GITHUB_REPO_NAME,
					},
					branchPrefix: "content/",
				}
			: {
					kind: "local",
				},
	collections: {
		pages: collection({
			label: "Pages",
			path: "./content/pages/**",
			slugField: "title",
			format: { contentField: "content" },
			previewUrl: createPreviewUrl("/{slug}"),
			entryLayout: "content",
			columns: ["title"],
			schema: {
				title: fields.slug({
					name: {
						label: "Title",
						validation: { isRequired: true },
					},
				}),
				image: fields.image({
					label: "Image",
					...createAssetPaths("/content/pages/"),
					// validation: { isRequired: false },
				}),
				content: fields.mdx({
					label: "Content",
					options: {
						image: createAssetPaths("/content/pages/"),
					},
					components: createComponents("/content/pages/"),
				}),
			},
		}),
	},
	singletons: {
		indexPage: singleton({
			label: "Home page",
			path: "./content/index-page/",
			format: { data: "json" },
			entryLayout: "form",
			schema: {
				hero: fields.object(
					{
						title: fields.text({
							label: "Title",
							validation: { isRequired: true },
						}),
						image: fields.image({
							label: "Image",
							...createAssetPaths("/content/index-page/"),
							validation: { isRequired: true },
						}),
						leadIn: fields.text({
							label: "Lead in",
							multiline: true,
							validation: { isRequired: true },
						}),
						links: fields.array(
							fields.object(
								{
									label: fields.text({
										label: "Label",
										validation: { isRequired: true },
									}),
									href: fields.url({
										label: "URL",
										validation: { isRequired: true },
									}),
								},
								{
									label: "Link",
								},
							),
							{
								label: "Links",
								itemLabel(props) {
									return props.fields.label.value;
								},
								validation: { length: { min: 1 } },
							},
						),
					},
					{
						label: "Hero section",
					},
				),
				main: fields.object(
					{
						sections: fields.array(
							fields.object(
								{
									title: fields.text({
										label: "Title",
										validation: { isRequired: true },
									}),
									variant: fields.select({
										label: "Variant",
										options: [
											{
												label: "Fluid",
												value: "fluid",
											},
											{
												label: "Two columns",
												value: "two-columns",
											},
											{
												label: "Three columns",
												value: "three-columns",
											},
											{
												label: "Four columns",
												value: "four-columns",
											},
										],
										defaultValue: "fluid",
									}),
									cards: fields.array(
										fields.object(
											{
												title: fields.text({
													label: "Title",
													validation: { isRequired: true },
												}),
												image: fields.image({
													label: "Image",
													...createAssetPaths("/content/index-page/"),
													validation: { isRequired: true },
												}),
												leadIn: fields.text({
													label: "Lead in",
													multiline: true,
													validation: { isRequired: true },
												}),
												link: fields.object(
													{
														label: fields.text({
															label: "Label",
															validation: { isRequired: true },
														}),
														href: fields.url({
															label: "URL",
															validation: { isRequired: true },
														}),
													},
													{
														label: "Link",
													},
												),
											},
											{
												label: "Card",
											},
										),
										{
											label: "Cards",
											itemLabel(props) {
												return props.fields.title.value;
											},
										},
									),
								},
								{
									label: "Section",
								},
							),
							{
								label: "Sections",
								itemLabel(props) {
									return props.fields.title.value;
								},
							},
						),
					},
					{ label: "Main content" },
				),
			},
		}),
		mediaListPage: singleton({
			label: "Media list page",
			path: "./content/media-list-page/",
			format: { data: "json" },
			entryLayout: "form",
			schema: {
				title: fields.text({
					label: "Title",
					validation: { isRequired: true },
				}),
				image: fields.image({
					label: "Image",
					...createAssetPaths("/content/media-list-page/"),
					// validation: { isRequired: false },
				}),
				content: fields.mdx({
					label: "Content",
					options: {
						image: createAssetPaths("/content/pages/"),
					},
					components: createComponents("/content/pages/"),
				}),
				lists: fields.blocks(
					{
						print: {
							label: "Print",
							schema: fields.object(
								{
									title: fields.text({
										label: "Title",
										validation: { isRequired: true },
									}),
									description: fields.mdx({
										label: "Description",
										options: {
											image: createAssetPaths("/content/media-list-page/"),
										},
										components: createComponents("/content/media-list-page/"),
									}),
									items: fields.array(
										fields.object(
											{
												docsrc: fields.text({
													label: "Kurzname (docsrc)",
													validation: { isRequired: true },
												}),
												docsrc_name: fields.text({
													label: "Vollständige Bezeichnung (docsrc_name)",
													validation: { isRequired: true },
												}),
												sourcetype: fields.select({
													label: "Medientyp (sourcetype)",
													options: [
														{
															label: "Agentur",
															value: "agentur",
														},
														{
															label: "Print",
															value: "print",
														},
														{
															label: "TV",
															value: "tv",
														},
														{
															label: "Radio",
															value: "radio",
														},
														// {
														// 	label: "WWW",
														// 	value: "www",
														// },
													],
													defaultValue: "print",
												}),
												from: fields.text({
													label: "von (year)",
													validation: { isRequired: true },
												}),
												to: fields.text({
													label: "bis (year)",
													// validation: { isRequired: false },
												}),
												region: fields.select({
													label: "Region (region)",
													options: [
														{
															label: "Gesamt",
															value: "agesamt",
														},
														{
															label: "Spezifisch",
															value: "spezifisch",
														},
														{
															label: "Ost",
															value: "aost",
														},
														{
															label: "Südost",
															value: "asuedost",
														},
														{
															label: "Süd",
															value: "asued",
														},
														{
															label: "Mitte",
															value: "amitte",
														},
														{
															label: "West",
															value: "awest",
														},
													],
													defaultValue: "agesamt",
												}),
												province: fields.text({
													label: "Bundesland, nur bei Vbg. und Tirol (province)",
													// validation: { isRequired: false },
												}),
											},
											{
												label: "Item",
											},
										),
										{
											label: "Items",
											itemLabel(props) {
												return props.fields.docsrc.value;
											},
											validation: { length: { min: 1 } },
										},
									),
								},
								{
									label: "List",
								},
							),
							itemLabel(props) {
								return props.fields.title.value;
							},
						},
						web: {
							label: "Web",
							schema: fields.object(
								{
									title: fields.text({
										label: "Title",
										validation: { isRequired: true },
									}),
									description: fields.mdx({
										label: "Description",
										options: {
											image: createAssetPaths("/content/media-list-page/"),
										},
										components: createComponents("/content/media-list-page/"),
									}),
									items: fields.array(
										fields.object(
											{
												wwwsrc: fields.text({
													label: "Kurzname (wwwsrc)",
													validation: { isRequired: true },
												}),
												www: fields.url({
													label: "Web-Adresse",
													validation: { isRequired: true },
												}),
												docsrc: fields.text({
													label: "Kurzname (docsrc)",
													// validation: { isRequired: false },
												}),
												docsrc_name: fields.text({
													label: "Vollständige Bezeichnung (docsrc_name)",
													// validation: { isRequired: false },
												}),
												sourcetype: fields.select({
													label: "Medientyp (sourcetype)",
													options: [
														// {
														// 	label: "Agentur",
														// 	value: "agentur",
														// },
														// {
														// 	label: "Print",
														// 	value: "print",
														// },
														// {
														// 	label: "TV",
														// 	value: "tv",
														// },
														// {
														// 	label: "Radio",
														// 	value: "radio",
														// },
														{
															label: "WWW",
															value: "www",
														},
													],
													defaultValue: "www",
												}),
												from: fields.text({
													label: "von (year)",
													validation: { isRequired: true },
												}),
												to: fields.text({
													label: "bis (year)",
													// validation: { isRequired: false },
												}),
												region: fields.select({
													label: "Region (region)",
													options: [
														{
															label: "Gesamt",
															value: "agesamt",
														},
														{
															label: "Spezifisch",
															value: "spezifisch",
														},
														{
															label: "Ost",
															value: "aost",
														},
														{
															label: "Südost",
															value: "asuedost",
														},
														{
															label: "Süd",
															value: "asued",
														},
														{
															label: "Mitte",
															value: "amitte",
														},
														{
															label: "West",
															value: "awest",
														},
													],
													defaultValue: "agesamt",
												}),
												province: fields.text({
													label: "Bundesland, nur bei Vbg. und Tirol (province)",
													// validation: { isRequired: false },
												}),
											},
											{
												label: "Item",
											},
										),
										{
											label: "Items",
											itemLabel(props) {
												return props.fields.wwwsrc.value;
											},
											validation: { length: { min: 1 } },
										},
									),
								},
								{
									label: "List",
								},
							),
							itemLabel(props) {
								return props.fields.title.value;
							},
						},
					},
					{
						label: "Media lists",
						validation: { length: { min: 1 } },
					},
				),
			},
		}),
		metadata: singleton({
			label: "Metadata",
			path: "./content/metadata",
			format: { data: "json" },
			entryLayout: "form",
			schema: {
				title: fields.text({
					label: "Site title",
					validation: { isRequired: true },
				}),
				shortTitle: fields.text({
					label: "Short site title",
					validation: { isRequired: true },
				}),
				description: fields.text({
					label: "Site description",
					validation: { isRequired: true },
				}),
				twitter: fields.text({
					label: "Twitter handle",
					// validation: { isRequired: false },
				}),
			},
		}),
		navigation: singleton({
			label: "Navigation",
			path: "./content/navigation",
			format: { data: "json" },
			entryLayout: "form",
			schema: {
				links: fields.blocks(
					{
						link: {
							label: "Link",
							itemLabel(props) {
								return props.fields.label.value;
							},
							schema: fields.object({
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								href: fields.url({
									label: "URL",
									validation: { isRequired: true },
								}),
							}),
						},
						menu: {
							label: "Menu",
							itemLabel(props) {
								return props.fields.label.value + " (Menu)";
							},
							schema: fields.object({
								label: fields.text({
									label: "Label",
									validation: { isRequired: true },
								}),
								links: fields.array(
									fields.object(
										{
											label: fields.text({
												label: "Label",
												validation: { isRequired: true },
											}),
											href: fields.url({
												label: "URL",
												validation: { isRequired: true },
											}),
										},
										{
											label: "Link",
										},
									),
									{
										label: "Links",
										itemLabel(props) {
											return props.fields.label.value;
										},
										validation: { length: { min: 1 } },
									},
								),
							}),
						},
					},
					{
						label: "Links",
						validation: { length: { min: 1 } },
					},
				),
			},
		}),
	},
});
