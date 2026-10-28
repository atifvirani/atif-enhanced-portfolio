const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('artifacts/final-visual-audit/screenshots');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function httpGetJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.msgId = 1;
    this.callbacks = new Map();
    this.consoleLogs = [];
  }

  async connect() {
    this.ws = new WebSocket(this.wsUrl);
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve;
      this.ws.onerror = reject;
    });

    this.ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.callbacks.has(msg.id)) {
        const { resolve, reject } = this.callbacks.get(msg.id);
        this.callbacks.delete(msg.id);
        if (msg.error) reject(msg.error);
        else resolve(msg.result);
      } else if (msg.method) {
        if (msg.method === 'Runtime.consoleAPICalled') {
          this.consoleLogs.push(msg.params);
        }
      }
    };
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error('Evaluation failed: ' + JSON.stringify(res.exceptionDetails));
    }
    return res.result ? res.result.value : undefined;
  }

  async setViewport(width, height, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: isMobile
    });
  }

  async setReducedMotion(enabled) {
    await this.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-reduced-motion', value: enabled ? 'reduce' : 'no-preference' }]
    });
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png' });
    const fullPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(fullPath, Buffer.from(res.data, 'base64'));
    console.log(`[Captured] ${filename} (${fs.statSync(fullPath).size} bytes)`);
    return fullPath;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  console.log('=== STARTING PRECISION FINAL AUDIT RUNNER ===');
  const chromePort = 9280;
  const tempProfile = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_audit_profile_' + Date.now());

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--enable-webgl',
    '--use-gl=angle',
    '--window-size=1440,900',
    'http://localhost:5173/'
  ]);

  chrome.on('error', err => console.error('Chrome spawn error:', err));
  await sleep(2500);

  const targets = await httpGetJson(`http://127.0.0.1:${chromePort}/json/list`);
  const pageTarget = targets.find(t => t.type === 'page');
  if (!pageTarget) throw new Error('No page target found');

  const cdp = new CDPClient(pageTarget.webSocketDebuggerUrl);
  await cdp.connect();

  await cdp.send('Page.enable');
  await cdp.send('Runtime.enable');

  // =========================================================================
  // 1. INTRO SEQUENCE RECORDING (1440x900)
  // Timeline:
  // 0.00s - 1.05s: Loader Ring
  // 1.05s - 2.05s: Impact / Center Burst
  // 2.05s - 4.30s: Morph to ATIF (settles around 3.8s)
  // 4.30s - 6.85s: Morph to PORTFOLIO (settles around 6.2s)
  // 6.85s - 9.60s: Morph to Portrait (settles around 9.0s)
  // 9.60s+: Settled portfolio
  // =========================================================================
  console.log('\n--- 1. Auditing Exact Intro Timeline Stages ---');
  await cdp.setViewport(1440, 900);
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });

  // Stage 1: Loader Ring (0.6s)
  await sleep(600);
  await cdp.captureScreenshot('01_intro_01_loader_ring.png');

  // Stage 2: Impact / Center Burst (1.5s total -> +900ms)
  await sleep(900);
  await cdp.captureScreenshot('01_intro_02_impact_burst.png');

  // Stage 3: ATIF Wordmark converged (3.8s total -> +2300ms)
  await sleep(2300);
  await cdp.captureScreenshot('01_intro_03_atif_wordmark.png');

  // Stage 4: PORTFOLIO Wordmark converged (6.2s total -> +2400ms)
  await sleep(2400);
  await cdp.captureScreenshot('01_intro_04_portfolio_formation.png');

  // Stage 5: Portrait Reconstruction (8.8s total -> +2600ms)
  await sleep(2600);
  await cdp.captureScreenshot('01_intro_05_portrait_reconstruction.png');

  // Stage 6: Settled Portfolio (10.6s total -> +1800ms)
  await sleep(1800);
  await cdp.captureScreenshot('01_intro_06_settled_portfolio.png');

  // Test Replay Button
  console.log('\n--- 2. Testing Intro Replay Multiple Times ---');
  await cdp.evaluate(`
    (() => {
      const replayBtn = document.querySelector('button[aria-label="Replay intro animation"]') ||
                        Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('replay intro'));
      if (replayBtn) replayBtn.click();
    })()
  `);
  await sleep(3500); // Wait until mid-replay (ATIF formation)
  await cdp.captureScreenshot('01_intro_07_replay_in_progress.png');

  // Skip intro to settled state
  console.log('Skipping intro to settled portfolio state...');
  await cdp.evaluate(`
    (() => {
      const skipBtn = document.querySelector('button[aria-label="Skip intro animation"]') ||
                      Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('skip'));
      if (skipBtn) skipBtn.click();
      else window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    })()
  `);
  await sleep(1200);

  // Wait until portfolio is completely settled and DOM elements exist
  const isSettled = await cdp.evaluate(`
    (() => {
      return !!document.getElementById('about') && !!document.getElementById('works');
    })()
  `);
  console.log('Portfolio settled after skip:', isSettled);

  // =========================================================================
  // 3. SETTLED HERO AUDIT ACROSS ALL 6 VIEWPORTS
  // =========================================================================
  console.log('\n--- 3. Auditing Settled Hero Across 6 Viewports ---');
  const viewports = [
    { name: '1920x1080_desktop_fhd', w: 1920, h: 1080, mobile: false },
    { name: '1440x900_desktop_mac',   w: 1440, h: 900,  mobile: false },
    { name: '1366x768_laptop',        w: 1366, h: 768,  mobile: false },
    { name: '768x1024_tablet',        w: 768,  h: 1024, mobile: true },
    { name: '390x844_mobile',         w: 390,  h: 844,  mobile: true },
    { name: '320x700_mobile_narrow',  w: 320,  h: 700,  mobile: true }
  ];

  for (const vp of viewports) {
    await cdp.setViewport(vp.w, vp.h, vp.mobile);
    await cdp.evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
    await sleep(400);
    await cdp.captureScreenshot(`03_hero_${vp.name}.png`);
  }

  // =========================================================================
  // 4. SECTION-BY-SECTION AUDIT (1440x900 Desktop)
  // =========================================================================
  console.log('\n--- 4. Auditing Sections on Desktop (1440x900) ---');
  await cdp.setViewport(1440, 900, false);

  // About Section
  await cdp.evaluate(`document.getElementById('about')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(600);
  await cdp.captureScreenshot('04_section_about_1440x900.png');

  // Projects Section - Entry
  await cdp.evaluate(`document.getElementById('works')?.scrollIntoView({ behavior: 'instant', block: 'start' })`);
  await sleep(600);
  await cdp.captureScreenshot('04_section_projects_01_entry_1440x900.png');

  // Projects Section - Middle Pin/Curvature Scrub
  await cdp.evaluate(`window.scrollBy({ top: 400, behavior: 'instant' })`);
  await sleep(600);
  await cdp.captureScreenshot('04_section_projects_02_middle_pin_1440x900.png');

  // Projects Section - Exit / Transition
  await cdp.evaluate(`window.scrollBy({ top: 900, behavior: 'instant' })`);
  await sleep(600);
  await cdp.captureScreenshot('04_section_projects_03_exit_1440x900.png');

  // Skills Section
  await cdp.evaluate(`document.getElementById('skills')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(600);
  await cdp.captureScreenshot('04_section_skills_1440x900.png');

  // Journey Section
  await cdp.evaluate(`document.getElementById('journey')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(600);
  await cdp.captureScreenshot('04_section_journey_1440x900.png');

  // Contact Section
  await cdp.evaluate(`document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(600);
  await cdp.captureScreenshot('04_section_contact_1440x900.png');

  // ASCII ATIF Footer - Resting
  await cdp.evaluate(`window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })`);
  await sleep(800);
  await cdp.captureScreenshot('04_section_footer_01_resting_1440x900.png');

  // ASCII ATIF Footer - Pointer Interaction Deflection
  const canvasBox = await cdp.evaluate(`
    (() => {
      const canvas = document.querySelector('footer canvas');
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      return { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
    })()
  `);

  if (canvasBox) {
    const cx = canvasBox.x + canvasBox.width / 2;
    const cy = canvasBox.y + canvasBox.height / 2;
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: cx,
      y: cy
    });
    await sleep(250);
    await cdp.captureScreenshot('04_section_footer_02_deflected_1440x900.png');

    // Move away & verify recovery
    await cdp.send('Input.dispatchMouseEvent', {
      type: 'mouseMoved',
      x: 50,
      y: 50
    });
    await sleep(600);
    await cdp.captureScreenshot('04_section_footer_03_recovered_1440x900.png');
  }

  // =========================================================================
  // 5. MOBILE WALKTHROUGH (390x844 & 320x700)
  // =========================================================================
  console.log('\n--- 5. Auditing Mobile Walkthrough (390x844) ---');
  await cdp.setViewport(390, 844, true);

  await cdp.evaluate(`document.getElementById('about')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(500);
  await cdp.captureScreenshot('05_mobile_about_390x844.png');

  await cdp.evaluate(`document.getElementById('works')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(500);
  await cdp.captureScreenshot('05_mobile_projects_390x844.png');

  await cdp.evaluate(`document.getElementById('skills')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(500);
  await cdp.captureScreenshot('05_mobile_skills_390x844.png');

  await cdp.evaluate(`document.getElementById('journey')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(500);
  await cdp.captureScreenshot('05_mobile_journey_390x844.png');

  await cdp.evaluate(`document.getElementById('contact')?.scrollIntoView({ behavior: 'instant' })`);
  await sleep(500);
  await cdp.captureScreenshot('05_mobile_contact_390x844.png');

  await cdp.evaluate(`window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })`);
  await sleep(600);
  await cdp.captureScreenshot('05_mobile_footer_390x844.png');

  console.log('\n--- 6. Auditing Mobile Stress Width (320x700) ---');
  await cdp.setViewport(320, 700, true);
  await cdp.evaluate(`window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })`);
  await sleep(600);
  await cdp.captureScreenshot('05_mobile_footer_320x700.png');

  // =========================================================================
  // 6. REDUCED MOTION STATE AUDIT
  // =========================================================================
  console.log('\n--- 7. Auditing Reduced Motion Mode ---');
  await cdp.setViewport(1440, 900, false);
  await cdp.setReducedMotion(true);
  await cdp.send('Page.navigate', { url: 'http://localhost:5173/' });
  await sleep(1500); // Initial load under reduced motion immediately renders settled hero
  await cdp.captureScreenshot('02_reduced_motion_hero_settled.png');

  await cdp.evaluate(`window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })`);
  await sleep(600);
  await cdp.captureScreenshot('02_reduced_motion_ascii_footer.png');

  // =========================================================================
  // 7. PERFORMANCE TELEMETRY
  // =========================================================================
  console.log('\n--- 8. Telemetry Frame Rate Measurement ---');
  await cdp.setReducedMotion(false);
  await cdp.setViewport(1440, 900, false);
  await cdp.evaluate(`window.scrollTo({ top: 0, behavior: 'instant' })`);
  await sleep(500);

  const heroFps = await cdp.evaluate(`
    new Promise(resolve => {
      const frameDeltas = [];
      let last = performance.now();
      let count = 0;
      function tick(now) {
        frameDeltas.push(now - last);
        last = now;
        count++;
        if (count < 60) requestAnimationFrame(tick);
        else {
          const avg = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
          const fps = 1000 / avg;
          resolve({ avgDeltaMs: avg.toFixed(2), fps: fps.toFixed(1), maxDeltaMs: Math.max(...frameDeltas).toFixed(2), count: frameDeltas.length });
        }
      }
      requestAnimationFrame(tick);
    })
  `);
  console.log('Hero Three.js Animation FPS:', heroFps);

  await cdp.evaluate(`window.scrollTo({ top: document.body.scrollHeight, behavior: 'instant' })`);
  await sleep(500);

  const footerFps = await cdp.evaluate(`
    new Promise(resolve => {
      const frameDeltas = [];
      let last = performance.now();
      let count = 0;
      function tick(now) {
        frameDeltas.push(now - last);
        last = now;
        count++;
        if (count < 60) requestAnimationFrame(tick);
        else {
          const avg = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
          const fps = 1000 / avg;
          resolve({ avgDeltaMs: avg.toFixed(2), fps: fps.toFixed(1), maxDeltaMs: Math.max(...frameDeltas).toFixed(2), count: frameDeltas.length });
        }
      }
      requestAnimationFrame(tick);
    })
  `);
  console.log('ASCII Footer Animation FPS:', footerFps);

  cdp.close();
  chrome.kill();
  console.log('=== PRECISION FINAL AUDIT FINISHED ===');
}

run().catch(err => {
  console.error('Audit fatal error:', err);
  process.exit(1);
});
