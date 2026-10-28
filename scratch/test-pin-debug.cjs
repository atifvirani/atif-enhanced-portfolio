const { spawn } = require('child_process');
const http = require('http');

async function check() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9295',
    '--enable-webgl',
    '--window-size=1440,900',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2200));
  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9295/json/list', res => {
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

  await send('Runtime.evaluate', {
    expression: "(() => { const b = Array.from(document.querySelectorAll('button')).find(x => x.textContent.includes('SKIP')); if (b) b.click(); })()"
  });
  await new Promise(r => setTimeout(r, 1000));

  const initialY = await send('Runtime.evaluate', {
    expression: "(() => { const w = document.getElementById('works'); return { top: w.getBoundingClientRect().top, scrollY: window.scrollY }; })()",
    returnByValue: true
  });
  console.log('Before scroll:', initialY.result?.value);

  await send('Runtime.evaluate', {
    expression: "document.getElementById('works').scrollIntoView({ behavior: 'instant', block: 'start' })"
  });
  await new Promise(r => setTimeout(r, 600));

  const atEntry = await send('Runtime.evaluate', {
    expression: `(() => {
      const w = document.getElementById('works');
      const pinSpacer = document.querySelector('.pin-spacer');
      return {
        scrollY: window.scrollY,
        wRect: w.getBoundingClientRect(),
        hasPinSpacer: !!pinSpacer,
        pinSpacerRect: pinSpacer ? pinSpacer.getBoundingClientRect() : null,
        pinSpacerStyle: pinSpacer ? pinSpacer.getAttribute('style') : null
      };
    })()`,
    returnByValue: true
  });
  console.log('At entry:', atEntry.result?.value);

  await send('Runtime.evaluate', {
    expression: "window.scrollBy({ top: 400, behavior: 'instant' })"
  });
  await new Promise(r => setTimeout(r, 600));

  const at400 = await send('Runtime.evaluate', {
    expression: `(() => {
      const w = document.getElementById('works');
      const pinSpacer = document.querySelector('.pin-spacer');
      const container = pinSpacer ? pinSpacer.firstElementChild : w.firstElementChild;
      return {
        scrollY: window.scrollY,
        wRect: w.getBoundingClientRect(),
        pinSpacerRect: pinSpacer ? pinSpacer.getBoundingClientRect() : null,
        containerRect: container ? container.getBoundingClientRect() : null,
        containerStyle: container ? container.getAttribute('style') : null
      };
    })()`,
    returnByValue: true
  });
  console.log('At +400px:', at400.result?.value);

  ws.close();
  chrome.kill();
}

check().catch(console.error);
