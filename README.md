
# LexScopic (Next.js)

Simple starter you can upload to GitHub and deploy on Vercel.

## Quick start
1) Install Node (v18+).
2) In a terminal:
```bash
npm install
npm run dev
```
Visit http://localhost:3000

## Deploy
- Push this folder to a GitHub repo named `lexscopic`.
- In vercel.com: New Project → select the repo → Deploy.
- In your domain registrar: point `lexscopic.com` to Vercel using the DNS records they show under Project → Settings → Domains.

## Edit events
- Open `data/events.json` and add items.
- Each event has: `title`, `date` (YYYY-MM-DD), `startTime`, `endTime`, `venue`, `price`, `tags` (array), `description`, `url`, and optional `image`.

## Notes
- This starter uses Tailwind + small UI components, lucide-react icons, and framer-motion for card animation.
- The Submit Event modal adds new events in the browser (not saved to a database). When you’re ready, we’ll switch to a Google Sheet or simple API.
