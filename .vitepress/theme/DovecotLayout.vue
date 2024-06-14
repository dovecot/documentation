<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'

const { theme } = useData()
const { Layout } = DefaultTheme
</script>

<template>
 <Layout>
  <template #doc-footer-before>
   <div class="edit-info">
    <div :class="'edit-rev edit-rev-' + theme.gitrev.align">
     <div>
      <p class="edit-updated">Revision: {{ theme.gitrev.hash }}</p>
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
