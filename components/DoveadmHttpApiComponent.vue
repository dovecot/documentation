<script setup>
import { computed } from 'vue'

/* Properties for this component:
 * 'data' (object): The command argument data.
 *
 * Note: Clipboard behavior is handled by re-using the Vitepress code.
 */
const props = defineProps(['data'])
const d = computed(() => props.data)

const jsonReq = computed(() => {
	const args = {}
	for (let elem of d.value.args.filter(e => e.example !== undefined && !e.cli_only)) {
		args[elem.param] = elem.example
	}

	return [
		d.value.http_cmd,
		args,
		"tag1"
	]
})

const jsonResp = computed(() => d.value.response?.example
	? [ [ "doveadmResponse", [ d.value.response.example ], "tag1" ] ]
	: null
)

const examples = computed(() => {
	const reqStr = JSON.stringify(jsonReq.value)
	return [
		{
			title: 'Example Curl Request (using Dovecot API Key)',
			code: `curl -X POST -H "Authorization: X-Dovecot-API <base64 encoded dovecot_api_key>" -H "Content-Type: application/json" -d '${reqStr}' http://example.com:8080/doveadm/v1`
		},
		{
			title: 'Example Curl Request (using Doveadm Password)',
			code: `curl -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '${reqStr}' http://example.com:8080/doveadm/v1`
		},
		{
			title: 'Example Wget Request (using Dovecot API Key)',
			code: `wget --header="Authorization: X-Dovecot-API <base64 encoded dovecot_api_key>" --header="Content-Type: application/json" --post-data='${reqStr}' --output-document - http://example.com:8080/doveadm/v1`
		},
		{
			title: 'Example Wget Request (using Doveadm Password)',
			code: `wget --header="Content-Type: application/json" --user=doveadm --password=password --auth-no-challenge --post-data='${reqStr}' --output-document - http://example.com:8080/doveadm/v1`
		}
	]
})

</script>

<template>
 <div>
  <p class="custom-block-title">
   Command Name: <code>{{ d.http_cmd }}</code>
  </p>

  <table>
   <thead>
    <tr>
     <th>Parameter</th>
     <th>Type</th>
     <th>Description</th>
     <th>Example</th>
    </tr>
   </thead>
   <tbody>
    <template v-for="elem in d.args">
     <tr v-if="!elem.cli_only">
      <td><code>{{ elem.param }}</code></td>
      <td>{{ elem.type }}</td>
      <td v-html="elem.text" />
      <td><code v-if="elem.example">{{ JSON.stringify(elem.example) }}</code></td>
     </tr>
    </template>
   </tbody>
  </table>

  <p class="custom-block-title">Example Request Payload</p>

  <div class="language- vp-adaptive-theme">
   <button class="copy" title="Copy" />
   <span class="lang"></span>
   <pre><code>{{ JSON.stringify(jsonReq, null, 4) }}</code></pre>
  </div>

  <template v-for="ex in examples">
   <p class="custom-block-title">{{ ex.title }}</p>

   <div class="language- vp-adaptive-theme">
    <button class="copy" title="Copy" />
    <span class="lang"></span>
	<pre><code>{{ ex.code }}</code></pre>
   </div>
  </template>

  <template v-if="d.response">
   <p class="custom-block-title">Example Server Response</p>

   <div v-html="d.response.text" />

   <div class="language- vp-adaptive-theme" v-if="jsonResp">
    <button class="copy" title="Copy" />
    <span class="lang"></span>
     <pre><code>{{ JSON.stringify(jsonResp, null, 4) }}</code></pre>
   </div>
  </template>
 </div>
</template>
