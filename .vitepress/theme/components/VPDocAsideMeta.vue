<!-- Derived from https://github.com/brenoepics/vitepress-carbon (MIT, Copyright © 2024 Breno A.) -->
<script setup>
import { computed, ref, watchEffect, onMounted } from 'vue'
import { useData } from 'vitepress'
import VPLlmsPageActions from './VPLlmsPageActions.vue'

const props = defineProps({
  revision: { type: String, default: '' }
})

const { theme, page, frontmatter, lang } = useData()

const hasEditLink = computed(
  () => theme.value.editLink && frontmatter.value.editLink !== false
)
const hasLastUpdated = computed(() => page.value.lastUpdated)

// Inline useEditLink composable
const editLink = computed(() => {
  const cfg = theme.value.editLink || {}
  const text = cfg.text || 'Edit this page'
  const pattern = cfg.pattern || ''
  let url
  if (typeof pattern === 'function') {
    url = pattern(page.value)
  } else {
    url = pattern.replace(/:path/g, page.value.filePath)
  }
  return { url, text }
})

// Inline VPDocFooterLastUpdated
const date = computed(() => new Date(page.value.lastUpdated))
const isoDatetime = computed(() => date.value.toISOString())
const datetime = ref('')
onMounted(() => {
  watchEffect(() => {
    datetime.value = new Intl.DateTimeFormat(
      theme.value.lastUpdated?.formatOptions?.forceLocale ? lang.value : undefined,
      theme.value.lastUpdated?.formatOptions ?? {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    ).format(date.value)
  })
})
const lastUpdatedLabel = computed(
  () => theme.value.lastUpdated?.text || theme.value.lastUpdatedText || 'Updated'
)
</script>

<template>
 <template v-if="hasEditLink || hasLastUpdated || props.revision">
  <div class="VPDocAsideMeta">
   <div class="meta-box">
    <div class="meta-row meta-llms">
     <VPLlmsPageActions />
    </div>
    <a v-if="hasEditLink" :href="editLink.url" class="meta-row meta-link" target="_blank" rel="noopener">
     <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
     <p>{{ editLink.text }}</p>
    </a>
    <div v-if="hasLastUpdated" class="meta-row meta-static">
     <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
     <p>{{ lastUpdatedLabel }}: <time :datetime="isoDatetime">{{ datetime }}</time></p>
    </div>
    <div v-if="revision" class="meta-row meta-static">
     <svg class="meta-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
     <p>Revision: {{ revision }}</p>
    </div>
   </div>
  </div>
 </template>
</template>

<style scoped>
.VPDocAsideMeta {
  margin-bottom: 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.meta-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 32px;
  font-size: 14px;
  font-weight: 500;
  padding: 4px 0;
}

.meta-icon {
  flex-shrink: 0;
  color: var(--vp-c-text-3);
}

.meta-link {
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.25s;
}

.meta-link:hover {
  color: var(--vp-c-brand-1);
}

.meta-static {
  color: var(--vp-c-text-2);
  line-height: normal;
}

.meta-static p {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
}

.meta-llms {
  padding: 0 0 4px 0;
}

.meta-llms :deep(.VPLlmsPageActions) {
  width: 100%;
}

.meta-llms :deep(.trigger) {
  width: 100%;
  justify-content: flex-start;
  padding: 4px 8px;
}

.meta-llms :deep(.trigger-caret) {
  margin-left: auto;
}

.meta-llms :deep(.menu) {
  left: 0;
  right: auto;
}
</style>
