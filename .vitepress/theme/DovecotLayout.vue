<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { nextTick, watch } from 'vue'
import { createMermaidRenderer } from 'vitepress-mermaid-renderer'

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
  <template #doc-before v-if="!prod">
   <div class="container custom-block warning large">
    <p>
     Note: This is pre-release documentation.<br/>
     Please access <a :href="latest" target="_blank">{{ latest }}</a> for documentation on released versions.
    </p>
   </div>
  </template>

  <template #doc-footer-before>
   <div class="edit-info">
    <div :class="'edit-rev edit-rev-' + theme.dovecot.gitrev.align">
     <div>
      <p class="edit-updated">Revision: {{ theme.dovecot.gitrev.hash }}</p>
     </div>
    </div>
   </div>
  </template>
 </Layout>
</template>

<style scoped>
.edit-rev {
  padding-bottom: 18px;
}

@media (min-width: 640px) {
  .edit-rev {
    display: flex;
    align-items: center;
    padding-bottom: 0;
  }
  .edit-rev-left {
    justify-content: left;
  }
  .edit-rev-right {
    justify-content: right;
  }
}
.edit-updated {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-2);
}
@media (min-width: 640px) {
  .edit-updated {
    line-height: 32px;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
