<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { nextTick, watch } from 'vue'
import { createMermaidRenderer } from 'vitepress-mermaid-renderer'

import VersionDropdown from './VersionDropdown.vue'
import VPDocAsideMeta from './VPDocAsideMeta.vue'

const { site, theme } = useData()
const { Layout } = DefaultTheme

const initMermaid = () => {
  if (typeof window === "undefined") return
  const renderer = createMermaidRenderer({
    theme: "neutral",
  })
  renderer.setToolbar({
    showLanguageLabel: true,
    downloadFormat: "png",
    desktop: {
      positions: { vertical: "bottom", horizontal: "right" },
    }
  })
}

nextTick(() => initMermaid())
watch(() => initMermaid())

const re = new RegExp("^[/][0-9.]+[/]?$")
const prod = re.test(site._value.base)
const latest = site._value.themeConfig.dovecot.base_url + "/latest/"

</script>

<template>
 <Layout>
  <template #nav-bar-content-before>
   <VersionDropdown />
  </template>
  <template #nav-screen-content-before>
   <VersionDropdown is-mobile />
  </template>

  <template #doc-before v-if="!prod">
   <div class="container custom-block warning large">
    <p>
     Note: This is pre-release documentation.<br/>
     Please access <a :href="latest" target="_blank">{{ latest }}</a> for documentation on released versions.
    </p>
   </div>
  </template>

  <template #aside-top>
   <VPDocAsideMeta :revision="theme.dovecot.gitrev.hash" />
  </template>
 </Layout>
</template>

<style scoped>
</style>
