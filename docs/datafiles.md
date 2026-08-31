---
layout: doc
title: Documentation Data
order: 500
---
# Raw Data Files

This page provides download links to the raw data files used to generate the
Dovecot documentation.

The format and content of each data file is available by looking at the data
file source in GitHub (links for each file below).

## Data File List

<RawDataFilesComponent :github="true" />

## LLM Resources

This documentation provides Large Language Model (LLM) friendly formats following the [/llms.txt standard](https://llmstxt.org/).

These resources provide structured, plain-text Markdown designed for ingestion by AI assistants, coding tools, and LLMs during inference time.

### Site-Wide LLM Files

- **[`llms.txt`](/llms.txt)**
  A curated index of all documentation pages, structured with summary information and direct links to clean Markdown versions of each page.

- **[`llms-full.txt`](/llms-full.txt)**
  A single aggregated text document containing the full concatenated content of all documentation pages, optimized for loading the entire site into an LLM context window at once.

### Page-Specific Markdown

Every page on this site has a corresponding clean Markdown version (`.md`).
