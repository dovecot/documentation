<script setup>
import { data } from '../lib/data/settings.data.js'

/* Properties for this component:
 * 'filter' (string): One of three options, 'all' (DEFAULT), 'advanced', or
 *                    'no_advanced.
 * 'level' (integer): The header level to display entries as. Default: '2'
 * 'plugin' (string): Filter entries by this plugin.
 * 'show_plugin' (boolean): If set, add plugin name to output.
 * 'tag' (string): Filter by tag. Tag matches either plugin OR tag field.
 */
const props = defineProps(
    ['filter', 'level', 'plugin', 'show_plugin', 'tag']
)

const filter = props.filter ?? 'all'
const level = (props.level ? Number(props.level) : 2) + 1

const d = Object.fromEntries(Object.entries(data).filter(([k, v]) =>
	/* Filter entries (by plugin or tag). */
	((!props.plugin && !props.tag) ||
	 (props.plugin &&
	  (v.plugin && v.plugin.includes(props.plugin))) ||
	 (props.tag &&
	  ((v.plugin && v.plugin.includes(props.tag)) ||
	   (v.tags.includes(props.tag))))) &&
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
.dovecotSettings :deep(ul) {
  margin: 0;
}
.advancedWarn {
  color: var(--vp-custom-block-danger-text);
  background-color: var(--vp-custom-block-danger-bg);
}
</style>

<template>
 <template v-for="(v, k) in d">
  <component :is="'h' +  level" :id="k" tabindex="-1">
   <code>{{ k }}</code>
   <a class="header-anchor" :href="'#' + k"></a>
  </component>

  <table class="dovecotSettings">
   <tbody>
    <tr>
     <th style="text-align:right;">Default</th>
     <td>
      <span v-if="v.default" v-html="v.default" />
      <em v-else>[None]</em>
     </td>
    </tr>
    <tr>
     <th style="text-align:right;">Value</th>
     <td>
      <span class="comma" v-for="v in v.values" v-html="v.url" />
     </td>
    </tr>
    <tr v-if="v.values_enum.length">
     <th style="text-align:right;">Allowed Values</th>
     <td>
      <span class="comma" v-for="v in v.values_enum.values()"><code>{{ v }}</code></span>
     </td>
    </tr>
    <tr v-if="v.seealso.length">
     <th style="text-align:right;">See Also</th>
     <td>
      <ul>
       <li v-for="v in v.seealso" v-html="v" />
      </ul>
     </td>
    </tr>
    <tr v-if="props.show_plugin && v.plugin">
     <th style="text-align:right;">Plugin</th>
     <td v-html="v.plugin_link" />
    </tr>
    <tr v-if="v.added || v.changed || v.deprecated || v.removed">
     <th style="text-align:right;">Changes</th>
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

  <span v-html="v.text" />
 </template>
</template>
