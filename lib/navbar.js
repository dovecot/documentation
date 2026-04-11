import { withBase } from 'vitepress'

// Populate the version list in the navbar
export async function navbarAddVersions() {
	try {
		const response = await fetch(withBase('versions.json'))
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
