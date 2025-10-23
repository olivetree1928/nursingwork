import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nursingwork/', // 添加GitHub Pages的仓库名作为base路径
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
