import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '#store': path.resolve(__dirname, 'src/store'),
            '#store/*': path.resolve(__dirname, 'src/store/*'),
            '#presentation': path.resolve(__dirname, 'src/presentation'),
            '#presentation/*': path.resolve(__dirname, 'src/presentation/*'),
            '#components': path.resolve(
                __dirname,
                'src/presentation/components',
            ),
            '#components/*': path.resolve(
                __dirname,
                'src/presentation/components/*',
            ),
            '#pages': path.resolve(__dirname, 'src/presentation/pages'),
            '#pages/*': path.resolve(__dirname, 'src/presentation/pages/*'),
            '#layout': path.resolve(__dirname, 'src/presentation/view/layout'),
            '#layout/*': path.resolve(
                __dirname,
                'src/presentation/view/layout/*',
            ),
            '#api': path.resolve(__dirname, 'src/api'),
            '#api/*': path.resolve(__dirname, 'src/api/*'),
            '#hooks': path.resolve(__dirname, 'src/api/hooks'),
            '#hooks/*': path.resolve(__dirname, 'src/api/hooks/*'),
            '#config': path.resolve(__dirname, 'src/constants'),
            '#config/*': path.resolve(__dirname, 'src/constants/*'),
            '#utils': path.resolve(__dirname, 'src/utils'),
            '#utils/*': path.resolve(__dirname, 'src/utils/*'),
            '#types': path.resolve(__dirname, 'src/api/types'),
            '#types/*': path.resolve(__dirname, 'src/api/types/*'),
            '#constants': path.resolve(__dirname, 'src/constants'),
            '#constants/*': path.resolve(__dirname, 'src/constants/*'),
            '#models': path.resolve(__dirname, 'src/presentation/models'),
            '#models/*': path.resolve(__dirname, 'src/presentation/models/*'),
            '#icons': path.resolve(__dirname, 'src/icons'),
            '#icons/*': path.resolve(__dirname, 'src/icons/*'),
        },
    },
});
