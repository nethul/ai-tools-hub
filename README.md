# 🧰 AI Tools Hub

A collection of free, browser-based AI-powered utility tools — built as a single Next.js hub. From content generation to file conversion, AI Tools Hub brings together a growing suite of practical mini-tools in one place.

🔗 **Live app:** [aitoolverse.app](https://aitoolverse.app/)

---

## About

AI Tools Hub is a Next.js application that hosts multiple standalone AI-powered tools under one roof — think bio generators, text/diff comparison utilities, document/Excel exporters, and more. Content and tool metadata are managed through Sanity CMS, with Google's Gemini API and Hugging Face Transformers (including in-browser/WebGPU-accelerated models) powering the AI features.

The project also includes scaffolding scripts (`create_tools.sh`, `create_bio_tool.sh`) used to generate new tool pages quickly, making it easy to keep expanding the hub with additional tools over time.

## Features

- 🤖 **Multiple AI-powered tools** in a single hub, each with its own dedicated page
- ✍️ **AI content generation** (e.g. bio/profile generator) via the Gemini API
- 🧠 **Client-side / in-browser ML inference** using Hugging Face Transformers.js (WebGPU-accelerated where supported)
- 🔍 **Text diffing/comparison** utilities
- 📄 **Export options** — download results as Excel (`xlsx`) or print/save as PDF
- 📚 **CMS-managed content** via Sanity (tool descriptions, metadata, blog/content pages)
- 🗄️ **Supabase integration** for data storage/persistence
- 📊 **Analytics** via Vercel Analytics
- 🎨 **Modern, responsive UI** built with Tailwind CSS v4 and Lucide icons

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/), styled-components |
| CMS | [Sanity](https://www.sanity.io/) (`sanity`, `next-sanity`, `@sanity/image-url`) |
| AI / ML | [Google Gemini API](https://ai.google.dev/) (`@google/genai`), [Hugging Face Transformers.js](https://huggingface.co/docs/transformers.js) (`@huggingface/transformers`) |
| Backend / DB | [Supabase](https://supabase.com/) |
| Utilities | `diff`, `file-saver`, `react-to-print`, `xlsx`, `react-markdown`, `@faker-js/faker` |
| Icons | [lucide-react](https://lucide.dev/) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) |
| Deployment | [Vercel](https://vercel.com/) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.18 or later recommended for Next.js 16)
- npm (or yarn / pnpm / bun)
- A [Sanity](https://www.sanity.io/) project (for CMS content)
- A [Supabase](https://supabase.com/) project (for backend data)
- A [Google Gemini API key](https://ai.google.dev/) (for AI generation features)

### Installation

```bash
# Clone the repository
git clone https://github.com/nethul/ai-tools-hub.git
cd ai-tools-hub

# Install dependencies
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
GOOGLE_GENAI_API_KEY=your_gemini_api_key
```

> Adjust variable names as needed to match how they're referenced in `lib/` and `services/`.

### Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

### Building for Production

```bash
npm run build
npm run start
```

### Linting

```bash
npm run lint
```

### Sanity Studio

This project embeds Sanity Studio for content management. Once configured, the studio is typically accessible from within the app (see `sanity.config.ts` / `sanity.cli.ts` for configuration details).

## Project Structure

```
ai-tools-hub/
├── app/                 # Next.js App Router pages and routes
├── components/          # Reusable UI components
├── context/             # React context providers
├── lib/                 # Shared library/helper code
├── services/            # API/service integrations (e.g. Gemini, Supabase)
├── sanity/              # Sanity CMS schema and configuration
├── types/                # Shared TypeScript types
├── utils/                # Utility/helper functions
├── public/               # Static assets
├── create_tools.sh        # Script to scaffold a new tool
├── create_bio_tool.sh      # Script to scaffold the bio generator tool
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Adding a New Tool

The repository includes helper scripts for scaffolding new tools:

```bash
./create_tools.sh
./create_bio_tool.sh
```

These generate the boilerplate files needed to add a new AI tool page to the hub. Review the scripts before running them to see (and adjust) exactly what they generate.

## Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-tool`)
3. Commit your changes (`git commit -m 'Add some amazing tool'`)
4. Push to the branch (`git push origin feature/amazing-tool`)
5. Open a Pull Request

## License

This project currently has no license specified. If you plan to reuse this code, please reach out to the repository owner.

## Author

**Nethul Nanayakkara**
GitHub: [@nethul](https://github.com/nethul)
