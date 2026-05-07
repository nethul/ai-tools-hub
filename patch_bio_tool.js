const fs = require('fs');

let gridPath = '/root/.openclaw/workspace/ai-tools-hub/components/ToolsGrid.tsx';
let gridContent = fs.readFileSync(gridPath, 'utf8');

const newTool = `
    {
        id: 'insta-bio-generator',
        title: 'Instagram Bio Generator',
        description: 'Generate aesthetic, funny, and professional Instagram bios instantly with our free AI tool.',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full p-2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
        ),
        href: '/tools/insta-bio-generator',
        gradient: 'from-pink-500 to-amber-500'
    },
`;

if (!gridContent.includes('insta-bio-generator')) {
  gridContent = gridContent.replace('const tools: Tool[] = [', 'const tools: Tool[] = [' + newTool);
  fs.writeFileSync(gridPath, gridContent);
}

let sitemapPath = '/root/.openclaw/workspace/ai-tools-hub/app/sitemap.ts';
let sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

const newRoute = `
        '/tools/insta-bio-generator',`;

if (!sitemapContent.includes('insta-bio-generator')) {
  sitemapContent = sitemapContent.replace("'/tools/text-to-speech'", "'/tools/text-to-speech'," + newRoute);
  fs.writeFileSync(sitemapPath, sitemapContent);
}
