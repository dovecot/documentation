<script setup>
/* Properties for this component:
 * 'data' (object): The command argument data.
 *
 * Note: Clipboard behavior is handled by re-using the Vitepress code.
 */
const props = defineProps(['data'])
const d = props.data

const args = {}
for (let elem of d.args.filter(e => e.example !== undefined && !e.cli_only)) {
	args[elem.param] = elem.example
}

const jsonReq =
[
	[
		d.http_cmd,
		args,
		"tag1"
	]
]

const jsonResp = d.response?.example
	? [ [ "doveadmResponse", [ d.response.example ], "tag1" ] ]
	: null

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

  <p class="custom-block-title">Example Curl Request (using Dovecot API Key)</p>

  <div class="language- vp-adaptive-theme">
   <button class="copy" title="Copy" />
   <span class="lang"></span>
   <pre><code>curl -X POST -H "Authorization: X-Dovecot-API &lt;base64 encoded dovecot_api_key&gt;" -H "Content-Type: application/json" -d '{{ JSON.stringify(jsonReq) }}' http://example.com:8080/doveadm/v1</code></pre>
  </div>

  <p class="custom-block-title">Example Curl Request (using Doveadm Password)</p>

  <div class="language- vp-adaptive-theme">
   <button class="copy" title="Copy" />
   <span class="lang"></span>
   <pre><code>curl -X POST -u doveadm:secretpassword -H "Content-Type: application/json" -d '{{ JSON.stringify(jsonReq) }}' http://example.com:8080/doveadm/v1</code></pre>
  </div>

  <p class="custom-block-title">Example Wget Request (using Dovecot API Key)</p>

  <div class="language- vp-adaptive-theme">
   <button class="copy" title="Copy" />
   <span class="lang"></span>
   <pre><code>wget --header="Authorization: X-Dovecot-API &lt;base64 encoded dovecot_api_key&gt;" --header="Content-Type: application/json" --post-data='{{ JSON.stringify(jsonReq) }}' --output-document - http://example.com:8080/doveadm/v1</code></pre>
  </div>

  <p class="custom-block-title">Example Wget Request (using Doveadm Password)</p>

  <div class="language- vp-adaptive-theme">
   <button class="copy" title="Copy" />
   <span class="lang"></span>
   <pre><code>wget --header="Content-Type: application/json" --user=doveadm --password=password --auth-no-challenge --post-data='{{ JSON.stringify(jsonReq) }}' --output-document - http://example.com:8080/doveadm/v1</code></pre>
  </div>

  <template v-if="d.response">
   <p class="custom-block-title">Example Server Response</p>

   <div v-html="d.response.text" />

   <div class="language- vp-adaptive-theme" v-id="jsonResp">
    <button class="copy" title="Copy" />
    <span class="lang"></span>
     <pre><code>{{ JSON.stringify(jsonResp, null, 4) }}</code></pre>
   </div>
  </template>
 </div>
</template>
