import {
	access,
	stat,
	writeFile,
	constants,
	mkdir,
} from 'node:fs/promises'
import {
	join,
	dirname,
} from 'node:path'
import { styleText } from 'node:util'

import { name } from '../package.json'

export {
	writeFile,
	join,
	dirname,
}

export const PLUGIN_NAME = name

/**
 * ********************************************************************************
 * ********************************************************************************
 * **** STRINGS ******************************************************************
 * ********************************************************************************
 * ********************************************************************************
 */

/**
 * Joins the given URL parts into a single string.
 *
 * @param   {string[]} parts - The URL parts to join.
 * @returns {string}         - The joined URL string.
 */
export const joinUrl = ( ...parts: string[] ) => {

	parts = parts.map( part => part.replace( /^\/+|\/+$/g, '' ) )

	return parts.join( '/' )

}

// /**
//  * Cleans the given URL path by removing leading and trailing slashes.
//  *
//  * @param   {string} path - The URL path to clean.
//  * @returns {string}      - The cleaned URL path without leading or trailing slashes.
//  */

// export const cleanUrlPath = ( path: string ) =>
// 	path.replace( /^\/+|\/+$/g, '' )

// /**
//  * Checks if two file paths are equal after normalization.
//  *
//  * Normalization ensures that differences like trailing slashes or redundant path segments are ignored.
//  *
//  * @param   {string}  pathA - The first file path to compare.
//  * @param   {string}  pathB - The second file path to compare.
//  * @returns {boolean}       - true if the paths are equal, false otherwise.
//  */
// export const matchUrlPath = ( pathA: string, pathB: string ): boolean =>
// 	cleanUrlPath( pathA ) === cleanUrlPath( pathB )

/**
 * ********************************************************************************
 * ********************************************************************************
 * **** MARKDOWN ******************************************************************
 * ********************************************************************************
 * ********************************************************************************
 */

/**
 * Replaces any existing frontmatter in the Markdown string with the provided one.
 *
 * If the Markdown already contains a frontmatter block, it is completely removed and
 * replaced by the new frontmatter. If no frontmatter exists, the new one is simply added.
 *
 * @param   {string}                  markdown    - The Markdown content.
 * @param   {Record<string, unknown>} frontmatter - The new frontmatter to insert.
 * @returns {string}                              - The Markdown with the frontmatter overridden.
 */
export const overrideFrontmatter = ( markdown: string, frontmatter: Record<string, unknown> ): string => {

	const toYAML = ( obj: Record<string, unknown>, indent = 0 ): string => {

		const pad = '  '.repeat( indent )

		return Object.entries( obj )
			.map( ( [ key, value ] ) => {

				if ( Array.isArray( value ) ) {

					return `${pad}${key}:\n` + value.map( item => {

						if ( typeof item === 'object' && item !== null ) {

							const nested = toYAML( item as Record<string, unknown>, indent + 2 )
							return `${pad}  - ${nested.trimStart().replace( /^/gm, `${pad}    ` ).replace( `${pad}    `, '' )}`

						}
						else {

							return `${pad}  - ${JSON.stringify( item )}`

						}

					} ).join( '\n' )

				}
				else if ( typeof value === 'object' && value !== null ) {

					return `${pad}${key}:\n${toYAML( value as Record<string, unknown>, indent + 1 )}`

				}
				else {

					return `${pad}${key}: ${JSON.stringify( value )}`

				}

			} )
			.join( '\n' )

	}

	const frontmatterBlock = `---\n${toYAML( frontmatter )}\n---\n\n`

	// Remove existing frontmatter if present
	const cleanedMarkdown = markdown.replace( /^---\n[\s\S]*?\n---\n*/, '' )

	return frontmatterBlock + cleanedMarkdown.trimStart()

}

/**
 * Removes the frontmatter from a Markdown string.
 *
 * This function takes a Markdown string as an argument, and returns
 * the same string but with the frontmatter removed. If the Markdown
 * doesn't contain frontmatter, it returns the original string.
 *
 * @param   {string} markdown - The Markdown content from which the frontmatter will be removed.
 * @returns {string}          - The Markdown content without frontmatter.
 */
export const removeFrontmatter = ( markdown: string ): string => {

	const match = markdown.match( /^---\n([\s\S]*?)\n---\n?/ )
	if ( !match ) return markdown

	return markdown.slice( match[0].length )

}

