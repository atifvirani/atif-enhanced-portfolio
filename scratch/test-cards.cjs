const { spawn } = require('child_process');
const http = require('http');

async function check() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9298',
    '--enable-webgl',
    '--window-size=1440,900',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2200));
  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9298/json/list', res => {
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

  const clicked = await send('Runtime.evaluate', {
    expression: "(() => { const b = document.querySelector('button[aria-label=\"Skip intro animation\"]') || Array.from(document.querySelectorAll('button')).find(x => x.textContent.toLowerCase().includes('skip')); if (b) { b.click(); return 'Clicked ' + b.textContent; } return 'Not found'; })()",
    returnByValue: true
  });
  console.log('Skip button action:', clicked.result?.value);
  await new Promise(r => setTimeout(r, 1200));

  const checkSettled = await send('Runtime.evaluate', {
    expression: "(() => { return { hasAbout: !!document.getElementById('about'), hasWorks: !!document.getElementById('works'), scrollY: window.scrollY }; })()",
    returnByValue: true
  });
  console.log('Settled status:', checkSettled.result?.value);

  await send('Runtime.evaluate', {
    expression: "document.getElementById('works').scrollIntoView({ behavior: 'instant', block: 'start' })"
  });
  await new Promise(r => setTimeout(r, 600));

  await send('Runtime.evaluate', {
    expression: "window.scrollBy({ top: 400, behavior: 'instant' })"
  });
  await new Promise(r => setTimeout(r, 600));

  const cardDetails = await send('Runtime.evaluate', {
    expression: `(() => {
      const track = document.getElementById('works').querySelector('div[style*="preserve-3d"]');
      const cards = document.querySelectorAll('.curved-tile-wrapper');
      return {
        trackTransform: track ? track.style.transform : null,
        trackX: track ? track.getBoundingClientRect() : null,
        cards: Array.from(cards).map((c, i) => ({
          i,
          rect: { x: c.getBoundingClientRect().x, y: c.getBoundingClientRect().y, w: c.getBoundingClientRect().width, h: c.getBoundingClientRect().height },
          opacity: c.style.opacity,
          transform: c.style.transform,
          display: window.getComputedStyle(c).display,
          visibility: window.getComputedStyle(c).visibility
        }))
      };
    })()`,
    returnByValue: true
  });
  console.log('Cards at +400px:', JSON.stringify(cardDetails.result?.value, null, 2));

  ws.close();
  chrome.kill();
}

check().catch(console.error);
