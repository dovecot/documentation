<script setup>
import { data } from '../lib/data/doveadm.data.js'
import { computed, ref } from 'vue'

/* Properties for this component:
 * 'plugin' (string): Filter by the plugin property.
 * 'tag' (string): Filter by tag. Tag matches either plugin OR tag field.
 */
const props = defineProps(['plugin', 'tag'])

const d = computed(() => Object.entries(data.doveadm).filter(([k, v]) =>
	/* Filter entries by plugin or tag. */
	(!props.plugin && !props.tag) ||
	(v.plugin == (props.plugin || props.tag)) ||
	(props.tag && v.tags?.includes(props.tag))
).sort())
const responseFields = ref({})
function responseClick(k) {
	responseFields.value[k] = true
}

const cliComponent = ref({})
function cliClick(k) {
	cliComponent.value[k] = 'DoveadmCliComponent'
}

const httpComponent = ref({})
function httpClick(k) {
	httpComponent.value[k] = 'DoveadmHttpApiComponent'
}
</script>

<style scoped>
.doveadmList article:first-of-type {
  border-top-width: 0;
}
.doveadmList article {
  border-top: 1px solid var(--vp-c-divider);
}
.doveadmList h3 {
  margin-top: 18px;
}
</style>

<template>
 <section class="doveadmList">
  <article v-for="[k, v] in d">
   <h3 :id="k" tabindex="-1">
    <code>{{ k }}</code>
    <a class="header-anchor" :href="'#' + k"></a>
   </h3>

   <table v-if="v.man_link || v.added || v.changed || v.deprecated || v.removed">
    <tbody>
     <tr v-if="v.man_link">
      <th style="text-align: right;">Man Page</th>
      <td v-html="v.man_link" />
     </tr>

     <tr v-if="v.added || v.changed || v.deprecated || v.removed">
      <th style="text-align: right;">Changes</th>
      <td>
       <ul>
        <template v-for="[k2, elems] in [['added', v.added], ['changed', v.changed], ['deprecated', v.deprecated], ['removed', v.removed]]" :key="k2">
         <li v-for="elem in elems || []">
          <span v-html="elem.version" />
          <span v-html="elem.text" />
         </li>
        </template>
       </ul>
      </td>
     </tr>
    </tbody>
   </table>

   <div v-if="v.text" v-html="v.text" />

   <details @click.capture.once="responseClick(k)" class="details custom-block">
    <summary v-if="v.response?.type === 'list'">Response Fields <Badge type="info" text="List Response" /></summary>
    <summary v-else>Response Fields</summary>
    <div v-if="responseFields[k]">
     <p v-if="v.response === undefined">
      <Badge type="warning" text="undocumented" />
     </p>

     <p v-else-if="v.response === null">
      <small>No output.</small>
     </p>

     <template v-else-if="!v.response.fields">
      <p>This command does not produce JSON output.</p>
      <div v-if="v.response.note" v-html="v.response.note" />
     </template>

     <template v-else>
      <table>
       <thead>
        <tr>
         <th>Field</th>
         <th>Type</th>
         <th>Description</th>
        </tr>
       </thead>
       <tbody>
        <tr v-for="field in v.response.fields" :key="field.name">
         <td>
          <code>{{ field.name }}</code>
          <Badge v-if="field.dynamic" type="warning" text="conditional" />
         </td>
         <td>{{ field.type }}</td>
         <td v-html="field.description" />
        </tr>
       </tbody>
      </table>

      <div v-if="v.response.note" v-html="v.response.note" />
     </template>
    </div>
   </details>

   <details @click.capture.once="cliClick(k)" class="details custom-block">
    <summary>CLI</summary>
    <component v-if="cliComponent[k]" :is="cliComponent[k]" :data="v" />
   </details>

   <details v-if="v.args && !v.cli_only_cmd" @click.capture.once="httpClick(k)" class="details custom-block">
    <summary v-html="data.http_api_link" />
    <component v-if="httpComponent[k]" :is="httpComponent[k]" :data="v" />
   </details>
  </article>
 </section>
</template>
