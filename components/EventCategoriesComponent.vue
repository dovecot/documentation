<script setup>
import { data } from '../lib/data/event_categories.data.js'

/* Properties for this component:
 * 'category' (string): Filter by category.
 * 'show_type' (boolean): Show category type in output? (default: false)
 */
const props = defineProps(['category', 'show_type'])

const d = Object.fromEntries(Object.entries(data).filter(([k, v]) =>
	/* Filter entries (by category). */
	!props.category ||
	(v.category && v.category == props.category)
).sort())
</script>

<template>
 <table>
  <thead>
   <tr>
    <th>Category</th>
    <th>Description</th>
    <th v-if="props.show_type">Category Type</th>
   </tr>
  </thead>
  <tbody>
   <tr v-for="(v, k) in d">
    <td><code>{{ k }}</code></td>
    <td v-html="v.description"></td>
    <td v-if="props.show_type"><code>{{ v.category }}</code></td>
   </tr>
  </tbody>
 </table>
</template>
