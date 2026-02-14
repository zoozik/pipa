import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },

  preload: {
    plugins: [externalizeDepsPlugin()]
  },

  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        '@shared': resolve('shared'),
        '@logo': resolve('resources/icon.png'),
        '@Logo': resolve('resources/icon.png')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@renderer/styles/variables" as *; @use "@renderer/styles/extends" as *;'
        }
      }
    },
    plugins: [vue()]
  }
})
