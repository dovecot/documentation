<script setup>
import { data } from '../lib/data/lua.data.js'

/* Properties for this component:
 * 'level' (integer): The header level to display entries as. Default: '2'
 * 'tag' (string): Filter by tag property.
 */
const props = defineProps(['level', 'tag'])
const level = (props.level ? Number(props.level) : 2) + 1

const d = Object.fromEntries(Object.entries(data).filter(([k, v]) =>
	/* Filter entries (by tag). */
	!props.tag ||
	(v.tags && v.tags.includes(props.tag))
))
</script>

<template>
 <template v-for="(v, k) in d">
  <component :is="'h' + level" :id="k" tabindex="-1">
   <code>{{ k }}</code>
   <a class="header-anchor" :href="'#' + k"></a>
  </component>

  <dl v-if="v.args">
   <dt><strong>Arguments:</strong></dt>
   <dd>
    <ul>
     <li v-for="[k2,v2] in Object.entries(v.args)">
      <code>{{ k2 }}</code>
      (<em>{{ v2.type }}</em>):
      <span v-html="v2.text" />
      <span v-if="v2.default"> (Default: <code>{{ v2.default }}</code>)</span>
     </li>
    </ul>
   </dd>
  </dl>

  <dl v-if="v.return">
   <dt><strong>Returns:</strong></dt>
   <dd>{{ v.return }}</dd>
  </dl>

  <span v-html="v.text"></span>
 </template>
</template>
