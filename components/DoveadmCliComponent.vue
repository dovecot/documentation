<script setup>
/* Properties for this component:
 * 'data' (object): The command argument data.
 */
const props = defineProps(['data'])
const d = props.data
</script>

<template>
 <div>
  <ul>
   <li>Usage: <code>doveadm {{ d.usage }}</code></li>
  </ul>

  <table v-if="d.args">
   <thead>
    <tr>
     <th>Argument(s)</th>
     <th>Type</th>
     <th>Description</th>
     <th>Example</th>
    </tr>
   </thead>
   <tbody>
    <template v-for="elem in d.args">
     <tr>
      <td><code>{{ elem.flag }}</code></td>
      <td>{{ elem.type }}</td>
      <td v-html="elem.text" />
      <td><code v-if="elem.example !== undefined">{{ JSON.stringify(elem.example) }}</code></td>
     </tr>
    </template>
   </tbody>
  </table>
 </div>
</template>
