import { createContentLoader } from 'vitepress'

import {
	joinUrl,
	join,
	removeFrontmatter,
	getMDTitleLine,
	markdownPathToUrlRoute,
	resolveRewrites,
} from './utils'

import type {
	Any,
	IndexTOC,
	LlmsConfig,
	LlmsPageData,
	PageData,
	VPConfig,
} from './types'

const LLM_FILENAME      = 'llms.txt' as const
const LLM_FULL_FILENAME = 'llms-full.txt' as const

const replaceMarkdownTemplate = (
	template: string,
	params: Record<string, Any>,
	frontmatter: Record<string, Any>,
	content?: string,
): string => {

	try {

		return template
			.replace( /\{\{\s*\$params\.(\w+)\s*\}\}/g, ( _, key ) => params[key] ?? '' )
			.replace( /\{\{\s*\$frontmatter\.(\w+)\s*\}\}/g, ( _, key ) => frontmatter[key] ?? '' )
			.replace( /<!--\s*@content\s*-->/g, content ?? '' )

	}
	catch ( _e ) {

		return template

	}

}

/**
 * Sorts an array of PageData objects by their URL in descending order.
 *
 * @param   {PageData[]} content - The array of PageData objects to be sorted.
 * @returns {PageData[]}         The sorted array of PageData objects.
 */

const orderContent = ( content: PageData[] ) =>
	content.sort( ( a, b ) => b.url.localeCompare( a.url ) )

export const getIndex = ( pages: LlmsPageData[], config?: LlmsConfig, vpConfig?: VPConfig ) => {

	try {

		let res        = ''
		const indextoc = typeof config?.llmsFile === 'object' ? config?.llmsFile?.indexTOC : config?.llmsFile
		if ( !indextoc ) return res

		const h        = '#'.repeat( 1 )
		const webLinks = pages.filter( d => !d.path.endsWith( '.txt' ) ).map( p => `- [${p.title}](${p.url})` ).join( '\n' )
		const llmLinks = pages.filter( d => !d.path.endsWith( '.txt' ) ).map( p => `- [${p.title}](${p.llmUrl})` ).join( '\n' )

		res += `${h} Table of contents\n${vpConfig?.userConfig.description ? '\n' + vpConfig?.userConfig.description.trimEnd() + '\n' : ''}`

		if ( indextoc === 'only-web' ) res += `\n${h}# Web links\n\n${webLinks}`
		else if ( indextoc === 'only-web-links' ) res = webLinks
		else if ( indextoc === 'only-llms' && config?.mdFiles ) res += `\n${h}# LLMs links\n\n${llmLinks}`
		else if ( indextoc === 'only-llms-links' && config?.mdFiles ) res  = llmLinks
		else res += `\n${h}# Web links\n\n${webLinks}${config?.mdFiles ? `\n\n${h}# LLMs links\n\n${llmLinks}` : ''}`

		return res

	}
	catch ( _ ) {

		return ''

	}

}

export const createTransformUtils = (
	pages : LlmsPageData[],
	config? : LlmsConfig,
	vpConfig? : VPConfig,
) => ( {
	getIndexTOC : ( type: IndexTOC ) => getIndex( pages, {
		...config,
		llmsFile : { indexTOC: type },
	}, vpConfig ),
	removeFrontmatter : ( content: string ) => removeFrontmatter( content ),
} )

const getPages = async ( config?: LlmsConfig, vpConfig?: VPConfig ) => {

	const loader = createContentLoader( '**/*.md', {
		includeSrc  : true,
		excerpt     : true,
		globOptions : config?.ignore
			? {
				ignore : [
					'node_modules',
					'dist',
					...config.ignore,
				],
			}
			: undefined,
	} )

	const pages = await loader.load()

	// Handle dynamicRoutes format depending on vpConfig version.
	// In version 2.0.0-alpha, vpConfig.dynamicRoutes is an array directly.
	// In other versions, it's an object with a `routes` property.
	const dynamicRoutes = Array.isArray( vpConfig?.dynamicRoutes )
		? vpConfig.dynamicRoutes
		: vpConfig?.dynamicRoutes?.routes

	if ( !dynamicRoutes || config?.dynamicRoutes === false ) return orderContent( pages )

	const dynamicPaths: string[] = []

	for ( const key in dynamicRoutes ) {

		const page    = dynamicRoutes[key]
		const route   = markdownPathToUrlRoute( page.route )
		const content =  pages.find( p => p.url.replace( '.html', '' ) === route )

		if ( !content || !content.src ) continue

		dynamicPaths.push( content.url )
		pages.push( {
			excerpt     : undefined,
			frontmatter : content.frontmatter || {},
			html        : undefined,
			url         : markdownPathToUrlRoute( page.path ),
			src         : replaceMarkdownTemplate( content.src, page.params, {}, page.content ),
		} )

	}

	const res = dynamicPaths.length ? pages.filter( p => dynamicPaths.includes( p.url ) ? undefined : p ) : pages
	// console.log( res.map( p => p.url ), dynamicPaths )
	return orderContent( res )

}
type PagesDataConfig = Omit<LlmsConfig, 'hostname'> & { hostname: string }

