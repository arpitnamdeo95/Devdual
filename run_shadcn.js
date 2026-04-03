import { spawn } from 'child_process';
import fs from 'fs';

const p = spawn('npx.cmd', ['shadcn@latest', 'add', '@react-bits/LiquidEther-JS-CSS'], {
  cwd: process.cwd(),
});

p.stdout.on('data', (data) => {
  fs.appendFileSync('out.txt', data.toString());
});
p.stderr.on('data', (data) => {
  fs.appendFileSync('out.txt', data.toString());
});
p.on('close', (code) => {
  fs.appendFileSync('out.txt', `\nEXIT CODE: ${code}\n`);
});
