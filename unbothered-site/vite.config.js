import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './', // relative asset URLs so the build works from any sub-path
  plugins: [react()],
})
