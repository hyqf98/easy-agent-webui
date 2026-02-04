import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import {fileURLToPath, URL} from 'node:url'
// 引入 mock 插件

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  console.log('[Vite Config] 环境:', mode)
  console.log('[Vite Config] VITE_API_BASE_URL:', `"${env.VITE_API_BASE_URL}"`)

  return {
    plugins: [
      vue(),
      // Mock 插件配置（已禁用，连接真实后端）
      // viteMockServe({
      //   mockPath: 'mock',
      //   logger: true,
      //   watchFiles: true
      // }),
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
        // API代理 - 转发到后端，去掉 /api 前缀
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://127.0.0.1:20000',
          changeOrigin: true,
          ws: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        }
      }
    },
  }
})
