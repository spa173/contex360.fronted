const fs = require('fs');
const issues = JSON.parse(fs.readFileSync('new-issues.json', 'utf8')).issues;
const blockers = issues.filter(i => i.severity === 'BLOCKER' || i.severity === 'CRITICAL');
console.log(JSON.stringify(blockers, null, 2));
