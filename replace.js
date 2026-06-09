import fs from 'fs';
import path from 'path';

function walkDir(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walkDir(filePath));
        } else if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
            results.push(filePath);
        }
    });
    return results;
}

const files = walkDir('./src');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Replace inline backgroundColor: '#0b1220' with className 'bg-surface-elevated' where possible, 
    // or just change it to 'var(--color-surface-elevated)'
    
    content = content.replace(/backgroundColor:\s*["']#0b1220["']/g, 'backgroundColor: "var(--color-surface-elevated)"');
    content = content.replace(/background:\s*["']#0b1220["']/g, 'background: "var(--color-surface-elevated)"');
    
    // Replace hardcoded deep backgrounds
    content = content.replace(/bg-\[#0b1220\]/g, 'bg-surface-elevated');
    content = content.replace(/bg-\[#090d19\]/g, 'bg-surface-header');
    content = content.replace(/bg-\[#0f172a\]/g, 'bg-surface-elevated');
    content = content.replace(/bg-\[#0d1527\]/g, 'bg-surface-elevated');
    
    // Replace indigo
    content = content.replace(/bg-\[#4a85fd\]/g, 'bg-brand-indigo');
    content = content.replace(/text-\[#4a85fd\]/g, 'text-brand-indigo');
    content = content.replace(/border-\[#4a85fd\]/g, 'border-brand-indigo');
    content = content.replace(/rgba\(74,133,253,/g, 'rgba(74, 133, 253,');

    // Replace Crimson Red
    content = content.replace(/bg-\[#ff3d5a\]/g, 'bg-status-error');
    content = content.replace(/text-\[#ff3d5a\]/g, 'text-status-error');
    content = content.replace(/border-\[#ff3d5a\]/g, 'border-status-error');
    content = content.replace(/bg-\[#3b0711\]/g, 'bg-status-error-transparent');
    
    // Replace Emerald Green
    content = content.replace(/bg-\[#00d4a0\]/g, 'bg-status-success');
    content = content.replace(/text-\[#00d4a0\]/g, 'text-status-success');
    content = content.replace(/border-\[#00d4a0\]/g, 'border-status-success');
    content = content.replace(/bg-\[#091815\]/g, 'bg-status-success-transparent');

    content = content.replace(/backgroundColor:\s*["']#ff3d5a["']/g, 'backgroundColor: "var(--color-status-error)"');
    content = content.replace(/backgroundColor:\s*["']#00d4a0["']/g, 'backgroundColor: "var(--color-status-success)"');
    content = content.replace(/backgroundColor:\s*["']#0d1527["']/g, 'backgroundColor: "var(--color-surface-elevated)"');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated ' + file);
    }
});
