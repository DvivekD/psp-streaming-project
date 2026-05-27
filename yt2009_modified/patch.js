const fs = require('fs');
const cp = require('child_process');

const files = cp.execSync("find /home/azureuser/psp-streaming-yt2009/back -type f -name '*.js' -not -name 'proxy-fetch.js' -not -path '*/node_modules/*'")
    .toString().split('\n').filter(Boolean);

for (let f of files) {
    let c = fs.readFileSync(f, 'utf8');
    let patched = false;
    
    if (c.includes('require("node-fetch")')) {
        c = c.replace(/require\("node-fetch"\)/g, 'require("/home/azureuser/psp-streaming-yt2009/back/proxy-fetch.js")');
        patched = true;
    }
    
    if (c.includes("require('node-fetch')")) {
        c = c.replace(/require\('node-fetch'\)/g, 'require("/home/azureuser/psp-streaming-yt2009/back/proxy-fetch.js")');
        patched = true;
    }
    
    if (patched) {
        fs.writeFileSync(f, c);
        console.log("patched " + f);
    }
}
