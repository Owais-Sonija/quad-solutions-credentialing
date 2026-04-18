const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    let changed = false;

    // 1. Import
    if (content.includes("import { Toast } from")) {
        content = content.replace(/import\s*\{\s*Toast\s*\}\s*from\s*['"](\.\.\/components\/ui\/Toast|\.\.\/\.\.\/components\/ui\/Toast)['"]\s*;/g, "import { ToastContainer } from '$1';");
        // Sometimes it could be: import { Toast, ToastProps }... but let's assume it's just { Toast }
        changed = true;
    }

    // 2. Destructuring useToast
    if (content.includes("const { toast, showToast, hideToast } = useToast()")) {
        content = content.replace("const { toast, showToast, hideToast } = useToast()", "const { toasts, showToast, hideToast } = useToast()");
        changed = true;
    }

    // 3. The JSX
    const jsxRegex = /\{toast\s*&&\s*<Toast\s+message=\{toast\.message\}\s+type=\{toast\.type\}\s+onClose=\{hideToast\}\s*\/>\}/g;
    if (jsxRegex.test(content)) {
        content = content.replace(jsxRegex, "<ToastContainer toasts={toasts} onClose={hideToast} />");
        changed = true;
    }

    // In case toast was used in some other conditions like `!toast && <div>Request not found</div>`
    if (content.includes("!toast &&")) {
        content = content.replace(/!toast\s*&&/g, "toasts.length === 0 &&");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function traverseAndReplace(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseAndReplace(fullPath);
        } else if (fullPath.endsWith('.tsx')) {
            replaceInFile(fullPath);
        }
    }
}

// Append CSS
const cssPath = path.join(__dirname, 'src', 'index.css');
if (fs.existsSync(cssPath)) {
    let css = fs.readFileSync(cssPath, 'utf8');
    if (!css.includes('toast-progress')) {
        css += `\n@keyframes toast-progress {
  from { width: 100%; }
  to { width: 0%; }
}
.animate-toast-progress {
  animation: toast-progress 5s linear forwards;
}\n`;
        fs.writeFileSync(cssPath, css, 'utf8');
        console.log('Updated index.css');
    }
}

traverseAndReplace(pagesDir);
