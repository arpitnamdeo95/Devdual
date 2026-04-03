import fs from 'fs';

const htmlPath = 'landing.html';
const reactPath = 'src/pages/LandingPage.tsx';

let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Extract the body content
let match = htmlContent.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (!match) process.exit(1);

let bodyContent = match[1];

// Strip HTML comments
bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, '');

// Convert common HTML attributes to JSX
let jsxCode = bodyContent
    .replace(/class=/g, 'className=')
    .replace(/for=/g, 'htmlFor=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/stroke-linecap=/g, 'strokeLinecap=')
    .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
    .replace(/fill-rule=/g, 'fillRule=')
    .replace(/clip-rule=/g, 'clipRule=')
    .replace(/viewbox=/gi, 'viewBox=')
    .replace(/crossorigin=/gi, 'crossOrigin=')
    .replace(/<img([^>]*?[^\/])>/g, '<img$1 />')
    .replace(/<input([^>]*?[^\/])>/g, '<input$1 />')
    .replace(/<hr([^>]*?[^\/])>/g, '<hr$1 />')
    .replace(/<br([^>]*?[^\/])>/g, '<br$1 />');

// Handle specific DevDuel changes and routing
jsxCode = jsxCode.replaceAll('Code Battle', 'DEVDUEL');
jsxCode = jsxCode.replaceAll('CODE_BATTLE', 'DEVDUEL');
jsxCode = jsxCode.replaceAll('CODE. BATTLE.', 'CODE. BATTLE.'); // Wait, user wants DEVDUEL but "CODE. BATTLE. DOMINATE." is a slogan
jsxCode = jsxCode.replaceAll('DevDuel Arena', 'DEVDUEL');

// Wire up the buttons
jsxCode = jsxCode.replaceAll('<button class="', '<button onClick={() => navigate(\'/app\')} className="');
jsxCode = jsxCode.replaceAll('<a class="', '<a onClick={(e) => { e.preventDefault(); navigate(\'/app\'); }} className="');

// Fix style tag which is invalid JSX
jsxCode = jsxCode.replace(/<style>[\s\S]*?<\/style>/g, '');

const finalReactCode = `import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="bg-[#0a0e14] text-[#f1f3fc] font-[Inter] overflow-x-hidden selection:bg-[#c799ff] selection:text-[#440080]">
            <style>{\`
                .font-headline { font-family: 'Space Grotesk', sans-serif; }
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .glow-sm { text-shadow: 0 0 8px rgba(74, 248, 227, 0.4); }
                .glow-primary { box-shadow: 0 0 20px rgba(199, 153, 255, 0.2); }
                .glass-panel { backdrop-filter: blur(12px); background: rgba(21, 26, 33, 0.7); }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
                .animate-marquee { display: inline-block; animation: marquee 30s linear infinite; }
            \`}</style>
            ${jsxCode}
        </div>
    );
}
`;

fs.writeFileSync(reactPath, finalReactCode);
console.log('Successfully applied landing UI to LandingPage.tsx');
