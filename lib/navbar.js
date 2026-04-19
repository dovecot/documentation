import { withBase } from 'vitepress'

// Allows versions.json to be tested locally (in development mode)
// by placing in public/ folder.
// Otherwise, in production, file is always located at webroot.
const VERSIONS_PATH = import.meta.env.DEV
	? withBase('versions.json')
	: '/versions.json'

// Populate the version list in the navbar
export async function navbarAddVersions() {
	try {
		// Cache buster updates once-a-day based on local user timezone
		const response = await fetch(`${VERSIONS_PATH}?t=${new Date().setHours(0, 0, 0, 0)}`)
		if (!response.ok) return

		const data = await response.json()

		const navbar = document.querySelector('.VPNavBarMenuGroup')
		if (!navbar) throw new Error("Missing DOM navbar element")
		const listNode = navbar.querySelector('.menu .items')
		const refNode = listNode.querySelector('.VPMenuLink')

		// Ensure 'main' is present and remove duplicates
		const versions = [...new Set([...data, 'main'])]
		const currVers = navbar.querySelector('button span.text').innerText.trim()

		versions.forEach((version) => {
			if (version === currVers) return

			const entry = refNode.cloneNode(true)
			const anchor = entry.querySelector('a')

			anchor.href = withBase(version) + '/'
			anchor.textContent = version

			listNode.prepend(entry)
		})
	} catch (error) {
		console.error('Failed to inject version dropdown:', error)
	}
}
