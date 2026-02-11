import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig(async () => {
  const plugins = [react(), tailwindcss()]

  if (process.env.ANALYZE === 'true') {
    const { visualizer } = await import('vite-plugin-visualizer')
    plugins.push(
      visualizer({
        filename: 'dist/stats.html',
        gzipSize: true,
        brotliSize: true,
        open: false,
      })
    )
  }

  return { plugins }
})