/**
 * Converts a Markdown file path into a clean URL route.
 *
 * Removes the `.md` extension if present and ensures the path
 * starts with a leading slash (`/`).
 *
 * @param   {string} path - The file path or route string to normalize.
 * @returns {string}      The normalized route ready to be used as a URL (e.g., "/my-page").
 */
export const markdownPathToUrlRoute = ( path: string ) => {

	// const basePath = path.endsWith( '/' ) ? path : path + '/'
	const route = path.endsWith( '.md' ) ? path.slice( 0, -3 ) : path
	// Ensure the route starts with a slash
	return route.startsWith( '/' ) ? route : '/' + route

}

// const urlRoute2MarkdownPath = ( route: string ) => {

// 	const basePath = route.endsWith( '/' ) ? route.slice( 0, -1 ) : route
// 	const path     = basePath.endsWith( '.md' ) ? basePath : basePath + '.md'

// 	return path.startsWith( '/' ) ? path.slice( 1 ) : path

// }

/**
 * Extracts the first H1 title from a Markdown string.
 *
 * Searches for a line starting with `# ` and returns the text content
 * after the hash symbol, trimmed of whitespace.
 *
 * @param   {string}             markdown - The raw Markdown content to parse.
 * @returns {string | undefined}          The extracted title text, or undefined if no H1 title is found.
 */
export const getMDTitleLine = ( markdown: string ): string | undefined => {

	try {

		const match = markdown.match( /^# .*/m )
		return match ? match[0].replace( '#', '' ).trim() : undefined

	}
	catch ( _ ) {

		return undefined

	}

}

/**
 * ********************************************************************************
 * ********************************************************************************
 * **** SYSTEM ********************************************************************
 * ********************************************************************************
 * ********************************************************************************
 */

/**
 * Checks if a directory exists at the specified path.
 *
 * @param   {string}           path - The path to check.
 * @returns {Promise<boolean>}      - A promise that resolves to true if a directory exists at the specified path, otherwise false.
 * @example import { existsDir } from '@dovenv/utils'
 * const exist = await existsDir('./my/dir')
 */
export async function existsDir( path: string ): Promise<boolean> {

	try {

		await access( path, constants.F_OK )
		const stats = await stat( path )
		return stats.isDirectory() // Returns true if it is a directory

	}
	catch ( _error ) {

		return false

	}

}

/**
 * Ensures that a directory exists at the specified path.
 *
 * If the directory does not exist, it creates it (including any necessary
 * parent directories). If it already exists, it does nothing.
 *
 * @param   {string}        path - The path of the directory to ensure.
 * @returns {Promise<void>}      A promise that resolves when the directory is verified or created.
 */
export const ensureDir = async ( path: string ) => {

	const exist = await existsDir( path )
	if ( !exist ) await mkdir( path, { recursive: true } )

}

/**
 * ********************************************************************************
 * ********************************************************************************
 * **** LOG ***********************************************************************
 * ********************************************************************************
 * ********************************************************************************
 */

const green  = ( v: string ) => styleText( 'green', v )
const bold   = ( v: string ) => styleText( 'bold', v )
const red    = ( v: string ) => styleText( 'red', v )
const yellow = ( v: string ) => styleText( 'yellow', v )

/**
 * Utility object for standardized plugin logging.
 * Provides formatted console output for success, error, warning, and info messages.
 */
export const log = {
	/**
	 * Logs a success message to the console with a green checkmark.
	 *
	 * @param   {string} v - The message string to display.
	 * @returns {void}
	 */
	success : ( v: string ): void => console.log( green( '✓ ' + bold( PLUGIN_NAME ) + ' ' + v ) ),

	/**
	 * Logs an error message to the console with a red cross.
	 *
	 * @param   {string} v - The message string to display.
	 * @returns {void}
	 */
	error : ( v: string ): void => console.log( red( '✗ ' + bold( PLUGIN_NAME ) + ' ' + v ) ),

	/**
	 * Logs a warning message to the console with a yellow warning icon.
	 *
	 * @param   {string} v - The message string to display.
	 * @returns {void}
	 */
	warn : ( v: string ): void => console.log( yellow( '⚠ ' + bold( PLUGIN_NAME ) + ' ' + v ) ),

	/**
	 * Logs an informational message to the console.
	 *
	 * @param   {string} v - The message string to display.
	 * @returns {void}
	 */
	info : ( v: string ): void => console.log( 'i ' + bold( PLUGIN_NAME ) + ' ' + v ),
}
