import fs from 'fs';

const projectScreens = {
    'lobby': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzUzY2RjYmNkOTdjYTRmYjdhOWE2ZmQzODA5YTFlOWFjEgsSBxDz9PzzhhYYAZIBIwoKcHJvamVjdF9pZBIVQhM0MjMxNzAwMjE0MDcxNzgzNDQ4&filename=&opi=89354086',
    'arena': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2Y4ODE2ZTJjMzkyZjQ5NzU5MjRmY2MwNTE0NGE2M2EwEgsSBxDz9PzzhhYYAZIBIwoKcHJvamVjdF9pZBIVQhM0MjMxNzAwMjE0MDcxNzgzNDQ4&filename=&opi=89354086',
    'spectator': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzkxM2U2YmI3ZmFhMzRlNmFiZWRmNzBhZDhkYzA1YThiEgsSBxDz9PzzhhYYAZIBIwoKcHJvamVjdF9pZBIVQhM0MjMxNzAwMjE0MDcxNzgzNDQ4&filename=&opi=89354086',
    'review': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzNjMzA0ZjBmOGQzODQyZmViOWUzMjY3MDU5ZjUxZDg0EgsSBxDz9PzzhhYYAZIBIwoKcHJvamVjdF9pZBIVQhM0MjMxNzAwMjE0MDcxNzgzNDQ4&filename=&opi=89354086',
    'landing': 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2I4ZDhiN2ZmM2IzOTRmODdhMTIwZWI2OGE4MWQwM2I2EgsSBxDz9PzzhhYYAZIBIwoKcHJvamVjdF9pZBIVQhM0MjMxNzAwMjE0MDcxNzgzNDQ4&filename=&opi=89354086'
};

async function run() {
  for (const [name, url] of Object.entries(projectScreens)) {
    const res = await fetch(url);
    const text = await res.text();
    fs.writeFileSync(name + '.html', text);
    console.log(`Downloaded ${name}.html`);
  }
}
run();
