// import llmstxtPlugin from 'vitepress-plugin-llmstxt'
// Temporary use of local plugin until upstream is fixed
import llmstxtPlugin from "./plugins/vitepress-plugin-llmstxt/src/index.ts"

import fs from "fs/promises"
import path from "path"
import { parse } from "node-html-parser"
import TurndownService from "turndown"
import { gfm, tables } from "turndown-plugin-gfm"
import { logger } from "./logger.js"

/**
 * Creates a VitePress HTML-to-Markdown converter.
 */
function createVitepressHtmlToMdConverter() {
	const turndownService = new TurndownService({
		headingStyle: "atx",
		codeBlockStyle: "fenced",
		emDelimiter: "_",
		bulletListMarker: "-",
	}).use([gfm, tables])

	// Strip permalink header anchors (e.g. <a class="header-anchor" href="#...">​</a>)
	turndownService.addRule("removeHeaderAnchors", {
		filter: (node) => node.classList?.contains("header-anchor"),
		replacement: () => "",
	})

	return {
		convertMain(src) {
			const main = parse(src).querySelector("main")
			if (!main) throw new Error("No HTML data")

			main.querySelectorAll(".header-anchor, .VPSkipLink").forEach((el) =>
				el.remove()
			)

			// Ensure <table> elements have <thead> headers so turndown-plugin-gfm
			// converts them
			main.querySelectorAll("table").forEach((table) => {
				if (!table.querySelector("thead")) {
					const firstRow = table.querySelector("tr")
					if (firstRow && !firstRow.querySelector("th")) {
						const cells = firstRow.querySelectorAll("td")
						const thRow = `<thead><tr>${Array.from(cells)
							.map((_, i) => `<th>Key ${i + 1}</th>`)
							.join("")}</tr></thead>`
						table.insertAdjacentHTML("afterbegin", thRow)
					} else if (firstRow && firstRow.querySelector("th")) {
						const thead = `<thead>${firstRow.outerHTML}</thead>`
						firstRow.remove()
						table.insertAdjacentHTML("afterbegin", thead)
					}
				}
			})

			return turndownService.turndown(main.toString())
				.replace(/\u200B/g, "")
				.replace(/\xa0/g, " ")
				.replace(/\n{3,}/g, "\n\n")
				.trim()
		},
	}
}

/**
 * Dovecot custom VitePress LLM Plugin wrapping `vitepress-plugin-llmstxt`
 * with rewrite resolution, URL path normalization, and HTML-to-MD conversion
 * for build-time data.
 */
export function dovecotVitepressLlmPlugin(options = {}) {
	const converter = createVitepressHtmlToMdConverter()

	return [
		llmstxtPlugin({
			...options,
			llmsFile: {
				indexTOC: "only-llms",
			},
			llmsFullFile: {
				source: "pages",
			},
			watch: true,
			transform: async ({ page, pages, vpConfig, utils }) => {
				// Strip non-essential frontmatter — keep only URL, LLMS_URL, title
				const allowed = new Set(["URL", "LLMS_URL", "title"])
				Object.keys(page.frontmatter).forEach((k) => {
					if (!allowed.has(k)) delete page.frontmatter[k]
				})

				if (page.htmlFile) {
					try {
						page.content = converter.convertMain(
							await fs.readFile(page.htmlFile, "utf-8")
						)
					} catch (e) {
						logger.info(`[llm]: could not read HTML for ${page.path}: ${e.message}`)
					}
				}

				return options.transform
					? await options.transform({ page, pages, vpConfig, utils })
					: page
			},
		}),
	]
}
