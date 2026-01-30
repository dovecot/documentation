<script setup>
import { data } from '../lib/data/datafiles.data.js'
import { withBase } from 'vitepress'

/* Properties for this component:
 * - 'github' (boolean): If true, output GitHub link.
 */
const props = defineProps(['github'])
const github = props.github
</script>

<template>
 <table>
  <thead>
   <tr>
    <th>File</th>
    <th v-if="github">Source</th>
   </tr>
  </thead>
  <tbody>
   <tr v-for="file in data.files">
    <td>
     <code>
      <a :href="withBase(file.download)" target="_blank" rel="noreferrer">{{ file.name }}</a>
     </code>
    </td>
    <td v-if="github">
     <a :href="file.github" target="_blank" rel="noreferrer">Source</a>
    </td>
   </tr>
  </tbody>
 </table>
</template>
