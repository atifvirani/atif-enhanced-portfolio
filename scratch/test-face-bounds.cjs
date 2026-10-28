const { spawn } = require('child_process');
const http = require('http');

async function testFaceFeatures() {
  const chromePort = 9294;
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
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
          
          let minX = canvas.width, maxX = 0, minY = canvas.height, maxY = 0;
          let faceMinX = canvas.width, faceMaxX = 0, faceMinY = canvas.height, faceMaxY = 0;

          for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
              const i = (y * canvas.width + x) * 4;
              const a = data[i+3];
              if (a < 20) continue;
              const lum = (0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2]) / 255;
              if (lum > 0.04) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
              }
              if (lum > 0.35) { // facial skin highlights
                if (x < faceMinX) faceMinX = x;
                if (x > faceMaxX) faceMaxX = x;
                if (y < faceMinY) faceMinY = y;
                if (y > faceMaxY) faceMaxY = y;
              }
            }
          }
          resolve({
            dimensions: { w: canvas.width, h: canvas.height },
            fullBust: { minX, maxX, minY, maxY, w: maxX - minX, h: maxY - minY },
            faceOnly: { faceMinX, faceMaxX, faceMinY, faceMaxY, w: faceMaxX - faceMinX, h: faceMaxY - faceMinY,
                        centerX: (faceMinX + faceMaxX) / 2, centerY: (faceMinY + faceMaxY) / 2 }
          });
        };
        img.src = '/images/atif-particle-reference.png';
      });
    })()
  `;

  const res = await evalCode(expr);
  console.log(JSON.stringify(res, null, 2));
  ws.close();
  chrome.kill();
}

testFaceFeatures().catch(console.error);
