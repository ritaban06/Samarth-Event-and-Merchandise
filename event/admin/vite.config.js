import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
    port: 3001
  },
  resolve: {
    alias: {
      '@mui/x-date-pickers': '@mui/x-date-pickers',
      '@mui/x-date-pickers/AdapterDateFns': '@mui/x-date-pickers/AdapterDateFns'
    }
  }
})
