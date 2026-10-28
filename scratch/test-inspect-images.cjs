const { spawn } = require('child_process');
const http = require('http');

async function inspectImagesInBrowser() {
  const chromePort = 9292;
  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=' + chromePort,
    '--no-first-run',
    '--no-default-browser-check',
    '--enable-webgl',
    '--use-gl=angle',
    'http://127.0.0.1:5173/'
  ]);

  await new Promise(r => setTimeout(r, 1500));

  const tabs = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:' + chromePort + '/json', res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const appTab = tabs.find(t => t.url.includes('5173'));
  const ws = new WebSocket(appTab.webSocketDebuggerUrl);
  await new Promise(r => ws.onopen = r);

  let msgId = 1;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = msgId++;
    const handler = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id === id) {
        ws.removeEventListener('message', handler);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      }
    };
    ws.addEventListener('message', handler);
    ws.send(JSON.stringify({ id, method, params }));
  });

  const evalCode = async (expr) => {
    const res = await send('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
    return res.result ? res.result.value : res;
  };

  const expr = `
    (async () => {
      async function testImg(url) {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
            let darkCount = 0, midCount = 0, brightCount = 0, whiteBg = 0, blackBg = 0, alphaZero = 0;
            for (let i = 0; i < data.length; i += 4) {
              const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
              if (a < 10) { alphaZero++; continue; }
              const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
              if (lum < 0.05) blackBg++;
              else if (lum > 0.95) whiteBg++;
              else if (lum < 0.3) darkCount++;
              else if (lum < 0.7) midCount++;
              else brightCount++;
            }
            resolve({
              url,
              w: img.naturalWidth,
              h: img.naturalHeight,
              totalPixels: canvas.width * canvas.height,
              alphaZero,
              blackBg,
              whiteBg,
              darkCount,
              midCount,
              brightCount
            });
          };
          img.onerror = () => resolve({ url, error: 'failed to load' });
          img.src = url;
        });
      }

      return {
        ref: await testImg('/images/atif-particle-reference.png'),
        portraitIsolated: await testImg('/images/atif-portrait-isolated.png'),
        portraitOrig: await testImg('/images/atif-portrait.jpg'),
        rootMockup: await testImg('/Particle Portrait Portfolio — Mohammed Atif.png')
      };
    })()
  `;

  const result = await evalCode(expr);
  console.log(JSON.stringify(result, null, 2));
  ws.close();
  chrome.kill();
}

inspectImagesInBrowser().catch(console.error);
