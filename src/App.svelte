<script lang="ts">
  import { directoryOpen } from 'browser-fs-access'
  import JSONFormatter from 'json-formatter-js'
	import sortPaths from 'sort-paths/sort-paths'
  import Icon from '@iconify/svelte';
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import delay from "./utils/delay";

	let isLoading, jsonContainer, jsonText
	let finishedParsing, showCopySuccess = false

  const onClickOpen = async (e) => {
    isLoading = true
    const blobsInDirectory = await directoryOpen({
      recursive: true,
    });
		const paths = blobsInDirectory.map(e => e.webkitRelativePath)
    parseFilePaths(paths)
  }

  const parseFilePaths = (paths: String[]) => {
		const sortedPaths = sortPaths(paths, '/');
    let json = {};
    sortedPaths.forEach(path => {
      let levels = path.split("/");
      let file = levels.pop();

      levels.reduce((prev, lvl, i) => {
        return prev[lvl] = (levels.length - i - 1) ? prev[lvl] || {} : (prev[lvl] || [])?.concat([file]);
      }, json);
    });
    jsonText = JSON.stringify(json)
    setupFormattedJSON(json)
  }

  const setupFormattedJSON = (json) => {
    const formatter = new JSONFormatter(json, 10, {
      theme: 'dark',
      animateOpen: true,
      animateClose: true,
      useToJSON: true
    });

    jsonContainer.appendChild(formatter.render());
    isLoading = false
    finishedParsing = true
  }

  const reset = () => {
		jsonText = null;
    isLoading = false
    finishedParsing = false
    showCopySuccess = false
    jsonContainer.removeChild(jsonContainer.firstChild)
  }

  const onCopy = async () => {
    showCopySuccess = true
    await delay(1000)
    showCopySuccess = false
  }
</script>

<main>
	{#if !finishedParsing}
		<div class="f2j-open">
			<h2>folder2json <Icon icon="cil:folder-open" inline={true} /> <Icon icon="akar-icons:arrow-right" inline={true} />  <Icon icon="mdi:code-json" inline={true} /></h2>
			{#if isLoading}
				<div class="f2j-open__loading">
					Loading <Icon icon="eos-icons:loading" inline={true} />
				</div>
			{/if}
			<button on:click={onClickOpen}>Open a Folder</button>
		</div>
	{/if}
	{#if finishedParsing}
		<div class="f2j-json-actions">
			<CopyToClipboard text={jsonText} on:copy={onCopy} on:fail={() => alert('Failed to copy!')} let:copy>
				<button on:click={copy}>
					Copy JSON
					{#if showCopySuccess}
						<Icon icon="bi:check-lg" inline={true} />
					{/if}
				</button>
			</CopyToClipboard>
			<button on:click={reset}>Reset</button>
		</div>
	{/if}
	<div class="f2j-json-container" bind:this={jsonContainer}></div>
</main>

<style>
	.f2j-open {
		display: grid;
		place-content: center;
		height: 90vh;
	}

	.f2j-open h2, .f2j-open__loading {
		color: #fff;
    text-align: center;
  }

  .f2j-open__loading {
		margin-bottom: 24px;
	}

	.f2j-json-container {
		margin: 30px;
	}

	.f2j-json-actions {
		position: absolute;
		right: 30px;
		top: 30px;
	}
</style>
