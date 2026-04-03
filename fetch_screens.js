import fs from 'fs';

const urls = [
  { name: 'lobby.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc1Yzc3Mjc3N2MzNzQ2NTI5ODExNTczZjUzNTY1MzYxEgsSBxDz9PzzhhYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjkwODU2MTAwMjYxMTYzMjc3Mg&filename=&opi=89354086' },
  { name: 'arena.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sX2I5YzQ4Mzc0NjAzYzRmMWJiZjg2NGQwMmFjZmQzMDdmEgsSBxDz9PzzhhYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjkwODU2MTAwMjYxMTYzMjc3Mg&filename=&opi=89354086' },
  { name: 'spectator.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzdlMTRmMzliYWJjYTQwY2ViMzZkN2JkYmVkYWUyNWYwEgsSBxDz9PzzhhYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjkwODU2MTAwMjYxMTYzMjc3Mg&filename=&opi=89354086' },
  { name: 'review.html', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ8Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpbCiVodG1sXzc0N2YzMWE5MDQwNTQ5NDZhMWRhN2Q0NTExYmE0ODAxEgsSBxDz9PzzhhYYAZIBJAoKcHJvamVjdF9pZBIWQhQxMjkwODU2MTAwMjYxMTYzMjc3Mg&filename=&opi=89354086' }
];

async function run() {
  for (const item of urls) {
    const res = await fetch(item.url);
    const text = await res.text();
    fs.writeFileSync(item.name, text);
    console.log(`Downloaded ${item.name}`);
  }
}
run();
