import fs from 'fs';

const pages = [
  'src/pages/LobbyDashboard.tsx',
  'src/pages/BattleArena.tsx',
  'src/pages/SpectatorView.tsx',
  'src/pages/AIReview.tsx'
];

pages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add Link
  if (!content.includes(' Link ') && !content.includes(', Link}') && !content.includes('{ Link }') && !content.includes('Link,')) {
    if (content.includes('import { useNavigate }')) {
       content = content.replace('import { useNavigate }', 'import { useNavigate, Link }');
    } else if (content.includes('react-router-dom')) {
       content = content.replace(/import {([^}]*?)} from 'react-router-dom';/, function(match, p1) {
         return `import {${p1}, Link} from 'react-router-dom';`;
       });
    } else {
       content = "import { Link, useNavigate } from 'react-router-dom';\n" + content;
    }
  }

  // Ensure navigate
  if (!content.includes('const navigate = useNavigate();')) {
     const fnMatch = content.match(/export default function\s+\w+\s*\([^)]*\)\s*{/);
     if (fnMatch) {
       // Check if there is an import
       if (!content.includes('useNavigate')) {
           if (content.includes('import { Link }')) {
              content = content.replace('import { Link }', 'import { Link, useNavigate }');
           }
       }
       content = content.replace(fnMatch[0], `${fnMatch[0]}\n  const navigate = useNavigate();\n`);
     }
  }

  content = content.replace(/href="#"/g, ''); // remove dead links

  content = content.replace(/<a([^>]*?)>Arena<\/a>/g, `<Link$1 to="/arena/demo">Arena</Link>`);
  content = content.replace(/<a([^>]*?)>Rankings<\/a>/g, `<Link$1 to="/watch/demo">Rankings</Link>`);
  content = content.replace(/<a([^>]*?)>Profile<\/a>/g, `<Link$1 to="/app">Profile</Link>`);

  content = content.replace(/<span className="font-\['JetBrains_Mono'\] font-bold text-lg tracking-tighter text-\[#adc6ff\]">CODE_BATTLE<\/span>/g, `<span className="font-['JetBrains_Mono'] font-bold text-lg tracking-tighter text-[#adc6ff]"><Link to="/app">CODE_BATTLE</Link></span>`);

  content = content.replace(/<button([^>]*?)>\s*<span className="material-symbols-outlined">code<\/span>[\s\S]*?<\/button>/g, match => {
     if (match.includes('onClick')) return match; 
     return match.replace('<button', '<button onClick={() => navigate(\'/arena/demo\')}');
  });

  content = content.replace(/<button([^>]*?)>\s*<span className="material-symbols-outlined">terminal<\/span>[\s\S]*?<\/button>/g, match => {
     if (match.includes('onClick')) return match; 
     return match.replace('<button', '<button onClick={() => navigate(\'/app\')}');
  });

  content = content.replace(/<button([^>]*?)>\s*<span className="material-symbols-outlined">analytics<\/span>[\s\S]*?<\/button>/g, match => {
     if (match.includes('onClick')) return match; 
     return match.replace('<button', '<button onClick={() => navigate(\'/review/demo\')}');
  });

  content = content.replace(/<button([^>]*?)>\s*<span className="material-symbols-outlined">description<\/span>[\s\S]*?<\/button>/g, match => {
     if (match.includes('onClick')) return match; 
     return match.replace('<button', '<button onClick={() => navigate(\'/docs\')}');
  });

  fs.writeFileSync(file, content);
  console.log('Fixed nav in', file);
});
