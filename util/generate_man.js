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
import { manFiles } from '../lib/utility.js'

/* Pattern matching for markdown elements. */
const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g
const includesDM = /\[\[(.*?)\]\]/g

/* Check for command line argument. */
let outPath
const program = new Command()
program
	.name('generate_man.js')
	.description("Generates man pages from markdown source.\n\nRequires \"pandoc\" to be installed on the system!")
	.argument('<path>', 'path to output man pages')
	.action((path) => { outPath = path })
	.parse()

/* Create output directory, if it doesn't exist. */
if (!fs.existsSync(outPath)) {
	fs.mkdirSync(outPath)
}

/* Generate list of man files. */
const files = (await manFiles()).flatMap((x) => fg.sync(x))

/* Get hash of last git commit. */
const gitHash = gitCommitInfo().shortHash

/* Process man files. */
for (const f of files) {
	const str = fs.readFileSync(f, 'utf8')
	const content = matter(str).content

	// https://pandoc.org/MANUAL.html#extension-pandoc_title_block
	const fparts = path.basename(f).split('.')
	let raw_md = "% " + fparts[0] + "(" + fparts[1] + ") " + gitHash + " | Dovecot\n" +
		"%\n" +
		"% " + dayjs().format('YYYY/MM/DD') + "\n\n"

	/* Handle @include statements */
	raw_md += content.replace(includesRE, (m, m1) => {
		if (!m1.length) return m

		const iContent = matter(
			fs.readFileSync(
				path.join(path.dirname(f), m1),
				'utf8'
			)
		).content

		// TODO: embedded includes
		return iContent
	})

	/* Process Dovecot markdown */
	raw_md = raw_md.replace(includesDM, (m, m1) => {
		if (!m1.length) return m

		const parts = m1.split(',').map((x) => x.trim())
		switch (parts[0]) {
		case 'man':
			return parts[1] + '(' + (parts[3] ? parts[3] : '1') + ')'

		case 'setting':
			return '`' + parts[1] + '`'

		default:
			return m1
		}
	})

	pdc(raw_md, 'markdown', 'man', [ '-s' ], (err, result) => {
		if (err) throw err
		fs.writeFileSync(path.join(outPath, path.basename(f, '.md')), result)
	})
}
