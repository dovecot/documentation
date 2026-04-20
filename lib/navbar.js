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

		// Reusable function to populate DOM menu lists
		function populateList(navbar, listClass, refClass, textSelector) {
			if (!navbar) return
			const listNode = navbar.querySelector(listClass)
			if (!listNode) return
			const refNode = listNode.querySelector(refClass)
			const textNode = navbar.querySelector(textSelector)
			if (!refNode || !textNode) return

			const currVers = textNode.innerText.trim()
			const existingLinks = Array.from(listNode.querySelectorAll('a'))
				.map(a => a.textContent.trim())

			versions.forEach((version) => {
				if (version === currVers || existingLinks.includes(version)) return

				const entry = refNode.cloneNode(true)
				const anchor = entry.querySelector('a')

				anchor.href = `/${version}/`
				anchor.textContent = version

				listNode.prepend(entry)
			})
		}

		// Ensure 'main' is present and remove duplicates
		const versions = [...new Set([...data, 'main'])]

		const navbar = document.querySelector('.VPNavBarMenuGroup')
		if (!navbar) throw new Error("Missing DOM navbar element")
		populateList(navbar, '.menu .items', '.VPMenuLink', 'button span.text')

		// Setup MutationObserver to watch for mobile NavScreen opening
		new MutationObserver((m) => {
			for (const mutation of m) {
				for (const node of mutation.addedNodes) {
					if (node instanceof Element && node.classList.contains('VPNavScreen')) {
						populateList(node.querySelector('.VPNavScreenMenuGroup'), '.items', '.item', '.button-text')
					}
				}
			}
		}).observe(
			navbar.closest('HEADER.VPNav'),
			{ childList: true, subtree: true }
		)
	} catch (error) {
		console.error('Failed to inject version dropdown:', error)
	}
}
