/* Generates man pages (groff format) from markdown source.
 *
 * REQUIRES pandoc to be installed on the system.
 *
 * Usage: From the base directory of the documentation, run
 * "node util/generate_man.js <output dir>" */

import { Command } from 'commander'
import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs'
import gitCommitInfo from 'git-commit-info'
import matter from 'gray-matter'
import pdc from 'pdc'
import path from 'path'
import { VFile } from 'vfile'
import { manFiles } from '../lib/utility.js'
import remarkMan from 'remark-man'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import { unified } from 'unified'
import { map } from 'unist-util-map'

/* Pattern matching for markdown elements. */
const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g
const includesDM = /\[\[(.*?)\]\]/g

/* Check for command line argument. */
let component
let outPath
const program = new Command()
program
	.name('generate_man.js')
	.description("Generates man pages from markdown source.\n\nRequires \"pandoc\" to be installed on the system!")
	.argument('<component>', 'component to render')
	.argument('<path>', 'path to output man pages')
	.option('-d, --debug', 'print debug output')
	.action((comp,path) => { component = comp; outPath = path })
	.parse()
const debug = program.opts().debug

const doInclude = (content, f) => {
	return content.replace(includesRE, (m, m1) => {
		if (!m1.length) return m
		const inc_f = path.join(path.dirname(f), m1)
		return doInclude(fs.readFileSync(inc_f, 'utf8'), f)
	})
}

const processDovecotMd = () => {
	return tree => {
		return map(tree, (node) => {
			if (node.value) {
				node.value = node.value.replace(includesDM, (m, m1) => {
					if (!m1.length) return m

					const parts = m1.split(',').map((x) => x.trim())
					switch (parts[0]) {
					case 'man':
						return parts[1] + '(' + (parts[3] ? parts[3] : '1') + ')'
					case 'rfc':
						return "RFC " + parts[1]
					case 'setting':
						return '`' + parts[1] + '`'
					case 'link':
						return parts[1]
					default:
						return m1
					}
				})
			}
			return node
		})
	}
}

const main = async (component, outPath) => {
	/* Create output directory, if it doesn't exist. */
	if (!fs.existsSync(outPath)) {
		await fs.promises.mkdir(outPath)
	}

	/* Generate list of man files. */
	const files = (await manFiles()).flatMap((x) => fg.sync(x))

	/* Get hash of last git commit. */
	const gitHash = gitCommitInfo().shortHash

	/* Process man files. */
	for (const f of files) {
		if (debug) {
			console.debug('Processing file:', f)
		}

		/* Load base man file. */
		const out_f = path.join(outPath, path.basename(f, '.md'));
		const str = await fs.promises.readFile(f, 'utf8')
		const page = matter(str)
		const vf = new VFile({
			path: f,
			value: doInclude(page.content, f)
		})
		if (page.data.dovecotComponent != component)
			continue

		const fparts = path.basename(f).split('.')
		const result = await unified().
			use(remarkParse).
			use(processDovecotMd).
			use(remarkGfm).
			use(remarkMan, {
				manual: 'Dovecot',
				version: gitHash,
			}).process(vf).
			then((file) => fs.promises.writeFile(out_f, String(file)))
	}
}

main(component, outPath)
