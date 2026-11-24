# TEAM Communications

Single-page agency website built with Next.js, TypeScript, Tailwind CSS and Framer Motion. The WebP artwork in `public/media` comes from the supplied TEAM portfolio.

## Development

Use Node.js 22 or 24, then run:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Run `npm run typecheck` and `npm run build` before deploying.

## Deployment and enquiries

Deploy as a Next.js app with a Node server or through a managed Next.js host such as Vercel. Run `npm run build` and `npm start` for self-hosting. Connect the intended domain in the host dashboard and configure the DNS records it provides.

Copy `.env.example` to `.env.local` for local email testing. Set production variables in the hosting dashboard. Use `SITE_URL` for the deployed origin and a verified Resend domain for `ENQUIRY_FROM`. Add `RESEND_API_KEY` and optionally override `ENQUIRY_TO`. Outbound HTTPS to `api.resend.com` is required. Submit a live test enquiry after deployment and confirm receipt.

The endpoint validates submissions, checks the browser origin, limits body size, uses a honeypot and throttles requests within each server process. For multi-instance hosting, configure a shared edge rate limit for POST requests to `/api/enquiry`. Set the reverse proxy to overwrite forwarded client-IP headers.

## Content pending confirmation

The Claude artifact was unavailable during implementation. The portfolio and pasted brief informed the layout and content. The 200+ talent figure awaits confirmation. The Health & wellness, Product launches and Roadshows filters show an empty state until case studies and matching images are supplied. The event posters and logos are supplied portfolio extracts. Higher-resolution originals would improve the smallest logo and poster assets.
