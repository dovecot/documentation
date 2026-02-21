<script setup>
import { computed } from 'vue'
import { data } from '../lib/data/event_reasons.data.js'

/* Properties for this component:
 * 'category' (string): Filter by the category property.
 */
const props = defineProps(['category'])

const d = computed(() => Object.entries(data).filter(([k, v]) =>
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
   <tr v-for="[k, v] in d">
    <td><code>{{ k }}</code></td>
    <td v-html="v.description" />
   </tr>
  </tbody>
 </table>
</template>
