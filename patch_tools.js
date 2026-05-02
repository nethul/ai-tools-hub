const fs = require('fs');

let gridPath = '/root/.openclaw/workspace/ai-tools-hub/components/ToolsGrid.tsx';
let gridContent = fs.readFileSync(gridPath, 'utf8');

const newTools = `
    {
        id: 'youtube-title-generator',
        title: 'YouTube Title Generator',
        description: 'Generate catchy, viral YouTube titles instantly with our free AI tool to boost your CTR.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-2"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z" /><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" /></svg>
        ),
        href: '/tools/youtube-title-generator',
        gradient: 'from-red-500 to-orange-500'
    },
    {
        id: 'cover-letter-generator',
        title: 'Cover Letter Generator',
        description: 'Write a perfect, ATS-friendly cover letter in seconds tailored to your exact job description.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-2"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" /><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" /></svg>
        ),
        href: '/tools/cover-letter-generator',
        gradient: 'from-blue-500 to-cyan-500'
    },
`;

if (!gridContent.includes('youtube-title-generator')) {
  gridContent = gridContent.replace('const tools: Tool[] = [', 'const tools: Tool[] = [' + newTools);
  fs.writeFileSync(gridPath, gridContent);
}

let sitemapPath = '/root/.openclaw/workspace/ai-tools-hub/app/sitemap.ts';
let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

const newRoutes = `
        '/tools/youtube-title-generator',
        '/tools/cover-letter-generator',`;

if (!sitemapContent.includes('youtube-title-generator')) {
  sitemapContent = sitemapContent.replace("'/tools/text-to-speech'", "'/tools/text-to-speech'," + newRoutes);
  fs.writeFileSync(sitemapPath, sitemapContent);
}
