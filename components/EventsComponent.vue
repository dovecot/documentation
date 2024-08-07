<script setup>
import { data } from '../lib/data/events.data.js'

/* Properties for this component:
 * 'root' (string): Filter by the root property.
 * 'tag' (string): Filter by tag. Tag matches either root OR tag field.
 */
const props = defineProps(['root', 'tag'])

const d = Object.fromEntries(Object.entries(data).filter(([k, v]) =>
	/* Filter entries (by root or tag). */
	((!props.root && !props.tag) ||
	 (props.root &&
	  (v.root && v.root == props.root)) ||
	 (props.tag &&
	  ((v.root && v.root == props.tag) ||
	   (v.tags.includes(props.tag)))))
).sort())
</script>

<template>
 <template v-for="(v, k) in d">
   <section>
   <h3 :id="k" tabindex="-1">
    <code>{{ k }}</code>
    <a class="header-anchor" :href="'#' + k"></a>
   </h3>

   <div v-if="v.text" v-html="v.text" />

   <details class="details custom-block">
    <summary>Field List</summary>
    <table>
     <thead>
      <tr>
       <th>Field</th>
       <th>Description</th>
       <th v-if="v.options">Options</th>
      </tr>
     </thead>
     <tbody>
      <tr v-for="(v2, k2) in v.fields">
       <td><code>{{ k2 }}</code></td>
       <td v-html="v2.text" />
       <td v-if="v.options">
        <code v-if="k2 in v.options">{{ v.options[k2].join(', ') }}</code>
       </td>
      </tr>
     </tbody>
    </table>
   </details>
  </section>
 </template>
</template>
