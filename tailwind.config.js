import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
                display: ['"Reem Kufi Fun"', 'serif'],
                quran: ['Amiri', 'serif'],
            },
        },
        screens: {
            ...defaultTheme.screens,
            '3xl': '1920px',
            '4xl': '2560px',
        },
    },

    plugins: [forms, daisyui],
    daisyui: {
        themes: [
            {
                deenmate: {
                    primary: '#047857',
                    'primary-content': '#ffffff',
                    secondary: '#0f766e',
                    'secondary-content': '#ffffff',
                    accent: '#f59e0b',
                    'accent-content': '#1c1917',
                    neutral: '#1f2937',
                    'neutral-content': '#f9fafb',
                    'base-100': '#fdfaf3',
                    'base-200': '#f5efe1',
                    'base-300': '#e8dfc9',
                    'base-content': '#1c1917',
                    info: '#7c3aed',
                    'info-content': '#ffffff',
                    success: '#047857',
                    'success-content': '#ffffff',
                    warning: '#f59e0b',
                    'warning-content': '#1c1917',
                    error: '#dc2626',
                    'error-content': '#ffffff',
                    '--rounded-box': '1.25rem',
                },
            },
            'dark',
        ],
        logs: false,
        base: true,
        styled: true,
        utils: true,
    },
};
