import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'signal-yellow': '#ffc500',
        'folio-black': '#000000',
        'newsprint-cream': '#fdfcf3',
        'broadsheet-white': '#ffffff',
        'margin-white': '#fdfbe4',
        'pull-quote-gray': '#e7e7e7',
        'rule-gray': '#d9d9d9',
        'caption-gray': '#6e6e6e',
        'mute-gray': '#b3b3b3',
        'charcoal': '#211d1c',
        'desk-blue': '#64d5ff',
      },
      fontFamily: {
        'plantin': ['var(--font-plantin)'],
        'helvetica-neue': ['var(--font-helvetica-neue)'],
        'chanel': ['var(--font-chanel)'],
      },
      fontSize: {
        'caption': ['13px', { lineHeight: '1.2', letterSpacing: '0.65px' }],
        'body': ['16px', { lineHeight: '1.38', letterSpacing: '0.16px' }],
        'subheading': ['18px', { lineHeight: '1.3', letterSpacing: '0.18px' }],
        'heading-sm': ['20px', { lineHeight: '1.25', letterSpacing: '-0.4px' }],
        'heading': ['24px', { lineHeight: '1.2', letterSpacing: '-0.48px' }],
        'heading-lg': ['28px', { lineHeight: '1.2', letterSpacing: '-0.56px' }],
        'heading-xl': ['32px', { lineHeight: '1.15', letterSpacing: '-0.64px' }],
        'display': ['40px', { lineHeight: '1', letterSpacing: '-0.8px' }],
      },
    },
  },
  plugins: [],
}

export default config
