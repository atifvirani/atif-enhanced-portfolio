const { spawn } = require('child_process');
const http = require('http');

async function test() {
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9290',
    '--enable-webgl',
    '--window-size=1440,900',
    'http://localhost:5173/'
  ]);

  await new Promise(r => setTimeout(r, 2000));
  const list = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9290/json/list', res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
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
  await send('Page.navigate', { url: 'http://localhost:5173/' });
  await new Promise(r => setTimeout(r, 2000));

  const skipResult = await send('Runtime.evaluate', {
    expression: `(() => {
      const btn = document.querySelector('button[aria-label="Skip intro animation"]') ||
                  Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('SKIP'));
      if (btn) {
        btn.click();
        return 'Clicked skip button';
      }
      return 'No skip button found';
    })()`,
    returnByValue: true
  });
  console.log('Skip result:', skipResult.result?.value);
  await new Promise(r => setTimeout(r, 1200));

  const status = await send('Runtime.evaluate', {
    expression: `(() => {
      const works = document.getElementById('works');
      return {
        hasWorks: !!works,
        worksTop: works ? works.offsetTop : null,
        bodyHeight: document.body.scrollHeight,
        scrollY: window.scrollY
      };
    })()`,
    returnByValue: true
  });
  console.log('Status after skip:', status.result?.value);

  await send('Runtime.evaluate', {
    expression: "document.getElementById('works')?.scrollIntoView({ behavior: 'instant', block: 'start' })"
  });
  await new Promise(r => setTimeout(r, 600));
  const entryY = await send('Runtime.evaluate', { expression: 'window.scrollY', returnByValue: true });
  console.log('ScrollY after scrollIntoView:', entryY.result?.value);

  await send('Runtime.evaluate', { expression: 'window.scrollBy({ top: 800, behavior: "instant" })' });
  await new Promise(r => setTimeout(r, 600));

  const midInfo = await send('Runtime.evaluate', {
    expression: `(() => {
      const sec = document.getElementById('works');
      const pinSpacer = document.querySelector('.pin-spacer');
      const pinContainer = sec.querySelector('div');
      const cards = sec.querySelectorAll('.curved-tile-wrapper');
      return {
        scrollY: window.scrollY,
        secRect: sec.getBoundingClientRect(),
        pinSpacerRect: pinSpacer ? pinSpacer.getBoundingClientRect() : null,
        pinContainerStyle: pinContainer ? pinContainer.getAttribute('style') : null,
        cardsCount: cards.length,
        card0Rect: cards[0] ? cards[0].getBoundingClientRect() : null,
        card1Rect: cards[1] ? cards[1].getBoundingClientRect() : null
      };
    })()`,
    returnByValue: true
  });
  console.log('Mid info:', JSON.stringify(midInfo.result.value, null, 2));

  ws.close();
  chrome.kill();
}

test().catch(console.error);
