// import llmstxtPlugin from 'vitepress-plugin-llmstxt'
// Temporary use of local plugin until upstream is fixed
import llmstxtPlugin from "./plugins/vitepress-plugin-llmstxt/src/index.ts"

/**
 * Dovecot custom VitePress LLM Plugin wrapping `vitepress-plugin-llmstxt`
 * with rewrite resolution, URL path normalization, and HTML-to-MD conversion
 * for build-time data.
 */
export function dovecotVitepressLlmPlugin(options = {}) {
	return [
		llmstxtPlugin({
			...options,
			llmsFile: {
				indexTOC: "only-llms",
			},
			watch: true,
			transform: async ({ page, vpConfig, utils }) => {
				return options.transform
					? await options.transform({ page, vpConfig, utils })
					: page
			},
		}),
	]
}
