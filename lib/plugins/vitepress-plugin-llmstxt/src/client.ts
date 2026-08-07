
import {
	type Route,
	useData,
} from 'vitepress'

import type {
	Any,
	LlmsClientConfig,
} from './types'

export type {
	LlmsClientConfig,
}

type LLMsRouteData = NonNullable<LlmsClientConfig['pageData']>[number]

/**
 * Gets the LLMs data for the current route.
 *
 * @param   {Route}                      route - The current route.
 * @param   {ReturnType<typeof useData>} data  - The VitePress data.
 * @returns {LLMsRouteData | undefined}        The LLMs data for the current route.
 */
export const useLLMsRouteData = ( route: Route, data: ReturnType<typeof useData> ): NonNullable<LlmsClientConfig['pageData']>[number] | undefined => {

	try {

		let path = route.path

		const pageData = ( data.theme.value as Any )?.llmstxt?.pageData as LLMsRouteData[]

		path = path.endsWith( '/' ) ? path.slice( 0, -1 ) : path
		return pageData?.find( d => d.url === path )

	}
	catch ( e ) {

		console.warn( 'No route data found', e )
		return

	}

}

