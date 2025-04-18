<script setup>
import { data } from '../lib/data/settings.data.js'

/* Properties for this component:
 * 'filter' (string): One of three options, 'all' (DEFAULT), 'advanced', or
 *                    'no_advanced.
 * 'level' (integer): The header level to display entries as. Default: '2'
 * 'plugin' (string): Filter entries by this plugin.
 * 'show_plugin' (boolean): If set, add plugin name to output.
 * 'tag' (string | array): Filter by tag(s). Tag(s) matches either plugin
 * OR tag field.
 */
const props = defineProps(
    ['filter', 'level', 'plugin', 'show_plugin', 'tag']
)

const filter = props.filter ?? 'all'
const level = `h${(props.level ? Number(props.level) : 2) + 1}`
const tag = props.tag ? [ props.tag ].flat() : false

const d = Object.fromEntries(Object.entries(data).filter(([k, v]) =>
	/* Filter entries (by plugin or tag). */
	((!props.plugin && !tag) ||
	 (props.plugin &&
	  (v.plugin && v.plugin.includes(props.plugin))) ||
	 (tag && tag.find((t) =>
	  (v.plugin && v.plugin.includes(t)) ||
	  (v.tags.includes(t)))
	 )) &&
	/* Apply filter. */
	((filter == 'all') ||
	 ((filter == 'advanced') && v.advanced) ||
	 ((filter == 'no_advanced') && !v.advanced))
).sort())
</script>

<style scoped>
.comma ~ .comma::before {
  content: ', ';
}
.badgePadding :deep(.VPBadge) {
  margin-right: 4px;
}
.badgePadding :deep(p) {
  margin: 4px;
}
.settingsList article:first-of-type {
  border-top-width: 0;
}
.settingsList article {
  border-top: 1px solid var(--vp-c-divider);
}
.settingsList h3 {
  margin-top: 18px;
}
.settingsListTable th {
  text-align: right;
}
.settingsListTable :deep(ul) {
  margin: 0;
}
.advancedWarn {
  color: var(--vp-custom-block-danger-text);
  background-color: var(--vp-custom-block-danger-bg);
}
</style>

<template>
 <section class="settingsList">
  <article v-for="(v, k) in d">
   <component :is="level" :id="k" tabindex="-1">
    <code>{{ k }}</code>
    <a class="header-anchor" :href="'#' + k"></a>
   </component>

   <table class="settingsListTable">
    <tbody>
     <tr v-if="!v.no_default">
      <th>Default</th>
      <td>
       <span v-if="v.default !== undefined && (v.default != '')" v-html="v.default" />
       <em v-else>[None]</em>
      </td>
     </tr>
     <tr>
      <th>Value</th>
      <td>
       <span class="comma" v-for="v in v.values" v-html="v.url" />
      </td>
     </tr>
     <tr v-if="v.values_enum.length">
      <th>Allowed Values</th>
      <td>
       <span class="comma" v-for="v in v.values_enum.values()"><code>{{ v }}</code></span>
      </td>
     </tr>
     <tr v-if="v.dependencies.length">
      <th>Dependencies</th>
      <td>
       <ul>
        <li v-for="v in v.dependencies" v-html="v" />
       </ul>
      </td>
     </tr>
     <tr v-if="v.seealso.length">
      <th>See Also</th>
      <td>
       <ul>
        <li v-for="v in v.seealso" v-html="v" />
       </ul>
      </td>
     </tr>
     <tr v-if="props.show_plugin && v.plugin">
      <th>Plugin</th>
      <td v-html="v.plugin_link" />
     </tr>
     <tr v-if="v.added || v.changed || v.deprecated || v.removed">
      <th>Changes</th>
      <td>
       <ul class="badgePadding">
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
     <tr v-if="v.advanced">
      <td class="advancedWarn" colspan="2">
       Advanced Setting; this should not normally be changed.
      </td>
     </tr>
    </tbody>
   </table>

   <div v-html="v.text" />

  </article>
 </section>
</template>
