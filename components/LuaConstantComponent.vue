<script setup>
import { data } from '../lib/data/lua.data.js'

/* Properties for this component:
 * 'level' (integer): The header level to display entries as. Default: '2'
 * 'tag' (string): Filter by tag property.
 */
const props = defineProps(['level', 'tag'])
const level = (props.level ? Number(props.level) : 2) + 1

const d = Object.fromEntries(Object.entries(data.constants).filter(([k, v]) =>
	/* Filter entries (by tag). */
	!props.tag || (v.tags === props.tag)
))
</script>

<template>
 <template v-for="(v, k) in d">
  <div class="lua-constant-separator" />

  <component :is="'h' + level" :id="k" tabindex="-1">
   enum <code>{{ k }}</code>
   <a class="header-anchor" :href="'#' + k"></a>
  </component>

  <span if="v.text" v-html="v.text"></span>
 </template>
</template>

<style scoped>
.lua-constant-separator {
  border-top: 1px solid #e2e2e3;
  margin: 15px auto;
  width: 75%;
}
</style>
