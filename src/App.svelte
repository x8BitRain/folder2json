<script lang="ts">
  import { directoryOpen } from 'browser-fs-access'
	import sortPaths from 'sort-paths/sort-paths'
  import Icon from '@iconify/svelte';
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import delay from "./utils/delay";
  import { JSONEditor } from 'svelte-jsoneditor'

	let isLoading, jsonData, dirList
	let finishedParsing, showCopySuccess = false

  let content = {
    json: {},
    mode: 'code',
  }

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
    let result = [];
    let level = { result };
    dirList = sortedPaths.join('\n')

    paths.forEach(path => {
      path.split('/').reduce((r, name, i, a) => {
        if(!r[name]) {
          r[name] = {result: []};
          r.result.push({name, children: r[name].result})
        }

        return r[name];
      }, level)
    })

    jsonData = result
    console.log(result);
    content.json = result
    setupFormattedJSON(jsonData)
    logJson()
  }

  const setupFormattedJSON = (json) => {
    isLoading = false
    finishedParsing = true
  }

  const logJson = () => {
    console.log(
      `%cfolder2json:`,
      'background: unset; color: white; font-weight: bold; font-size: 1.5em;'
    )
		console.log(jsonData)
	}

  const reset = () => {
    jsonData = null;
    isLoading = false
    finishedParsing = false
    showCopySuccess = false
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

	{#if finishedParsing}
		<div class="f2j-json-container">
			<h3>json editor</h3>
			<JSONEditor {content} mode="code" />
		</div>
		<div class="f2j-dir-list">
			<h3>file path list</h3>
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

	.f2j-dir-list {
		margin: 30px;
	}

	.f2j-dir-list textarea {
		width: 100%;
		height: 500px;
		color: #fff;
		border-radius: 4px;
		background-color: #2c2c2c;
		border-color: #0090eb;
	}
</style>
