<script setup>
import { data } from '../lib/data/doveadm.data.js'
import { ref } from 'vue'

/* Properties for this component:
 * 'plugin' (string): Filter by the plugin property.
 * 'tag' (string): Filter by tag. Tag matches either plugin OR tag field.
 */
const props = defineProps(['plugin', 'tag'])

const d = Object.fromEntries(Object.entries(data.doveadm).filter(([k, v]) =>
	/* Filter entries by plugin or tag. */
	(!props.plugin && !props.tag) ||
	(props.plugin &&
	 (v.plugin && v.plugin == props.plugin)) ||
	(props.tag &&
	 ((v.plugin && v.plugin == props.tag) ||
	  (v.tags.includes(props.tag))))
).sort())

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
  <article v-for="(v, k) in d">
   <h3 :id="k" tabindex="-1">
    <code>{{ k }}</code>
    <a class="header-anchor" :href="'#' + k"></a>
   </h3>

   <table v-if="v.man_link || v.fields || v.added || v.changed || v.deprecated || v.removed">
    <tbody>
     <tr v-if="v.man_link">
      <th style="text-align: right;">Man Page</th>
      <td v-html="v.man_link" />
     </tr>

     <tr v-if="v.added || v.changed || v.deprecated || v.removed">
      <th style="text-align: right;">Changes</th>
      <td>
       <ul>
        <li v-if="v.added" v-for="elem in v.added">
         <span v-html="elem.version" />
         <span v-html="elem.text" />
        </li>
        <li v-if="v.changed" v-for="elem in v.changed">
         <span v-html="elem.version" />
         <span v-html="elem.text" />
        </li>
        <li v-if="v.deprecated" v-for="elem in v.deprecated">
         <span v-html="elem.version" />
         <span v-html="elem.text" />
        </li>
        <li v-if="v.removed" v-for="elem in v.removed">
         <span v-html="elem.version" />
         <span v-html="elem.text" />
        </li>
       </ul>
      </td>
    </tr>

     <tr v-if="v.fields">
      <th style="text-align: right;">Return Values</th>
      <td>
       <table>
        <thead>
         <tr>
          <th>Key</th>
          <th>Value</th>
         </tr>
        </thead>
        <tbody>
         <tr v-for="elem in v.fields">
          <td><code>{{ elem.key }}</code></td>
          <td v-html="elem.value" />
         </tr>
        </tbody>
       </table>
      </td>
     </tr>
    </tbody>
   </table>

   <div v-if="v.text" v-html="v.text" />

   <details @click.capture.once="cliClick(k)" class="details custom-block">
    <summary>CLI</summary>
    <component v-if="cliComponent[k]" :is="cliComponent[k]" :data="v" />
   </details>

   <details v-if="v.args" @click.capture.once="httpClick(k)" class="details custom-block">
    <summary v-html="data.http_api_link" />
    <component v-if="httpComponent[k]" :is="httpComponent[k]" :data="v" />
   </details>
  </article>
 </section>
</template>
