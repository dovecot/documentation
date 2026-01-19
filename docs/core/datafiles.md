---
layout: doc
title: Raw Data Files
---

<script setup>
import { data } from '../../lib/data/datafiles.data.js'
import { withBase } from 'vitepress'
</script>

# Raw Data Files

This page provides download links to the raw data files used to generate the
Dovecot documentation.

The format and content of each data file is available by looking at the data
file source in GitHub (links for each file below).

## Data File List

<table>
 <thead>
  <tr>
   <th>File</th>
   <th>Source</th>
  </tr>
 </thead>
 <tbody>
  <tr v-for="file in data.files">
   <td>
    <code>
     <a :href="withBase(file.download)" target="_blank" rel="noreferrer">{{ file.name }}</a>
    </code>
   </td>
   <td>
    <a :href="file.github" target="_blank" rel="noreferrer">Source</a>
   </td>
  </tr>
 </tbody>
</table>
