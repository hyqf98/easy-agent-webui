import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'
// 引入 mock 插件
import { viteMockServe } from 'vite-plugin-mock'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [
      vue(),
      // Mock 插件配置
      viteMockServe({
        mockPath: 'mock',
        logger: true,
        watchFiles: true
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()],
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/auto-imports.d.ts',
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
        deep: false,
        extensions: ['vue'],
        include: [/\.vue$/],
        exclude: [
          /[\\/]node_modules[\\/]/,
          /[\\/]\.git[\\/]/,
          /[\\/]\.nuxt[\\/]/,
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: true,
      port: 10000,
      proxy: {
        // API 代理 - 根据路径判断转发目标
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://127.0.0.1:20000',
          changeOrigin: true,
          ws: true,
          // rewrite: (path) => path  // 保持原路径，让后端处理 /api 和 /api/mock
        }
      }
    },
  }
})
