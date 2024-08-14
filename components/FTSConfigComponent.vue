<script setup>
/* Properties for this component:
 * 'default' (string): The configuration default
 * 'name' (string): The name of the configuration item.
 */
const props = defineProps(['default', 'name'])

</script>

<style scoped>
.fts-config-block {
  margin: 5px 25px;
}
</style>

<template>
 <div class="note custom-block fts-config-block">
  <code>{{ props.name }}</code>
  <ul>
   <li>Default: <code>{{ props.default }}</code></li>
  </ul>

  <slot />
 </div>
</template>
