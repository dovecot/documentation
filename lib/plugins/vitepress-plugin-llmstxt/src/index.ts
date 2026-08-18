import {
	createTransformUtils,
	getPagesData,
} from './pages'
import {
	ensureDir,
	joinUrl,
	join,
	dirname,
	writeFile,
	overrideFrontmatter,
	PLUGIN_NAME,
	log,
} from './utils'

import type {
	LlmsClientConfig,
	LlmsConfig,
	LlmsPageData,
	VitePlugin,
	VPConfig,
} from './types'

export type {
	LlmsConfig,
}

/**
 * Injects LLM-specific page data into the VitePress theme configuration.
 *
 * This enables client-side components to access metadata about available LLM-optimized
 * pages, allowing for dynamic features like automatic menus or LLM-version links.
 *
 * @param   {LlmsPageData[] | undefined} data       - The collection of page data.
 * @param   {VPConfig}                   [vpConfig] - The VitePress configuration object.
 * @returns {void}
 */
const addVPConfigLllmData = ( data: LlmsPageData[] | undefined, vpConfig?: VPConfig ) => {

	if ( !vpConfig ) return

	const config: LlmsClientConfig = {
		pageData : data?.map( d => ( {
			path   : d.path,
			url    : d.url,
			llmUrl : d.llmUrl,
		} ) ),
	}

	vpConfig.site.themeConfig.llmstxt = config

}

/**
 * [VitePress](http://vitepress.dev/) plugin for generating "llms.txt" files automatically
 *
 * @param   {LlmsConfig} [config] - Plugin configuration
 * @returns {VitePlugin}          - Vite plugin
 * @see https://github.com/angelespejo/vitepress-plugin-llmstxt
 * @see https://llmstxt.org/
 */
export const llmstxtPlugin = ( config?: LlmsConfig ): VitePlugin => {

	const {
		llmsFullFile = true,
		llmsFile = true,
		mdFiles = true,
		hostname = '/',
		dynamicRoutes = true,
		watch = false,
	} = config || {}

	const c = {
		...config,
		dynamicRoutes,
		llmsFullFile,
		llmsFile,
		mdFiles,
		hostname,
		watch,
	}

	let vpConfig: VPConfig | undefined = undefined,
		data: LlmsPageData[] | undefined = undefined

	return {
		name : PLUGIN_NAME,

		/**
		 * **ALERT:**
		 * Do not add 'enforce' because it gives unexpected errors with other plugins and alters the order of these plugins
		 * Tested at vitepress@1.6.3 and vue@3.5.18
		 */

		// enforce : 'pre',

		/**
		 * Called when a watched file changes during development.
		 */

		watchChange : async path => {

			if ( !vpConfig ) return
			if ( !c.watch ) return
			if ( !( path.endsWith( '.md' ) || path.endsWith( '.txt' ) ) ) return

			// console.log( 'watchChange' )
			data = await getPagesData(
				c,
				vpConfig,
			)
			addVPConfigLllmData( data, vpConfig )

		},

		/**
		 * Configures the Vite dev server middleware.
		 * Adds support to serve `.txt` and `.md` files dynamically for matched routes.
		 */

		async configureServer( server ) {

			server.middlewares.use( async ( req, res, next ) => {

				const urlPath = req?.url

				if ( !urlPath || !( urlPath.endsWith( '.txt' ) || urlPath.endsWith( '.md' ) ) ) return next()

				const url = await ( async () => ( new URL( joinUrl( server.resolvedUrls?.local[0] || 'localhost', urlPath ) ) ) )().catch( undefined )
				if ( !url ) return next()

				try {

					// Data computed lazily on first llms route request.
					if ( !data ) {

						// console.log( 'configureServer' )
						data = await getPagesData(
							c,
							vpConfig,
						)
						addVPConfigLllmData( data, vpConfig )

					}

					for ( const d of data ) {

						const llmRoute = [
							join( '/', d.path ),
							join( '/', d.path, 'index.md' ),
							join( '/', d.path + '.md' ),
							join( '/', d.path + '.html' ),
							join( '/', d.path + '.html', 'index.md' ),
						]

						if ( llmRoute.includes( url.pathname ) ) {

							let page: LlmsPageData = {
								...d,
								frontmatter : { ...d.frontmatter },
							}

							if ( c.transform ) {

								const utils = createTransformUtils( data, c, vpConfig )
								const tRes  = await c.transform( {
									page,
									pages : data,
									vpConfig,
									utils,
								} )
								if ( tRes ) page = tRes

							}

							const content = overrideFrontmatter( page.content, page.frontmatter )

							res.setHeader( 'Content-Type', 'text/markdown' )
							res.end( content )
							// log.info( `Serving ${url.pathname}` )
							return

						}

					}

				}
				catch ( e ) {

					log.warn( e instanceof Error ? e.message : 'Unexpected error' )

				}
				next()

			} )

		},
		/**
		 * Called once the final Vite config is resolved.
		 *
		 * This hook is used to attach a `buildEnd` hook dynamically to the VitePress config,
		 * which will generate static `.md` files for all collected LLM routes.
		 *
		 */

		async configResolved( params ) {

			if ( vpConfig ) return
			vpConfig = 'vitepress' in params ? params.vitepress as VPConfig : undefined
			if ( !vpConfig ) return

			//////////////////////////////////////////////////////////////////////////////////////////////////
			// WARNING: Maintain this block empty.
			//////////////////////////////////////////////////////////////////////////////////////////////////
			// Code execution here occurs prior to buildEnd, which can lead to:
			// - Plugin conflicts and unexpected build behavior.
			// - Unnecessary inflation of the final bundle size.
			//////////////////////////////////////////////////////////////////////////////////////////////////

			const selfBuildEnd = vpConfig.buildEnd

			vpConfig.buildEnd = async siteConfig => {

				await selfBuildEnd?.( siteConfig )

				// Data loaded lazily — compute if not already done by configureServer
				if ( !data ) {

					// console.log( 'buildEnd' )
					data = await getPagesData(
						c,
						vpConfig,
					)
					addVPConfigLllmData( data, siteConfig )

				}

				// Transform runs ONCE here — HTML files exist now, after selfBuildEnd.
				if ( c.transform ) {

					const utils = createTransformUtils( data, c, siteConfig )

					for ( let i = 0; i < data.length; i++ ) {

						const tRes = await c.transform( {
							page     : data[i],
							pages    : data,
							vpConfig : siteConfig,
							utils,
						} )
						if ( tRes ) data[i] = tRes

					}

				}

				// Embed frontmatter into content after transform
				for ( const page of data ) {

					page.content = overrideFrontmatter( page.content, page.frontmatter )

				}

				const outDir = siteConfig.outDir

				for ( const page of data ) {

					const dir = join( outDir, dirname( page.path ) )

					await ensureDir( dir )
					await writeFile( join( outDir, page.path ), page.content, 'utf-8' )

				}

				log.success( 'LLM routes builded susccesfully ✨' )

			}

		},

	}

}

export default llmstxtPlugin
