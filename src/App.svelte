<script lang="ts">
  import { directoryOpen } from 'browser-fs-access'
	import sortPaths from 'sort-paths/sort-paths'
  import Icon from '@iconify/svelte';
  import CopyToClipboard from "svelte-copy-to-clipboard";
  import delay from "./utils/delay";
  import { JSONEditor } from 'svelte-jsoneditor'

	let isLoading, dirList
	let finishedParsing = false

  let content = {
    json: {},
    mode: 'code',
  }

  let showCopySuccess = {
    list: false,
		json: false,
	}

  const onClickOpen = async () => {
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

    sortedPaths.forEach(path => {
      path.split('/').reduce((r, name) => {
        if (!r[name]) {
          r[name] = {result: []};
					r.result.push({name, children: r[name].result})
        }

        return r[name];
      }, level)
    })

    dirList = sortedPaths.join('\n')
    content.json = result
    logJson(result, dirList)
    onFinishParsing()
  }

  const onFinishParsing = () => {
    isLoading = false
    finishedParsing = true
  }

  const logJson = (json: Object, dirList: String) => {
    const style = 'background: unset; color: white; font-weight: bold; font-size: 1.5em;'
    console.log(`%cfolder2json`, style)
		console.log('%cPath list:\n ', style, dirList)
		console.log('%cJSON:\n ', style, json)
	}

  const reset = () => {
    dirList = null
		content.json = {}
    isLoading = false
    finishedParsing = false
  }

  const onCopy = async (type: 'json' | 'list') => {
    showCopySuccess[type] = true
    await delay(1000)
    showCopySuccess[type] = false
  }

  const onCopyFail = () => {
    alert('Failed to copy!')
  }
</script>

<main>
	{#if !finishedParsing}
		<div class="f2j-open">
			<h2>
				folder2json
				<Icon icon="cil:folder-open" inline={true} />
				<Icon icon="akar-icons:arrow-right" inline={true} />
				<Icon icon="mdi:code-json" inline={true} />
			</h2>
			{#if isLoading}
				<div class="f2j-open__loading">
					Loading <Icon icon="eos-icons:loading" inline={true} />
				</div>
			{/if}
			{#if !isLoading}
				<button on:click={onClickOpen}>Open a Folder</button>
			{/if}
			<a class="f2j-github-link" href="https://github.com/x8BitRain/folder2json">
				Github
				<Icon icon="akar-icons:github-fill" inline={true} />
			</a>
		</div>
	{/if}

	{#if finishedParsing}
		<div class="f2j-json-actions">
			<CopyToClipboard
				text={JSON.stringify(content.json)}
				on:copy={() => onCopy('json')}
				on:fail={onCopyFail}
				let:copy
			>
				<button on:click={copy}>
					copy json
					{#if showCopySuccess.json}
						<Icon icon="bi:check-lg" inline={true} />
					{/if}
				</button>
			</CopyToClipboard>

			<CopyToClipboard
				text={dirList}
				on:copy={() => onCopy('list')}
				on:fail={onCopyFail}
				let:copy
			>
				<button on:click={copy}>
					copy dir list
					{#if showCopySuccess.list}
						<Icon icon="bi:check-lg" inline={true} />
					{/if}
				</button>
			</CopyToClipboard>

			<button on:click={reset}>reset</button>
		</div>
	{/if}

	{#if finishedParsing}
		<div class="f2j-json-container">
			<h2>
				folder2json
				<Icon icon="cil:folder-open" inline={true} />
				<Icon icon="akar-icons:arrow-right" inline={true} />
				<Icon icon="mdi:code-json" inline={true} />
			</h2>
			<h3>json editor</h3>
			<JSONEditor {content} mode="code" />
		</div>
		<div class="f2j-dir-list">
			<h3>file path list</h3>
			<textarea readonly>
				{dirList}
			</textarea>
			<br/>
			<br/>
			<br/>
			<a class="f2j-github-link" href="https://github.com/x8BitRain/folder2json">
				Github
				<Icon icon="akar-icons:github-fill" inline={true} />
			</a>
		</div>
	{/if}
</main>

<style>
	.f2j-open {
		display: grid;
		place-content: center;
		height: 90vh;
	}

	.f2j-open .f2j-github-link {
    position: absolute;
		bottom: 16px;
		left: 16px;
	}

	.f2j-github-link, .f2j-open > .f2j-github-link {
		color: deepskyblue;
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

  @media only screen and (max-width: 600px) {
    .f2j-json-actions {
      position: fixed;
      right: 30px;
      bottom: 30px;
			top: unset;
      z-index: 10;
    }
  }

	.f2j-open button, .f2j-json-actions button{
    color: #fff;
    border: 0;
    border-radius: 4px;
    padding: 8px;
    background-color: #008ee7;
    cursor: pointer;
	}

	.f2j-dir-list {
		margin: 30px;
	}

	.f2j-dir-list textarea {
		width: 100%;
		height: 500px;
		color: #fff;
		border-radius: 4px;
		background-color: #000;
		border-color: #0090eb;
	}
</style>
