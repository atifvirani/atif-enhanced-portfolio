const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

async function captureAllMobile() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9320',
    '--enable-webgl',
    '--window-size=390,844',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2200));
  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9320/json/list', res => {
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

  const sections = [
    { id: 'about', file: '05_mobile_about_390x844.png' },
    { id: 'skills', file: '05_mobile_skills_390x844.png' },
    { id: 'journey', file: '05_mobile_journey_390x844.png' },
    { id: 'contact', file: '05_mobile_contact_390x844.png' }
  ];

  for (const s of sections) {
    await send('Runtime.evaluate', {
      expression: `document.getElementById('${s.id}')?.scrollIntoView({ behavior: 'instant', block: 'start' })`
    });
    await new Promise(r => setTimeout(r, 600));
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const outPath = path.resolve('artifacts/final-visual-audit/screenshots', s.file);
    fs.writeFileSync(outPath, Buffer.from(res.data, 'base64'));
    console.log(`Saved mobile ${s.id} to`, s.file, fs.statSync(outPath).size, 'bytes');
  }

  // Footer on 390x844
  await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" })' });
  await new Promise(r => setTimeout(r, 600));
  const resFooter = await send('Page.captureScreenshot', { format: 'png' });
  const outPathFooter = path.resolve('artifacts/final-visual-audit/screenshots/05_mobile_footer_390x844.png');
  fs.writeFileSync(outPathFooter, Buffer.from(resFooter.data, 'base64'));
  console.log('Saved mobile footer to 05_mobile_footer_390x844.png', fs.statSync(outPathFooter).size, 'bytes');

  // Narrow Stress Footer on 320x700
  await send('Emulation.setDeviceMetricsOverride', {
    width: 320,
    height: 700,
    deviceScaleFactor: 1,
    mobile: true
  });
  await new Promise(r => setTimeout(r, 600));
  await send('Runtime.evaluate', { expression: 'window.scrollTo({ top: document.body.scrollHeight, behavior: "instant" })' });
  await new Promise(r => setTimeout(r, 600));
  const res320Footer = await send('Page.captureScreenshot', { format: 'png' });
  const outPath320Footer = path.resolve('artifacts/final-visual-audit/screenshots/05_mobile_footer_320x700.png');
  fs.writeFileSync(outPath320Footer, Buffer.from(res320Footer.data, 'base64'));
  console.log('Saved mobile narrow footer to 05_mobile_footer_320x700.png', fs.statSync(outPath320Footer).size, 'bytes');

  ws.close();
  chrome.kill();
}

captureAllMobile().catch(console.error);
