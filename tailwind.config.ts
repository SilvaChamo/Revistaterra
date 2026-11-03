import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/share.ts',
  ],
  theme: {
    extend: {
      colors: {
        'terra-green': '#2E7D32',
        'terra-brown': '#795548',
        'terra-bg': '#FAFAFA',
        'terra-text': '#212121',
      },
    },
  },
  plugins: [],
};

export default config;