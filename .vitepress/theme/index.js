import DefaultTheme from 'vitepress/theme'

const modules = import.meta.glob(
	'../../components/*.vue',
	{
		eager: true
	}
)

export default {
	extends: DefaultTheme,
	/* This code loads all .vue components and globally registers them. */
	enhanceApp({ app }) {
		for (const path in modules) {
			const c = modules[path].default
			app.component(c.__name, c)
		}
	}
}
