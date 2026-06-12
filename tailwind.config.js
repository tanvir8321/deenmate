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
                    primary: '#059669',
                    'primary-content': '#ffffff',
                    secondary: '#2563eb',
                    'secondary-content': '#ffffff',
                    accent: '#d97706',
                    'accent-content': '#ffffff',
                    neutral: '#1f2937',
                    'neutral-content': '#f9fafb',
                    'base-100': '#ffffff',
                    'base-200': '#f3f4f6',
                    'base-300': '#e5e7eb',
                    'base-content': '#111827',
                    info: '#7c3aed',
                    'info-content': '#ffffff',
                    success: '#059669',
                    'success-content': '#ffffff',
                    warning: '#d97706',
                    'warning-content': '#ffffff',
                    error: '#dc2626',
                    'error-content': '#ffffff',
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
