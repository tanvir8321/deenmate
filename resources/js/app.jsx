import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'DeenMate';

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
    import('virtual:pwa-register').then(({ registerSW }) => {
        registerSW({
            onNeedRefresh() {
                if (confirm('New version available. Reload?')) {
                    window.location.reload();
                }
            },
            onOfflineReady() {
                console.info('App ready to work offline.');
            },
        });
    });
}

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});