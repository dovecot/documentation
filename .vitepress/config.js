import gitCommitInfo from 'git-commit-info'
import { defineConfig } from 'vitepress'
import { pagefindPlugin } from 'vitepress-plugin-pagefind'
import { generateSidebar } from 'vitepress-sidebar'
import { dovecotMdExtend } from '../lib/markdown.js'
import { getExcludes } from '../lib/utility.js'
import dovecotVitepressInit from '../lib/dovecot_vitepress_init.js'
import path from 'path'

const base = '/2.4'
const base_url = 'https://doc.dovecot.org'

export const dovecotConfig = {
	base_url: base_url,
	data_paths: {
		doveadm: '../data/doveadm.js',
		event_categories: '../data/event_categories.js',
		event_reasons: '../data/event_reasons.js',
		events: '../data/events.js',
		links_overrides: '../data/links_overrides.js',
		lua: '../data/lua.js',
		settings: '../data/settings.js',
		updates: '../data/updates.js',
	},
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
	plugin_paths: [
		'docs/core/plugins/*.md'
	],
	url_rewrite: false,
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
	srcExclude: [
		// Exclude anything that is not in docs
		'!(docs)/**/*.md',
		// Exclude base-level markdown files
		'*.md'
	].concat(getExcludes()),
	rewrites: {
		'docs/:path(.*)': ':path',
	},

	base: base,
	sitemap: {
		hostname: base_url + base + '/'
	},

	vite: {
		build: {
			chunkSizeWarningLimit: 1000,
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.startsWith(path.resolve(process.cwd(), 'lib/data'))) {
							return 'data-chunk-' + path.basename(id, '.data.js')
						}
						if (id.includes('node_modules')) {
							return 'vendor'
						}
					}
				}
			}
		},
		plugins: [
			pagefindPlugin(),
			dovecotVitepressInit()
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
			pattern: 'https://github.com/dovecot/documentation/edit/main/:path'
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
