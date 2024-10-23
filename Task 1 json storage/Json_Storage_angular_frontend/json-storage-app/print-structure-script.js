const fs = require('fs');
const path = require('path');

function printStructure(dir, prefix = '') {
  const files = fs.readdirSync(dir);
  files.forEach((file, index) => {
    if (file === 'node_modules' || file === '.git') return;
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    const isLast = index === files.length - 1;
    console.log(prefix + (isLast ? '└── ' : '├── ') + file);
    if (stats.isDirectory()) {
      printStructure(filePath, prefix + (isLast ? '    ' : '│   '));
    }
  });
}

printStructure('.');
