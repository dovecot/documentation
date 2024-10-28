import gitCommitInfo from 'git-commit-info'
import { defineConfig } from 'vitepress'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'
import { generateSidebar } from 'vitepress-sidebar'
import { dovecotMdExtend, initDovecotMd } from '../lib/markdown.js'
import { getExcludes } from '../lib/utility.js'

const base = '/2.4'

// Need to bootstrap configuration for Dovecot markdown driver (specifically,
// loading all data files to allow existence checking), or else the markdown
// processing will begin before Dovecot link markup is enabled
await initDovecotMd(base)

export const dovecotConfig = {
	gitrev: {
		align: 'right',
		hash: gitCommitInfo().shortHash,
	},
	man_includes: [
		'docs/core/man/include/*.inc'
	],
	man_paths: [
		'docs/core/man/*.[[:digit:]].md'
	],
	watch_paths: [
		'docs/**/*.md',
		'docs/**/*.inc',
		'data/**/*'
	]
}

export default defineConfig({
	title: "Dovecot CE",
	description: "Dovecot CE Documentation",
	lang: "en-us",

	srcDir: ".",
	srcExclude: [ '*.md' ].concat(getExcludes()),
	rewrites: {
		'docs/:path(.*)': ':path',
	},

	base: base,
	sitemap: {
		hostname: 'https://doc.dovecot.org' + base
	},

	vite: {
		build: {
			chunkSizeWarningLimit: 1000,
		},
		plugins: [
			pagefindPlugin()
		],
	},

	ignoreDeadLinks: 'localhostLinks',
	metaChunk: true,

	themeConfig: {
		nav: [
			{
				text: base.substring(1),
				items: [
					{ text: '2.3', link: 'https://doc.dovecot.org/2.3/' },
				]
			},
			{
				text: '3.0 (Pro)',
				link: 'https://doc.dovecotpro.com/latest/'
			},
			{
				text: 'Dovecot Home',
				link: 'https://www.dovecot.org/'
			},
			{
				text: 'Packages',
				link: 'https://repo.dovecot.org/'
			},
		],

		sidebar: generateSidebar({
			documentRootPath: '/docs',
			useTitleFromFrontmatter: true,
			useFolderTitleFromIndexFile: true,
			includeFolderIndexFile: true,
			collapseDepth: 2,
			excludeFiles: [],
			excludeFilesByFrontmatterFieldName: 'exclude',
			sortMenusByFrontmatterOrder: true,
			frontmatterOrderDefaultValue: 999,
		}),

		outline: "deep",
		externalLinkIcon: true,
		lastUpdated: {},

		docFooter: {
			prev: false,
			next: false,
		},
		footer: {
			copyright: 'Copyright © Open-Xchange GmbH',
		},

		logo: {
			light: '/dovecot_logo-light.svg',
			dark: '/dovecot_logo-dark.svg',
		},

		editLink: {
			pattern: 'https://github.com/dovecot/documentation/edit/main/docs/:path'
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/dovecot/' },
		],

		/* Dovecot config. */
		dovecot: dovecotConfig,
	},

	markdown: {
		config: (md) => dovecotMdExtend(md),
		image: {
			lazyLoading: true,
		},
		math: true,
	},

	head: [
		['link', { rel: 'icon', type: 'image/x-icon', href: base + '/favicon.ico' } ],
		['script', { async: '', src: '/js/versions.js' } ]
	]

})
