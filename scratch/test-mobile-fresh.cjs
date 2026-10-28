const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function testMobileFresh() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9305',
    '--enable-webgl',
    '--window-size=390,844',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2200));
  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9305/json/list', res => {
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
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true
  });
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 1500));

  await send('Runtime.evaluate', {
    expression: "(() => { const b = document.querySelector('button[aria-label=\"Skip intro animation\"]') || Array.from(document.querySelectorAll('button')).find(x => x.textContent.toLowerCase().includes('skip')); if (b) b.click(); })()"
  });
  await new Promise(r => setTimeout(r, 1000));

  const res = await send('Page.captureScreenshot', { format: 'png' });
  const outPath = path.resolve('artifacts/final-visual-audit/screenshots/03_hero_390x844_mobile.png');
  fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
  console.log('Saved fresh mobile hero screenshot to', outPath);

  // Also capture 320x700
  await send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 700,
    deviceScaleFactor: 1,
    mobile: true
  });
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 1500));
  await send('Runtime.evaluate', {
    expression: "(() => { const b = document.querySelector('button[aria-label=\"Skip intro animation\"]') || Array.from(document.querySelectorAll('button')).find(x => x.textContent.toLowerCase().includes('skip')); if (b) b.click(); })()"
  });
  await new Promise(r => setTimeout(r, 1000));

  const res320 = await send('Page.captureScreenshot', { format: 'png' });
  const outPath320 = path.resolve('artifacts/final-visual-audit/screenshots/03_hero_320x700_mobile_narrow.png');
  fs.writeFileSync(outPath320, Buffer.from(res320.data, 'base64'));
  console.log('Saved fresh 320 mobile hero screenshot to', outPath320);

  ws.close();
  chrome.kill();
}

testMobileFresh().catch(console.error);
