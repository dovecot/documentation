<script setup>
import { ref, onMounted, computed } from 'vue'
import { useData, withBase } from 'vitepress'

defineProps({
  isMobile: {
    type: Boolean,
    default: false
  }
})

const { site } = useData()

// Extract current version from site base path
const currentVersion = computed(() => {
  const base = site.value.base || '/'
  const clean = base.replace(/^\/|\/$/g, '')
  return clean || 'main'
})

const versionsData = ref([])
const openGroups = ref([])

onMounted(async () => {
  try {
    const versionsPath = import.meta.env.DEV
      ? withBase('versions.json')
      : '/versions.json'
    const response = await fetch(`${versionsPath}?t=${new Date().setHours(0, 0, 0, 0)}`)
    if (response.ok) {
      versionsData.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch versions:', error)
  }
})

const localeOpts = { numeric: true }
const groupedVersions = computed(() => {
  const groups = {}
  versionsData.value.forEach(v => {
    const match = v.match(/^3\.(\d+)\./)
    if (match) {
      const key = `3.${match[1]}`
      ;(groups[key] ||= []).push(v)
    }
  })

  return {
    groups: Object.keys(groups)
      .sort((a, b) => b.localeCompare(a, localeOpts))
      .map(minor => {
        const versions = groups[minor].sort((a, b) => b.localeCompare(a, localeOpts))
        return {
          latest: versions[0],
          rest: versions.slice(1).map(v => ({ text: v, link: `/${v}/` }))
        }
      }),
    others: [
      { text: '2.3', link: 'https://doc.dovecot.org/2.3/' },
      { text: 'main', link: '/main/' }
    ]
  }
})

const toggleGroup = (key) => {
  const idx = openGroups.value.indexOf(key)
  if (idx >= 0) {
    openGroups.value.splice(idx, 1)
  } else {
    openGroups.value.push(key)
  }
}
</script>

<template>
  <!-- Desktop Dropdown -->
  <div v-if="!isMobile" class="VPNavBarMenuGroup VPFlyout version-dropdown">
    <button type="button" class="button" aria-haspopup="true" aria-expanded="false">
      {{ currentVersion }}
      <span class="vpi-chevron-down text-icon" />
    </button>
    <div class="menu">
      <div class="VPMenu version-list">
        <!-- 3.x Groups (1st level: Latest version only) -->
        <div
          v-for="group in groupedVersions.groups"
          :key="group.latest"
          class="version-group"
        >
          <div class="version-row">
            <a class="link main-link" :href="`/${group.latest}/`">{{ group.latest }}</a>
            <button
              v-if="group.rest.length > 0"
              class="expand-btn"
              :aria-label="`Toggle older ${group.latest.slice(0, 3)} versions`"
              @click.stop="toggleGroup(group.latest)"
            >
              <svg class="chevron" :class="{ open: openGroups.includes(group.latest) }" viewBox="0 0 24 24" width="14" height="14">
                <path fill="currentColor" d="M7 10l5 5 5-5z"/>
              </svg>
            </button>
          </div>
          <!-- Older patch versions expanded inline -->
          <div v-show="openGroups.includes(group.latest)" class="older-versions">
            <a
              v-for="item in group.rest"
              :key="item.text"
              class="link older-link"
              :href="item.link"
            >
              {{ item.text }}
            </a>
          </div>
        </div>

        <!-- Static items (2.3, main) -->
        <div v-for="item in groupedVersions.others" :key="item.text" class="version-row">
          <a class="link main-link" :href="item.link">{{ item.text }}</a>
        </div>
      </div>
    </div>
  </div>

  <!-- Mobile Dropdown -->
  <div v-else class="version-dropdown-mobile">
    <div class="version-list">
      <div v-for="group in groupedVersions.groups" :key="group.latest" class="version-group">
        <div class="version-row">
          <a class="link main-link" :href="`/${group.latest}/`">{{ group.latest }}</a>
          <button
            v-if="group.rest.length > 0"
            class="expand-btn"
            @click.stop="toggleGroup(group.latest)"
          >
            <svg class="chevron" :class="{ open: openGroups.includes(group.latest) }" viewBox="0 0 24 24" width="14" height="14">
              <path fill="currentColor" d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
        </div>
        <div v-show="openGroups.includes(group.latest)" class="older-versions">
          <a v-for="item in group.rest" :key="item.text" class="link older-link" :href="item.link">{{ item.text }}</a>
        </div>
      </div>
      <div v-for="item in groupedVersions.others" :key="item.text" class="version-row">
        <a class="link main-link" :href="item.link">{{ item.text }}</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.version-dropdown {
  position: relative;
  margin-right: 16px;
}

.version-dropdown .button {
  display: flex;
  align-items: center;
  gap: 4px;
  height: var(--vp-nav-height);
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-text-1);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.25s;
}

.version-dropdown .button:hover {
  color: var(--vp-c-brand-1);
}

.version-dropdown .menu {
  position: absolute;
  top: calc(var(--vp-nav-height) / 2 + 15px);
  left: 0;
  display: none;
  border-radius: 12px;
  padding: 12px;
  min-width: 130px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-elv);
  box-shadow: var(--vp-shadow-3);
  z-index: 100;
}

.version-dropdown:hover .menu,
.version-dropdown:focus-within .menu {
  display: block;
}

@media (max-width: 767px) {
  .version-dropdown {
    display: none !important;
  }
}

.version-list {
  min-width: 130px;
}

.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 32px;
  padding: 0 12px;
}

.link {
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 500;
  transition: color 0.25s;
}

.link:hover {
  color: var(--vp-c-brand-1);
}

.main-link {
  flex-grow: 1;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  color: var(--vp-c-text-2);
  display: flex;
  align-items: center;
  transition: color 0.25s;
}

.expand-btn:hover {
  color: var(--vp-c-brand-1);
}

.chevron {
  transition: transform 0.25s;
}

.chevron.open {
  transform: rotate(180deg);
}

.older-versions {
  padding-left: 12px;
  border-left: 2px solid var(--vp-c-divider);
  margin: 4px 0 4px 16px;
}

.older-link {
  display: block;
  line-height: 28px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.older-link:hover {
  color: var(--vp-c-brand-1);
}

/* Mobile specific styling */
.version-dropdown-mobile {
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 8px 0;
  margin-bottom: 8px;
}
</style>

<style>
@media (min-width: 768px) {
  .VPNavBar .search {
    order: 1 !important;
    margin-left: auto !important;
  }
  .version-dropdown {
    order: 2 !important;
    margin-left: 16px !important;
    margin-right: 16px !important;
  }
  .VPNavBar .VPNavBarMenu,
  .VPNavBar .menu {
    order: 3 !important;
    margin-left: 0 !important;
    flex-grow: 0 !important;
  }
  .VPNavBar .appearance {
    order: 4 !important;
  }
  .VPNavBar .social-links {
    order: 5 !important;
  }
}
</style>
