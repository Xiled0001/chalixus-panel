const colors = require('tailwindcss/colors');

const gray = {
    50: 'hsl(216, 33%, 97%)',
    100: 'hsl(214, 15%, 91%)',
    200: 'hsl(210, 16%, 82%)',
    300: 'hsl(211, 13%, 65%)',
    400: 'hsl(211, 10%, 53%)',
    500: 'hsl(211, 12%, 43%)',
    600: 'hsl(209, 14%, 37%)',
    700: 'hsl(209, 18%, 30%)',
    800: 'hsl(209, 20%, 25%)',
    900: 'hsl(210, 24%, 16%)',
};

// ─── Chalixus Design System ───────────────────────────────────────────────────
// Brand palette tokens used consistently across all components.
// Never hardcode these hex values in components — always use the token names.
const brand = {
    // Primary action color — buttons, active states, focus rings
    primary: '#6c5cff',
    'primary-light': '#7d6fff',
    'primary-dark': '#5848e0',
    // Accent — nav active glow, links, highlights
    accent: '#00d4ff',
    'accent-light': '#33ddff',
    'accent-dark': '#00b8e0',
    // Highlight — warnings, special state, destructive secondary
    highlight: '#ff7af6',
    'highlight-dark': '#e060d8',
    // Base backgrounds
    base: '#0b0f1a',
    'surface-1': 'rgba(255, 255, 255, 0.04)',
    'surface-2': 'rgba(255, 255, 255, 0.07)',
    'surface-3': 'rgba(255, 255, 255, 0.10)',
    // Glass border
    'glass-border': 'rgba(255, 255, 255, 0.10)',
    'glass-border-strong': 'rgba(255, 255, 255, 0.18)',
};

module.exports = {
    content: [
        './resources/scripts/**/*.{js,ts,tsx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                header: ['"IBM Plex Sans"', '"Roboto"', 'system-ui', 'sans-serif'],
            },
            colors: {
                black: '#131a20',
                // "primary" and "neutral" are deprecated, prefer the use of "blue" and "gray"
                // in new code.
                primary: colors.blue,
                gray: gray,
                neutral: gray,
                cyan: colors.cyan,
                // ─── Chalixus Brand Tokens ────────────────────────────────────────
                brand,
            },
            fontSize: {
                '2xs': '0.625rem',
            },
            transitionDuration: {
                75: '75ms',
                100: '100ms',
                150: '150ms', // fast
                200: '200ms',
                250: '250ms', // default
                300: '300ms',
                350: '350ms', // slow
                500: '500ms',
            },
            transitionTimingFunction: {
                DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
                linear: 'linear',
                in: 'cubic-bezier(0.4, 0, 1, 1)',
                out: 'cubic-bezier(0, 0, 0.2, 1)',
                'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
            },
            borderRadius: {
                '2xl': '1rem',
                '3xl': '1.25rem',
                '4xl': '1.5rem',
                '5xl': '2rem',
            },
            backdropBlur: {
                glass: '12px',
                'glass-heavy': '24px',
            },
            boxShadow: {
                // Soft elevation cards
                'card': '0 4px 24px rgba(0, 0, 0, 0.35), 0 1px 4px rgba(0, 0, 0, 0.2)',
                'card-hover': '0 8px 32px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.25)',
                // Primary glow — buttons, active elements
                'glow': '0 0 20px rgba(108, 92, 255, 0.45), 0 0 8px rgba(108, 92, 255, 0.25)',
                'glow-sm': '0 0 12px rgba(108, 92, 255, 0.35)',
                // Accent glow — nav items, focus rings
                'glow-accent': '0 0 20px rgba(0, 212, 255, 0.45), 0 0 8px rgba(0, 212, 255, 0.25)',
                'glow-accent-sm': '0 0 10px rgba(0, 212, 255, 0.3)',
                // Highlight glow — destructive, warning
                'glow-highlight': '0 0 16px rgba(255, 122, 246, 0.45)',
                // Success glow
                'glow-green': '0 0 16px rgba(34, 197, 94, 0.4)',
                // Red/danger glow
                'glow-red': '0 0 16px rgba(239, 68, 68, 0.4)',
                // Soft inner glow for inputs
                'inner-glow': 'inset 0 0 0 1px rgba(0, 212, 255, 0.4)',
            },
            borderColor: theme => ({
                default: theme('colors.neutral.400', 'currentColor'),
            }),
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(6px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    '0%': { opacity: '0', transform: 'scale(0.97)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
            animation: {
                'fade-in': 'fade-in 200ms ease forwards',
                'scale-in': 'scale-in 200ms ease forwards',
            },
        },
    },
    plugins: [
        require('@tailwindcss/line-clamp'),
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
    ]
};
