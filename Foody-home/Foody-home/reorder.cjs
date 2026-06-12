const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.vue')) results.push(file);
    }
  });
  return results;
}

const files = walk('.');
files.forEach(file => {
  if (file.includes('node_modules') || file.includes('.nuxt')) return;
  let content = fs.readFileSync(file, 'utf8');
  const scriptRegex = /<script setup lang="ts">([\s\S]*?)<\/script>/;
  const match = content.match(scriptRegex);
  
  if (match) {
    const scriptContent = match[0];
    let newContent = content.replace(scriptRegex, '').trim();
    
    // Check if the script contains imports from '~/stores/...' that gives an error
    // By default, Nuxt auto imports Pinia stores if they are exposed correctly,
    // but the error the user sees goes away when the tsconfig.json is present.
    
    // We just reorder to put script top:
    if (content.indexOf('<script setup lang="ts">') > content.indexOf('<template>')) {
      fs.writeFileSync(file, scriptContent + '\n\n' + newContent + '\n');
      console.log('Reordered: ' + file);
    }
  }
});
