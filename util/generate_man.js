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
import { dovecotSettingBootstrap } from '../lib/utility.js'
import remarkDeflist from 'remark-definition-list'
import remarkMan from 'remark-man'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { u } from 'unist-builder'
import { map } from 'unist-util-map'
import { parents } from 'unist-util-parents'
import { SKIP, visit } from 'unist-util-visit'

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

const doInclude = (content, includes, f) => {
	const result = content.replace(includesRE, (m, m1) => {
		if (!m1.length) return m
		const inc_f = path.basename(m1)
		for (const fn of includes) {
			if (path.basename(fn) == inc_f)
			   return doInclude(fs.readFileSync(fn, 'utf8'), includes, f)
		}
		throw new Error("Missing include " + inc_f)
	})
	return result
}

const processDovecotMdPost = () => {
	return tree => {
		/* Convert definition lists to base mdast elements that remark-man
		 * can handle. */
		visit(tree, 'defList', function (node, index, parent) {
			if (typeof index !== 'number' || !parent) return
			/* defList is just a container, remove it. */
			parent.children.splice(index, 1, ...node.children)
			return [SKIP, index]
		})

		visit(tree, 'defListTerm', function (node) {
			node.type = "paragraph"
		})

		visit(parents(tree), 'defListDescription', function (node, index, parent) {
			/* Convert the actual description text to a blockquote, so
			 * that it is indented. */
			node.node.type = "blockquote"

			/* remark-man only indents blockquote if it is not at the base
			 * level. Thus, search for a parent blockquote - if it doesn't
			 * exist, add an additional blockquote to bump the level. */
			while (parent) {
				if (parent.type == 'blockquote') {
					return
				}
				parent = parent.parent
			}

			node.node.children = [ u('blockquote', node.children) ]
		})
	}
}

const DovecotMd = (md) => {
	const parts = md.split(',').map((x) => x.trim())
	switch (parts[0]) {
	case 'doveadm':
		return [
				{
					type:'strong',
					children: [
						{
							type:'text', value:'doveadm(1)'
						}
					]
				},
				{
					type:'emphasis',
					children: [
						{
							type:'text', value:' ' + parts.slice(1).join(' ')
						}
					]
				}
			]
	case 'man':
		return [{type:'text', value:parts[1] + '(' + (parts[3] ? parts[3] : '1') + ')'}]
	case 'plugin':
		return [{type:'text', value:parts[1] + ' plugin documentation'}]
	case 'rfc':
		return [{type:'text', value:'RFC ' + parts[1]}]
	case 'setting':
		return [
				{
					type:'strong',
					children: [
						{
							type:'text', value:parts[1]
						}
					]
				},
				{
					type:'text', value:' setting'
				}
			]
	case 'link':
		return [{type:'text', value:parts[1]}]
	default:
		throw new Error('unknown dovecot markdown command: ' + parts[0])
	}
}

const processDovecotMdPre = () => {
	return tree => {
		/* Go through and replace Dovecot markdown items with man-friendly
		 * textual equivalents. */
		return map(tree, (para) => {
			visit(para, 'text', (node, index, para) => {
				/* if the text contains at least one tag, we need to convert
				 * this into an array of children that replace the parent's children. */
				var result;
				var newChildren = []
				var pos = 0;
				while ((result = includesDM.exec(node.value))) {
					const pre = node.value.substr(pos, result.index - pos)
					pos = result.index + result[0].length
					if (pre != "")
						newChildren.push({type: 'text', value: pre})
					newChildren.push(...DovecotMd(result[1]))
				}
				if (newChildren.length != 0) {
					if (pos < node.value.length)
						newChildren.push({type: 'text', value: node.value.substr(pos)})
					para.children = newChildren
				}
			})
			return para
		})
	}
}

const main = async (component, outPath) => {
	/* Create output directory, if it doesn't exist. */
	if (!fs.existsSync(outPath)) {
		await fs.promises.mkdir(outPath)
	}

	/* Generate list of man files. */
	const files = (await dovecotSettingBootstrap('man_paths'))
		.flatMap((x) => fg.sync(x))
	const includes = (await dovecotSettingBootstrap('man_includes'))
		.flatMap((x) => fg.sync(x))

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
			value: await doInclude(page.content, includes, f)
		})
		if (page.data.dovecotComponent != component)
			continue

		await unified().
			use(processDovecotMdPre).
			use(remarkParse).
			use(remarkDeflist).
			use(processDovecotMdPost).
			use(remarkMan, {
				manual: 'Dovecot',
				version: gitHash,
			}).
			process(vf).
			then((file) => fs.promises.writeFile(out_f, String(file)))
	}
}

main(component, outPath)
