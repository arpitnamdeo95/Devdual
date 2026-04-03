import fs from 'fs';
fetch('https://api.github.com/repos/DavidHDev/react-bits/git/trees/main?recursive=1', {
  headers: { 'User-Agent': 'Node.js' }
})
.then(r => r.json())
.then(data => fs.writeFileSync('tree.json', JSON.stringify(data.tree.filter(t => t.path.toLowerCase().includes('liquid')), null, 2)))
.catch(console.error);
