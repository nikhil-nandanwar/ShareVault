# ShareVault - Share Text & Files Instantly with a Code

ShareVault is a free, fast and secure online tool to share text snippets and files across devices using a unique sharing code. No signup, no tracking, no friction - just paste, get a code, and share.

## Features

- **Share Text Online** - Paste any text and instantly receive a unique code to share.
- **Share Files Online** - Upload files and generate a code anyone can use to retrieve them.
- **Retrieve Anywhere** - Enter the code on any device to instantly access shared content.
- **No Signup Required** - Use ShareVault without creating an account.
- **Cross-Device** - Works on desktop, tablet and mobile out of the box.
- **Free & Lightweight** - Minimal UI, fast load times, optimized for Core Web Vitals.

## Keywords

share text online, share files online, file sharing, text sharing, send files with a code, online clipboard, instant file transfer, anonymous file sharing, secure file sharing, cross device sharing, free file sharing, no signup file sharing.

## Tech Stack

- **Frontend** - React 18, Vite, Tailwind CSS, Framer Motion
- **Backend** - Node.js, Express
- **Hosting** - Vercel (frontend)

## Project Structure

```
ShareVault/
  backend/      # Express API for upload / retrieve
  frontend/     # React + Vite client (the user-facing web app)
```

## Getting Started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
npm install
npm start
```

## SEO

The frontend ships with:

- Descriptive meta tags (title, description, keywords, author, robots)
- Open Graph and Twitter Card tags for rich social previews
- Canonical URL and language hints
- JSON-LD structured data (`WebApplication`, `Organization`, `WebSite`, `FAQPage`)
- `robots.txt` and `sitemap.xml` in `frontend/public/`
- A web manifest (`site.webmanifest`) for installable PWA support

## License

MIT
