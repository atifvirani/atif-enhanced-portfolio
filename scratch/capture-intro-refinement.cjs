const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.resolve('artifacts/visual-audit/intro-refinement');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.msgId = 1;
    this.callbacks = new Map();
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

async function main() {
  console.log('=== STARTING HIGH-FIDELITY INTRO VERIFICATION HARNESS ===');
  const chromePort = 9296;
  const tempProfile = path.join(process.env.TEMP || 'C:\\Temp', 'chrome_refinement_' + Date.now());

  const chrome = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${tempProfile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--enable-webgl',
    '--use-gl=angle',
    '--window-size=1440,900',
    'http://127.0.0.1:5173/'
  ]);

  await sleep(2200);

  const tabs = await new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${chromePort}/json`, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d)));
    }).on('error', reject);
  });

  const appTab = tabs.find(t => t.url.includes('5173'));
  if (!appTab) throw new Error('Could not find active Vite app tab');

  const client = new CDPClient(appTab.webSocketDebuggerUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');
  await client.setViewport(1440, 900, false);

  console.log('1. Waiting for WebGL canvas and timeline to mount...');
  await sleep(1500);

  // Helper to execute state change on the intro timeline and particle engine
  async function configureState(code) {
    await client.evaluate(`
      (() => {
        const tl = window.__INTRO_TIMELINE__;
        if (!tl) return;
        const gtl = tl.getTimeline();
        if (gtl) gtl.pause();
        const eng = tl.engine;
        ${code}
      })()
    `);
    await sleep(250);
  }

  console.log('\n--- CAPTURING ALL 15 DESKTOP INTRO SEQUENCE STAGES ---');

  // Stage 1: Initial black void
  await configureState(`
    tl.enterPhase('void');
  `);
  await client.captureScreenshot('01_void_initial.png');

  // Stage 2: Ring halfway through formation
  await configureState(`
    tl.enterPhase('ring');
    eng.updateRingProgress(0.50, 0, 1, 0.85);
  `);
  await client.captureScreenshot('02_ring_formation_halfway.png');

  // Stage 3: Completed ring
  await configureState(`
    tl.enterPhase('ring');
    eng.updateRingProgress(1.00, 0, 1, 1.0);
  `);
  await client.captureScreenshot('03_ring_formation_complete.png');

  // Stage 4: Impact moment (descending ring reaches surface)
  await configureState(`
    tl.enterPhase('impact');
    eng.uniforms.uDispersal.value = 0.68;
    eng.uniforms.uProgress.value = 0.25;
  `);
  await client.captureScreenshot('04_impact_moment.png');

  // Stage 5: Particle dispersal (outward fine silver dust wave)
  await configureState(`
    tl.enterPhase('impact');
    eng.uniforms.uDispersal.value = 0.14;
    eng.uniforms.uProgress.value = 0.88;
  `);
  await client.captureScreenshot('05_particle_dispersal.png');

  // Stage 6: ATIF fully formed
  await configureState(`
    tl.enterPhase('atif');
    eng.uniforms.uProgress.value = 1.0;
    eng.uniforms.uDispersal.value = 0.0;
    eng.uniforms.uDissolveProgress.value = 0.0;
  `);
  await client.captureScreenshot('06_atif_fully_formed.png');

  // Stage 7: ATIF dissolution (breaking into drifting dust field)
  await configureState(`
    tl.enterPhase('dissolution');
    eng.uniforms.uProgress.value = 1.0;
    eng.uniforms.uDissolveProgress.value = 0.58;
    eng.uniforms.uDispersal.value = 0.12;
  `);
  await client.captureScreenshot('07_atif_dissolution_dust.png');

  // Stage 8: PORTFOLIO halfway through formation
  await configureState(`
    tl.enterPhase('portfolio');
    eng.uniforms.uProgress.value = 0.65;
    eng.uniforms.uLetterStep.value = 5.2;
    eng.uniforms.uDispersal.value = 0.06;
  `);
  await client.captureScreenshot('08_portfolio_assembly_halfway.png');

  // Stage 9: PORTFOLIO fully formed
  await configureState(`
    tl.enterPhase('portfolio');
    eng.uniforms.uProgress.value = 1.0;
    eng.uniforms.uLetterStep.value = 10.0;
    eng.uniforms.uDispersal.value = 0.0;
  `);
  await client.captureScreenshot('09_portfolio_fully_formed.png');

  // Stage 10: Portrait halfway through reconstruction
  await configureState(`
    tl.enterPhase('portrait');
    eng.uniforms.uProgress.value = 0.55;
    eng.uniforms.uDispersal.value = 0.08;
  `);
  await client.captureScreenshot('10_portrait_reconstruction_halfway.png');

  // Stage 11: Final portrait before hero transition
  await configureState(`
    tl.enterPhase('portrait');
    eng.uniforms.uProgress.value = 1.0;
    eng.uniforms.uDispersal.value = 0.0;
  `);
  await client.captureScreenshot('11_final_portrait_formed.png');

  // Stage 12: Settled hero
  await client.evaluate(`
    (() => {
      if (window.__INTRO_TIMELINE__) {
        window.__INTRO_TIMELINE__.skip();
      }
    })()
  `);
  await sleep(1000);
  await client.captureScreenshot('12_settled_hero.png');

  // Stage 13: Hero under pointer interaction
  await client.send('Input.dispatchMouseEvent', {
    type: 'mouseMoved',
    x: 720,
    y: 380
  });
  await sleep(500);
  await client.captureScreenshot('13_hero_pointer_interaction.png');

  // Stage 14: Replay in progress
  await client.evaluate(`
    (() => {
      const replayBtn = document.querySelector('button[title*="Replay"]') || document.querySelector('button[aria-label*="Replay"]');
      if (replayBtn) replayBtn.click();
    })()
  `);
  await sleep(1200);
  await client.captureScreenshot('14_replay_in_progress.png');

  // Stage 15: Replay after completion
  await client.evaluate(`
    (() => {
      if (window.__INTRO_TIMELINE__) {
        window.__INTRO_TIMELINE__.skip();
      }
    })()
  `);
  await sleep(1000);
  await client.captureScreenshot('15_replay_completed_hero.png');

  console.log('\n--- CAPTURING ALL 6 RESPONSIVE VIEWPORT SIZES ---');

  const viewports = [
    { name: 'responsive_01_hero_1920x1080_desktop.png', width: 1920, height: 1080, mobile: false },
    { name: 'responsive_02_hero_1440x900_macbook.png', width: 1440, height: 900, mobile: false },
    { name: 'responsive_03_hero_1366x768_laptop.png', width: 1366, height: 768, mobile: false },
    { name: 'responsive_04_hero_768x1024_tablet.png', width: 768, height: 1024, mobile: true },
    { name: 'responsive_05_hero_390x844_mobile.png', width: 390, height: 844, mobile: true },
    { name: 'responsive_06_hero_320x700_narrow_mobile.png', width: 320, height: 700, mobile: true }
  ];

  for (const vp of viewports) {
    await client.setViewport(vp.width, vp.height, vp.mobile);
    await client.evaluate(`
      (async () => {
        if (window.__INTRO_TIMELINE__ && window.__INTRO_TIMELINE__.engine) {
          const eng = window.__INTRO_TIMELINE__.engine;
          await eng.handleResize();
          eng.targetMouse.set(9999, 9999);
          eng.currentMouse.set(9999, 9999);
          eng.uniforms.uMouse.value.set(9999, 9999);
          if (eng.particlePoints) eng.particlePoints.rotation.set(0, 0, 0);
        }
        window.scrollTo(0, 0);
      })()
    `);
    await sleep(1400);
    await client.captureScreenshot(vp.name);
  }

  // Also capture mobile intro ring and mobile portrait reconstruction
  await client.setViewport(390, 844, true);
  await configureState(`
    tl.enterPhase('ring');
    eng.updateRingProgress(1.0, 0, 1, 1.0);
  `);
  await client.captureScreenshot('responsive_07_mobile_ring_390x844.png');

  await configureState(`
    tl.enterPhase('portrait');
    eng.uniforms.uProgress.value = 1.0;
  `);
  await client.captureScreenshot('responsive_08_mobile_portrait_390x844.png');

  console.log('\n=== ALL CAPTURES FINISHED SUCCESSFULLY ===');
  client.close();
  chrome.kill();
}

main().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