/**
 * Returns the processed collection of page data for the LLMS plugin,
 * including path normalization, generation of llms.txt and llms-full.txt files,
 * and application of custom transformation hooks.
 *
 * @param   {PagesDataConfig}         config   - Plugin configuration (must include hostname).
 * @param   {VPConfig}                vpConfig - Optional VitePress configuration context.
 * @returns {Promise<LlmsPageData[]>}          The final collection of page data.
 */
export const getPagesData = async ( config: PagesDataConfig, vpConfig?: VPConfig ) => {

	const pages                    = await getPages( config, vpConfig )
	const originURL                = config.hostname
	const mdFiles : LlmsPageData[] = []
	const allFiles: LlmsPageData[] = []

	for ( const page of pages.slice().reverse() ) {

		const route    = page.url
		const pathname = route.replace( /\.html$/, '' )

		let path = join( pathname.endsWith( '/' ) ? `${pathname}index.md` : `${pathname}.md` )

		// Apply path rewrites before content generation
		const vpRewrites = ( vpConfig as { rewrites?: { map?: Record<string, string> | undefined } | undefined } )?.rewrites?.map
		if ( vpRewrites ) {

			path = resolveRewrites( path, vpRewrites )

		}

		const relPath     = path.startsWith( '/' ) ? path.slice( 1 ) : path
		const pageRoute   = '/' + relPath
			.replace( /(^|\/)index\.md$/, '$1' )
			.replace( /\.md$/, vpConfig?.cleanUrls ? '' : '.html' )
		const URL         = joinUrl( originURL, pageRoute )
		const LLMS_URL    = joinUrl( originURL, path )
		const frontmatter = {
			URL,
			LLMS_URL,
			...page.frontmatter,
		}

		// Strip original frontmatter so transform sees clean markdown
		const content  = removeFrontmatter( page.src || '' )
		const outDir   = vpConfig?.outDir
		const htmlPath = path.endsWith( '.md' ) ? path.slice( 0, -3 ) + '.html' : path
		const htmlFile = outDir ? join( outDir, htmlPath ) : undefined
		const llmFile  = outDir ? join( outDir, path ) : undefined

		mdFiles.push( {
			path,
			url     : URL,
			llmUrl  : LLMS_URL,
			content : content,
			title   : page.frontmatter.title || getMDTitleLine( content ) || page.frontmatter.layout || '',
			frontmatter,
			htmlFile,
			llmFile,
		} )

	}

	if ( config?.llmsFullFile ) {

		const path    = '/' + LLM_FULL_FILENAME
		const outDir  = vpConfig?.outDir
		const extra   = {
			URL      : joinUrl( originURL, path ),
			LLMS_URL : joinUrl( originURL, path ),
		}
		const content = mdFiles.map( d => d.content ).join( '\n\n' )
		allFiles.push( {
			path,
			url         : extra.URL,
			llmUrl      : extra.LLMS_URL,
			content     : content,
			title       : getMDTitleLine( content ) || '',
			frontmatter : extra,
			llmFile     : outDir ? join( outDir, path ) : undefined,
		} )

	}

	if ( config.mdFiles ) allFiles.push( ...mdFiles )

	if ( config?.llmsFile ) {

		const path    = '/' + LLM_FILENAME
		const outDir  = vpConfig?.outDir
		const extra   = {
			URL      : joinUrl( originURL, path ),
			LLMS_URL : joinUrl( originURL, path ),
		}
		const content = getIndex( mdFiles, config, vpConfig ).trim()

		allFiles.push( {
			path,
			url         : extra.URL,
			llmUrl      : extra.LLMS_URL,
			content,
			title       : getMDTitleLine( content ) || '',
			frontmatter : extra,
			llmFile     : outDir ? join( outDir, path ) : undefined,
		} )

	}

	// Transform + overrideFrontmatter run once in buildEnd (HTML files available)
	const res = allFiles

	// console.log( {
	// 	config,
	// 	mdFilesNumber  : mdFiles.length,
	// 	allFilesNumber : res.length,
	// 	mdFiles        : mdFiles.map( d => d.url ),
	// 	allPaths       : res.map( d => d.url ),
	// } )

	return res

}
