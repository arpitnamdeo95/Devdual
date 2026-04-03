import fs from 'fs';

const pages = [
  'src/pages/LobbyDashboard.tsx',
  'src/pages/BattleArena.tsx',
  'src/pages/SpectatorView.tsx',
  'src/pages/AIReview.tsx',
  'src/components/ContentPages.tsx'
];

pages.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('import { AppNavbar, AppSidebar }')) {
     const importPath = file.includes('components') ? './AppLayout' : '../components/AppLayout';
     content = `import { AppNavbar, AppSidebar } from '${importPath}';\n` + content;
  }

  // Replace header
  content = content.replace(/<header className="bg-\[#131313\].*?<\/header>/s, '<AppNavbar />');
  
  // Replace aside
  content = content.replace(/<aside className="bg-\[#1c1b1b\].*?<\/aside>/s, '<AppSidebar />');

  fs.writeFileSync(file, content);
  console.log('Replaced layout in', file);
});
