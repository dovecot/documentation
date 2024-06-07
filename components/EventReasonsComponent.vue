<script setup>
import { data } from '../lib/data/event_reasons.data.js'

/* Properties for this component:
 * 'category' (string): Filter by the category property.
 */
const props = defineProps(['category'])

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
    <th>Reason</th>
    <th>Description</th>
   </tr>
  </thead>
  <tbody>
   <tr v-for="(v, k) in d">
    <td><code>{{ k }}</code></td>
    <td v-html="v.description" />
   </tr>
  </tbody>
 </table>
</template>
