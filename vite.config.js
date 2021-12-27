import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteOptimizeDeps } from 'svelte-jsoneditor/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
	optimizeDeps: {
		include: [
			'diff-sequences',
			'ace-builds',
			...viteOptimizeDeps
		]
	}
})
