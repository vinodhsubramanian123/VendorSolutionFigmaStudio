const fs = require('fs');
const path = require('path');

const file = 'src/components/premium-showcase/PremiumShowcase.tsx';
const content = fs.readFileSync(file, 'utf8');

const matchRecon = content.match(/\{activeTab === 'reconciliation' && \(\s*<div([\s\S]*?)<\/div>\s*\)\}/);
const matchMission = content.match(/\{activeTab === 'mission' && \(\s*<div([\s\S]*?)<\/div>\s*\)\}/);
const matchSearch = content.match(/\{activeTab === 'search' && \(\s*<div([\s\S]*?)<\/div>\s*\)\}/);
const matchLoading = content.match(/\{activeTab === 'loading' && \(\s*<div([\s\S]*?)<\/div>\s*\)\}/);

console.log('Recon:', matchRecon ? 'Found' : 'Not found');
console.log('Mission:', matchMission ? 'Found' : 'Not found');
console.log('Search:', matchSearch ? 'Found' : 'Not found');
console.log('Loading:', matchLoading ? 'Found' : 'Not found');
