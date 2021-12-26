<script lang="ts">
  import { directoryOpen } from 'browser-fs-access'
  import JSONFormatter from 'json-formatter-js'
	import sortPaths from 'sort-paths/sort-paths'
  import Icon from '@iconify/svelte';
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import delay from "./utils/delay";

	let isLoading, jsonContainer, json, dirList
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
    dirList = sortedPaths.join('\n')
    json = {};
    sortedPaths.forEach(path => {
      let levels = path.split("/");
      let file = levels.pop();

      levels.reduce((prev, lvl, i) => {
        return prev[lvl] = (levels.length - i - 1) ? prev[lvl] || {} : (prev[lvl] || [])?.concat([file]);
      }, json);
    });
    setupFormattedJSON(json)
    logJson()
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

  const logJson = () => {
    console.log(
      `%cfolder2json:`,
      'background: unset; color: white; font-weight: bold; font-size: 1.5em;'
    )
		console.log(json)
	}

  const reset = () => {
		json = null;
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
			<p>json object output in browser console</p>
			<CopyToClipboard text={dirList} on:copy={onCopy} on:fail={() => alert('Failed to copy!')} let:copy>
				<button on:click={copy}>
					Copy dir list
					{#if showCopySuccess}
						<Icon icon="bi:check-lg" inline={true} />
					{/if}
				</button>
			</CopyToClipboard>
			<button on:click={reset}>Reset</button>
		</div>
	{/if}
	<div class="f2j-json-container" bind:this={jsonContainer}></div>
	{#if finishedParsing}
		<div class="f2j-dir-list">
			<textarea readonly>
				{dirList}
			</textarea>
		</div>
	{/if}
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

	.f2j-json-actions p {
		color: #fff;
	}

	.f2j-dir-list {
		margin: 30px;
	}

	.f2j-dir-list textarea {
		width: 100%;
		height: 500px;
		color: #fff;
		border-radius: 4px;
		background-color: #2c2c2c;
	}
</style>
