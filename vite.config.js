import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

function mindArThreeFix() {
    return {
        name: 'mind-ar-three-fix',
        transform(code, id) {
            if (id.includes('mind-ar')) {
                return {
                    code: code.replace(/sRGBEncoding as/g, 'SRGBColorSpace as'),
                    map: null
                };
            }
        }
    };
}

export default defineConfig({
    plugins: [
        mindArThreeFix(),
        laravel({
            input: 'resources/js/app.tsx',
            refresh: true,
        }),
        react(),
    ],
});
