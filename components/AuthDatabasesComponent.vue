<script setup>
import { data } from '../lib/data/auth_databases.data.js'
import { withBase } from 'vitepress'
</script>

<template>
 <ul>
  <li v-for="db in data" :key="db.url">
   <a :href="withBase(db.url)">{{ db.title }}</a>
  </li>
 </ul>
</template>
