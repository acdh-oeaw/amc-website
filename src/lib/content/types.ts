import type { Entry } from "@keystatic/core/reader";

import type config from "~/keystatic.config";

export type IndexPage = Entry<(typeof config)["singletons"]["indexPage"]>;

export type MediaListPage = Entry<(typeof config)["singletons"]["mediaListPage"]>;

export type Metadata = Entry<(typeof config)["singletons"]["metadata"]>;

export type Navigation = Entry<(typeof config)["singletons"]["navigation"]>;

export type Page = Entry<(typeof config)["collections"]["pages"]>;
