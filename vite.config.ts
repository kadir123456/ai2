import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // FIX: Replaced `process.cwd()` with `'.'` to resolve a TypeScript error where
  // `cwd` was not found on `process`. In Vite, `.` resolves to the project root,
  // achieving the same result.
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // Use VITE_API_KEY from environment and assign it to process.env.API_KEY
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY)
    }
  }
})