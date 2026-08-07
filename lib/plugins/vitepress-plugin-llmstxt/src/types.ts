/* eslint-disable jsdoc/check-param-names */

import type {
	ContentData,
	SiteConfig,
	UserConfig,
} from 'vitepress'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Any = any

export type PageData = ContentData
export type VitePlugin = NonNullable<NonNullable<UserConfig['vite']>['plugins']>[number]
export type VPConfig = SiteConfig
export type IndexTOC = boolean | 'only-llms' | 'only-llms-links' | 'only-web' | 'only-web-links'

export type LlmsPageData = {
	/** The relative file path of the page. */
	path        : string
	/** The website URL of the page. */
	url         : string
	/** The title of the page. */
	title       : string
	/** The specific LLM-optimized URL for the page. */
	llmUrl      : string
	/** A record containing the frontmatter metadata. */
	frontmatter : Record<string, Any>
	/** The raw content of the page. */
	content     : string
}

export type LlmsClientPageData = {
	/** The relative file path of the page. */
	path   : string
	/** The website URL of the page. */
	url    : string
	/** The specific LLM-optimized URL for the page. */
	llmUrl : string
}

export type LlmsClientConfig = {
	/** Collection of page data to be exposed to the client. */
	pageData? : LlmsClientPageData[]
}

export type LlmsConfig = {
	/**
	 * Hostname
	 *
	 * @example 'https://example.org'
	 */
	hostname? : string
	/**
	 * An array of glob patterns to ignore.
	 *
	 * @example ["**\/guide/api.md"]
	 */
	ignore?   : string[]
	/**
	 * Build `llms.txt` file
	 *
	 * @default true
	 */
	llmsFile?: boolean | {
		/**
		 * Add index table of content in index 'llms.txt' file.
		 * - _'only-llms'_ - Only title with LLMs links
		 * - _'only-web'_ - Only title with web links
		 * - _'only-llms-links'_ - Only LLMs links
		 * - _'only-web-links'_ - Only web links
		 * - _true_ - both
		 * - _false_ - none
		 */
		indexTOC : IndexTOC
	}
	/**
	 * Support dynamic routes
	 *
	 * @default true
	 * @see https://vitepress.dev/guide/routing#dynamic-routes
	 */
	dynamicRoutes? : boolean
	/**
	 * Build `llms-full.txt` file
	 *
	 * @default true
	 */
	llmsFullFile?  : boolean
	/**
	 * Build `.md` file for each route
	 *
	 * @default true
	 */
	mdFiles?       : boolean
	/**
	 * Watch for changes in pages in development mode
	 * If set to true, llms files will be recompiled on changes in pages
	 *
	 * @default false
	 */
	watch?         : boolean
	/**
	 * Transformation hook for processing page data.
	 *
	 * @param   {object}                             data - The context object containing page information and utilities.
	 * @returns {Promise<LlmsPageData>|LlmsPageData}      The processed page data or a promise that resolves to it.
	 * @example
	 * transform: async ({{ page, utils }}) => {
	 *   // Remove frontmatter from llms-full.txt
	 *   if (page.path === '/llms-full.txt') {
	 *     page.content = utils.removeFrontmatter(page.content);
	 *   }
	 *   return page;
	 * }
	 */
	transform? : ( data: {
		/**
		 * The data of the current page being processed.
		 */
		page : LlmsPageData

		/**
		 * An array containing the data of all pages in the project.
		 */
		pages : LlmsPageData[]

		/**
		 * The active VitePress configuration object, if available.
		 */
		vpConfig? : VPConfig

		/**
		 * Helper functions for content processing and generation.
		 */
		utils     : {
			/**
			 * Generates a Table of Contents (TOC) formatted as a string for the specified index type.
			 *
			 * @param   {IndexTOC} type - The type of Table of Contents to generate.
			 * @returns {string}        The generated TOC in Markdown or HTML format.
			 */
			getIndexTOC : ( type: IndexTOC ) => string

			/**
			 * Strips the YAML frontmatter block from the beginning of a Markdown string.
			 *
			 * @param   {string} content - The raw Markdown content.
			 * @returns {string}         The content with the frontmatter removed.
			 */
			removeFrontmatter : ( content: string ) => string
		}
	} ) => Promise<LlmsPageData> | LlmsPageData
}
