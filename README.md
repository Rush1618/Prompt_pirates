This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## 🚀 Deploy on Vercel

### Option 1: Deploy with Vercel CLI
Run the following commands from the project root (`dead-mans-cipher`):

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy preview build
vercel

# Deploy production build
vercel --prod
```

### Option 2: Deploy via GitHub / Vercel Dashboard
1. Push this repository to GitHub (`Prompt_pirates`).
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import the `dead-mans-cipher` directory from your repository.
4. Framework Preset will auto-detect **Next.js**.
5. Click **Deploy**.

> **Note**: *Dead Man's Cipher* performs authenticated encryption (AES-256-GCM), digital signatures (Ed25519), and steganography client-side using native Web Crypto APIs. No external database or server API keys are required!
