const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function captureProjects() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9310',
    '--enable-webgl',
    '--window-size=1440,900',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2200));
  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9310/json/list', res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const page = list.find(t => t.type === 'page');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let id = 1;
  const send = (m, p = {}) => new Promise(r => {
    const i = id++;
    const h = e => {
      const msg = JSON.parse(e.data);
      if (msg.id === i) {
        ws.removeEventListener('message', h);
        r(msg.result);
      }
    };
    ws.addEventListener('message', h);
    ws.send(JSON.stringify({ id: i, method: m, params: p }));
  });

  await send('Page.enable');
  await send('Runtime.enable');
  await new Promise(r => setTimeout(r, 1500));

  // Skip intro
  await send('Runtime.evaluate', {
    expression: "(() => { const b = document.querySelector('button[aria-label=\"Skip intro animation\"]') || Array.from(document.querySelectorAll('button')).find(x => x.textContent.toLowerCase().includes('skip')); if (b) b.click(); })()"
  });
  await new Promise(r => setTimeout(r, 1200));

  // Scroll to projects entry
  await send('Runtime.evaluate', {
    expression: "document.getElementById('works').scrollIntoView({ behavior: 'instant', block: 'start' })"
  });
  await new Promise(r => setTimeout(r, 800));

  const resEntry = await send('Page.captureScreenshot', { format: 'png' });
  const outPathEntry = path.resolve('artifacts/final-visual-audit/screenshots/04_section_projects_01_entry_1440x900.png');
  fs.writeFileSync(outPathEntry, Buffer.from(resEntry.data, 'base64'));
  console.log('Saved entry to', outPathEntry, fs.statSync(outPathEntry).size, 'bytes');

  // Scroll to middle pin scrub (+400px)
  await send('Runtime.evaluate', {
    expression: "window.scrollBy({ top: 400, behavior: 'instant' })"
  });
  await new Promise(r => setTimeout(r, 800));

  const resMid = await send('Page.captureScreenshot', { format: 'png' });
  const outPathMid = path.resolve('artifacts/final-visual-audit/screenshots/04_section_projects_02_middle_pin_1440x900.png');
  fs.writeFileSync(outPathMid, Buffer.from(resMid.data, 'base64'));
  console.log('Saved middle pin to', outPathMid, fs.statSync(outPathMid).size, 'bytes');

  // Scroll to exit scrub (+900px more -> +1300px total)
  await send('Runtime.evaluate', {
    expression: "window.scrollBy({ top: 900, behavior: 'instant' })"
  });
  await new Promise(r => setTimeout(r, 800));

  const resExit = await send('Page.captureScreenshot', { format: 'png' });
  const outPathExit = path.resolve('artifacts/final-visual-audit/screenshots/04_section_projects_03_exit_1440x900.png');
  fs.writeFileSync(outPathExit, Buffer.from(resExit.data, 'base64'));
  console.log('Saved exit to', outPathExit, fs.statSync(outPathExit).size, 'bytes');

  ws.close();
  chrome.kill();
}

captureProjects().catch(console.error);
