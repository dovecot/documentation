<script setup>
import { data } from '../lib/data/lua.data.js'

/* Properties for this component:
 * 'level' (integer): The header level to display entries as. Default: '2'
 * 'tag' (string): Filter by tag property.
 */
const props = defineProps(['level', 'tag'])
const level = (props.level ? Number(props.level) : 2) + 1

const d = Object.fromEntries(Object.entries(data.functions).filter(([k, v]) =>
	/* Filter entries (by tag). */
	!props.tag || (v.tags === props.tag)
))

function buildFunctionSignature(k, v) {
	let out = k + '('
	const args = []
	const params = []
	const opt_args = []

	if (v.args) {
		for (const [k2, v2] of Object.entries(v.args)) {
			if (v2.hash_arg) {
				params.push(k2 + '=' + v2.type)
			} else if (v2.optional) {
				opt_args.push(k2)
			} else {
				args.push(k2)
				if (v2.multi) {
					opt_args.push(k2)
					opt_args.push('...')
				}
			}
		}
	}
	return out + args.join(', ') +
		(params.length
			? '{ ' + params.join(', ') + ' }'
			: '') +
		(opt_args.length
			? (args.length ? '[, ' : '[') + opt_args.join(', ') + ']'
			: '') +
		')'
}
</script>

<template>
 <template v-for="(v, k) in d">
  <div class="lua-function-separator" />

  <component :is="'h' + level" :id="k" tabindex="-1">
   <code>{{ k }}()</code>
   <a class="header-anchor" :href="'#' + k"></a>
  </component>

  <table v-if="v.args || v.return">
   <tbody>
    <tr>
     <th style="text-align:right;">Signature</th>
     <td>
      <code>{{ buildFunctionSignature(k, v) }}</code>
     </td>
    </tr>
    <tr v-if="v.args">
     <th style="text-align:right;">Arguments</th>
     <td>
      <table>
       <thead>
        <tr>
         <th>Name</th>
         <th>Type</th>
         <th>Description</th>
        </tr>
       </thead>
       <tbody>
        <tr v-for="[k2,v2] in Object.entries(v.args)">
         <td><code>{{ k2 }}</code></td>
         <td><em>{{ v2.type }}</em></td>
         <td>
          <span v-html="v2.text" />
          <span v-if="v2.default">(Default: <code>{{ v2.default }}</code>)</span>
         </td>
        </tr>
       </tbody>
      </table>
     </td>
    </tr>

    <tr v-if="v.return">
     <th style="text-align:right;">Returns</th>
     <td>{{ v.return }}</td>
    </tr>
   </tbody>
  </table>

  <span v-html="v.text"></span>
 </template>
</template>

<style scoped>
.lua-function-separator {
  border-top: 1px solid #e2e2e3;
  margin: 15px auto;
  width: 75%;
}
</style>
