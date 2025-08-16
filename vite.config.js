import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Talk2Me/',   // ⬅️ add this line
  plugins: [react()],
})