import DefaultTheme from 'vitepress/theme'
import DovecotLayout from './DovecotLayout.vue'
import { navbarAddVersions } from '../../lib/navbar.js'
import { onMounted } from 'vue'
import './custom.css'

const modules = import.meta.glob(
	'../../components/*.vue',
	{
		eager: true
	}
)

export default {
	extends: DefaultTheme,
	setup() {
		onMounted(async () => {
			// Populate the version list in the navbar
			navbarAddVersions()
		})
	},
	/* This code loads all .vue components and globally registers them. */
	enhanceApp({ app }) {
		for (const path in modules) {
			const c = modules[path].default
			app.component(c.__name, c)
		}
	},
	Layout: DovecotLayout
}
