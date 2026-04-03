import fs from 'fs';

const pages = [
  { html: 'lobby.html', tsx: 'src/pages/LobbyDashboard.tsx' },
  { html: 'arena.html', tsx: 'src/pages/BattleArena.tsx' },
  { html: 'spectator.html', tsx: 'src/pages/SpectatorView.tsx' },
  { html: 'review.html', tsx: 'src/pages/AIReview.tsx' }
];

function htmlToJsx(html) {
  let jsx = html.replace(/class="/g, 'className="');
  jsx = jsx.replace(/for="/g, 'htmlFor="');
  jsx = jsx.replace(/viewbox="/gi, 'viewBox="');
  jsx = jsx.replace(/stroke-width="/g, 'strokeWidth="');
  jsx = jsx.replace(/stroke-linecap="/g, 'strokeLinecap="');
  jsx = jsx.replace(/stroke-linejoin="/g, 'strokeLinejoin="');
  jsx = jsx.replace(/stroke-dasharray="/g, 'strokeDasharray="');
  jsx = jsx.replace(/fill-opacity="/g, 'fillOpacity="');
  jsx = jsx.replace(/preserveaspectratio="/gi, 'preserveAspectRatio="');
  
  // Remove any existing trailing slashes to normalize
  jsx = jsx.replace(/<img(.*?)(\/)?>/g, '<img$1 />');
  jsx = jsx.replace(/<input(.*?)(\/)?>/g, '<input$1 />');
  jsx = jsx.replace(/<br(.*?)(\/)?>/g, '<br$1 />');
  jsx = jsx.replace(/<hr(.*?)(\/)?>/g, '<hr$1 />');
  
  // Custom fix for any remaining html stuff
  // style="background-... " should not exist or be object
  
  // Also inline styles need to be converted to object
  jsx = jsx.replace(/style="([^"]+)"/g, (match, p1) => {
    const props = p1.split(';').filter(Boolean).map(s => {
      const [key, val] = s.split(':').map(str => str.trim());
      if(!key || !val) return '';
      const camelKey = key.replace(/-([a-z])/g, g => g[1].toUpperCase());
      return `${camelKey}: "${val}"`;
    }).join(', ');
    return `style={{ ${props} }}`;
  });

  return jsx;
}

for (const page of pages) {
  if (!fs.existsSync(page.html)) continue;
  const html = fs.readFileSync(page.html, 'utf8');
  
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
  if (!bodyMatch) continue;
  
  let bodyContent = bodyMatch[1];
  
  // Remove scripts
  bodyContent = bodyContent.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove styles
  bodyContent = bodyContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Remove HTML comments because they are strictly invalid in JSX
  bodyContent = bodyContent.replace(/<!--[\s\S]*?-->/g, '');
  
  bodyContent = htmlToJsx(bodyContent);
  
  // Read existing tsx
  let tsx = fs.readFileSync(page.tsx, 'utf8');
  
  // Replace the return statement
  const tsxRegex = /return\s*\(\s*<div[^>]*min-h-screen[^>]*>[\s\S]*?\);\n}/;
  if(tsxRegex.test(tsx)) {
     tsx = tsx.replace(tsxRegex, `return (\n<div className="min-h-screen bg-background text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">\n${bodyContent}\n</div>\n);\n}`);
     fs.writeFileSync(page.tsx, tsx);
     console.log(`Updated ${page.tsx}`);
  } else {
     // fallback if regex fails
     console.log(`Failed to apply to ${page.tsx}`);
  }
}
