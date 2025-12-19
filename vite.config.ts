
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Vercel에서 설정한 API_KEY를 클라이언트 코드에서 사용할 수 있게 매핑합니다.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
