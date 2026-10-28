import * as THREE from 'three'
import {
  calculateViewportProjection,
  generateAllParticleTargets,
  type TargetSet,
  type ViewportProjection,
} from './ParticleTargetGenerator'

export interface EngineCallbacks {
  onIntroComplete?: () => void
  onRingComplete?: () => void
  onImpact?: () => void
}

export class CinematicParticleEngine {
  private container: HTMLElement | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private renderer: THREE.WebGLRenderer | null = null
  private animationFrameId: number | null = null

  // Ring Mesh for Phase 01 & 02
  private ringMesh: THREE.Mesh | null = null
  private ringMaterial: THREE.ShaderMaterial | null = null
  private ringRadius = 2.5
  private ringThickness = 0.35

  // Volumetric Atmospheric Light Beams
  private lightMesh: THREE.Mesh | null = null
  private lightMaterial: THREE.ShaderMaterial | null = null
  private lightUniforms = {
    uTime: { value: 0.0 },
    uScrollProgress: { value: 0.0 },
    uAspect: { value: 1.0 },
    uIntensity: { value: 0.85 },
  }

  // Particle System
  public particleCount = 20000
  private geometry: THREE.BufferGeometry | null = null
  private shaderMaterial: THREE.ShaderMaterial | null = null
  private particlePoints: THREE.Points | null = null

  // Target Buffers
  private targets: TargetSet | null = null
  public projection: ViewportProjection | null = null

  // Shader Uniform Values
  public uniforms = {
    uProgress: { value: 0.0 },
    uTime: { value: 0.0 },
    uDispersal: { value: 0.0 },
    uDissolveProgress: { value: 0.0 },
    uLetterStep: { value: 0.0 },
    uSweep: { value: 0.0 },
    uPointSize: { value: 1.25 },
    uDpr: { value: 1.0 },
    uOpacity: { value: 0.0 },
    uTableSettled: { value: 0.0 },
    uScrollProgress: { value: 0.0 },
    uIsScrollActive: { value: 0.0 },
    uMouse: { value: new THREE.Vector2(9999, 9999) },
    uMouseRadius: { value: 9.5 },
    uMouseStrength: { value: 0.95 },
  }

  // Ring Uniforms
  private ringUniforms = {
    uRingProgress: { value: 0.0 },
    uRingOpacity: { value: 0.0 },
  }

  // Pointer & Scroll Tracking for Genuine Parallax
  private targetMouse = new THREE.Vector2(9999, 9999)
  private currentMouse = new THREE.Vector2(9999, 9999)

  public isTabletopActive = false
  public isScrollControlActive = false
  private lastFrameTime = performance.now()

  public callbacks: EngineCallbacks

  constructor(callbacks: EngineCallbacks = {}) {
    this.callbacks = callbacks
  }

  public async init(container: HTMLElement): Promise<void> {
    this.container = container
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // 1. Projection & Camera
    this.projection = calculateViewportProjection(width, height, 110, 54)
    this.particleCount = this.projection.isMobile ? 20000 : 34000

    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 1000)
    this.camera.position.set(0, 0, 110)

    // 2. High-performance WebGL Renderer
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.uniforms.uDpr.value = dpr
    this.uniforms.uPointSize.value = this.projection.isMobile ? 1.85 : 1.70

    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
      stencil: false,
      depth: false,
    })
    this.renderer.setPixelRatio(dpr)
    this.renderer.setSize(width, height)
    this.renderer.setClearColor(0x000000, 1)

    container.appendChild(this.renderer.domElement)
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0'
    this.renderer.domElement.style.left = '0'
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    this.renderer.domElement.style.pointerEvents = 'none'

    // 3. Create Ring Geometry & Shader
    this.createRing()

    // 4. Create Atmospheric Volumetric Light Quad
    this.createAtmosphericLight()

    // 5. Precompute all particle targets with projection coordinates
    this.targets = await generateAllParticleTargets(this.particleCount, this.projection)

    // 6. Create GPU Particle System
    this.createParticleSystem()

    // 6. Listeners
    window.addEventListener('mousemove', this.handleMouseMove, { passive: true })
    window.addEventListener('mouseleave', this.handleMouseLeave, { passive: true })
    window.addEventListener('touchmove', this.handleTouchMove, { passive: true })
    window.addEventListener('touchend', this.handleMouseLeave, { passive: true })
    window.addEventListener('resize', this.handleResize, { passive: true })

    // 7. Start render loop
    this.animate()
  }

  private createRing(): void {
    if (!this.scene) return

    const innerRadius = this.ringRadius - this.ringThickness * 0.5
    const outerRadius = this.ringRadius + this.ringThickness * 0.5
    const ringGeo = new THREE.RingGeometry(innerRadius, outerRadius, 128)

    this.ringMaterial = new THREE.ShaderMaterial({
      uniforms: this.ringUniforms,
      vertexShader: `
        varying vec2 vPosition;
        void main() {
          vPosition = position.xy;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uRingProgress;
        uniform float uRingOpacity;
        varying vec2 vPosition;
        const float PI = 3.14159265358979323846;

        void main() {
          float angle = atan(-vPosition.x, vPosition.y);
          if (angle < 0.0) angle += 2.0 * PI;

          float threshold = uRingProgress * 2.0 * PI;
          if (angle > threshold) discard;

          gl_FragColor = vec4(1.0, 1.0, 1.0, uRingOpacity);
        }
      `,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    })

    this.ringMesh = new THREE.Mesh(ringGeo, this.ringMaterial)
    this.ringMesh.visible = false
    this.scene.add(this.ringMesh)
  }

  private createAtmosphericLight(): void {
    if (!this.scene || !this.projection) return

    // High-resolution quad positioned in the background plane behind particles
    const width = this.projection.visibleWidth * 1.6
    const height = this.projection.visibleHeight * 1.6
    const lightGeo = new THREE.PlaneGeometry(width, height)

    this.lightUniforms.uAspect.value = this.projection.visibleWidth / this.projection.visibleHeight

    this.lightMaterial = new THREE.ShaderMaterial({
      uniforms: this.lightUniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uScrollProgress;
        uniform float uAspect;
        uniform float uIntensity;
        varying vec2 vUv;

        void main() {
          // Origin is slightly above top-center fold
          vec2 origin = vec2(0.50, 1.14);
          vec2 delta = vec2((vUv.x - origin.x) * uAspect, origin.y - vUv.y);
          float dist = length(delta);
          float angle = atan(delta.x, delta.y);

          // 1. Diffused downward cone with soft horizontal limits
          float coneWidth = vUv.y * 0.50 + 0.36;
          float cone = smoothstep(coneWidth, 0.03, abs(vUv.x - 0.50));

          // 2. Multi-octave harmonic volumetric light shafts drifting with time
          float ray1 = sin(angle * 16.0 + uTime * 0.12) * 0.5 + 0.5;
          float ray2 = sin(angle * 28.0 - uTime * 0.07 + 1.8) * 0.5 + 0.5;
          float ray3 = sin(angle * 44.0 + uTime * 0.16 + 3.4) * 0.5 + 0.5;
          float shafts = pow(ray1 * 0.52 + ray2 * 0.30 + ray3 * 0.18, 2.3);

          // 3. Natural exponential vertical decay into deep black
          float verticalFalloff = exp(-dist * 1.55);
          float bottomFade = smoothstep(0.02, 0.40, vUv.y);

          // 4. Central facial feature preservation mask:
          // Keep the central portrait area clear of heavy haze so fine particles pop
          float faceDist = length(vec2((vUv.x - 0.50) * 1.5, vUv.y - 0.50));
          float facePreserve = smoothstep(0.08, 0.38, faceDist) * 0.35 + 0.65;

          // 5. Ambient atmospheric haze layer
          float ambientHaze = exp(-dist * 2.0) * 0.32;
          float totalLight = (shafts * 0.65 + ambientHaze) * cone * verticalFalloff * bottomFade * facePreserve;

          // 6. Smooth scroll decay: fades softly as hero scrolls away into About
          float scrollFade = 1.0 - smoothstep(0.25, 0.85, uScrollProgress);
          totalLight *= scrollFade * uIntensity;

          // 7. Platinum silver-white palette (restrained, non-neon, no cyan/magenta tint)
          vec3 coreRay = vec3(0.88, 0.91, 0.96);
          vec3 mistColor = vec3(0.68, 0.72, 0.78);
          vec3 finalColor = mix(mistColor, coreRay, shafts);

          // 8. High-frequency dither to eliminate any banding on standard 8-bit displays
          float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) * (1.0 / 255.0);
          float finalAlpha = clamp(totalLight + dither, 0.0, 0.14);

          gl_FragColor = vec4(finalColor, finalAlpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    })

    this.lightMesh = new THREE.Mesh(lightGeo, this.lightMaterial)
    this.lightMesh.position.set(0, 0, -25)
    this.lightMesh.renderOrder = -1
    this.scene.add(this.lightMesh)
  }

  private createParticleSystem(): void {
    if (!this.scene || !this.targets) return

    const N = this.particleCount
    this.geometry = new THREE.BufferGeometry()

    const currentPositions = new Float32Array(this.targets.ringImpact)
    const targetPositions = new Float32Array(this.targets.ringImpact)
    const tablePositions = new Float32Array(this.targets.table)
    const portraitPositions = new Float32Array(this.targets.portrait)
    const portraitBrightness = new Float32Array(this.targets.portraitBrightness)
    const portraitSizes = new Float32Array(this.targets.portraitSizes)
    const portraitTones = new Float32Array(this.targets.portraitTones)
    const randomSeeds = new Float32Array(N * 3)
    const letterIndices = new Float32Array(N)
    const dissolveNoise = new Float32Array(N)
    const alphas = new Float32Array(N)
    const sizes = new Float32Array(N)
    const tones = new Float32Array(N * 3)

    for (let i = 0; i < N; i++) {
      const i3 = i * 3
      randomSeeds[i3] = Math.random()
      randomSeeds[i3 + 1] = Math.random()
      randomSeeds[i3 + 2] = Math.random()
      letterIndices[i] = 0
      dissolveNoise[i] = Math.random()
      alphas[i] = 0.65 + Math.random() * 0.20
      sizes[i] = 0.50 + Math.random() * 0.20
      tones[i3] = 0.85
      tones[i3 + 1] = 0.88
      tones[i3 + 2] = 0.92
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(currentPositions, 3))
    this.geometry.setAttribute('aTargetPos', new THREE.BufferAttribute(targetPositions, 3))
    this.geometry.setAttribute('aTablePos', new THREE.BufferAttribute(tablePositions, 3))
    this.geometry.setAttribute('aPortraitPos', new THREE.BufferAttribute(portraitPositions, 3))
    this.geometry.setAttribute('aPortraitBrightness', new THREE.BufferAttribute(portraitBrightness, 1))
    this.geometry.setAttribute('aPortraitSize', new THREE.BufferAttribute(portraitSizes, 1))
    this.geometry.setAttribute('aPortraitTone', new THREE.BufferAttribute(portraitTones, 3))
    this.geometry.setAttribute('aRandom', new THREE.BufferAttribute(randomSeeds, 3))
    this.geometry.setAttribute('aLetterIdx', new THREE.BufferAttribute(letterIndices, 1))
    this.geometry.setAttribute('aDissolveNoise', new THREE.BufferAttribute(dissolveNoise, 1))
    this.geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1))
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    this.geometry.setAttribute('aTone', new THREE.BufferAttribute(tones, 3))

    // High-precision GPU shader supporting fine dust grains, tonal separation, and subtle cursor interaction
    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        attribute vec3 aTargetPos;
        attribute vec3 aTablePos;
        attribute vec3 aPortraitPos;
        attribute float aPortraitBrightness;
        attribute float aPortraitSize;
        attribute vec3 aPortraitTone;
        attribute vec3 aRandom;
        attribute float aLetterIdx;
        attribute float aDissolveNoise;
        attribute float aAlpha;
        attribute float aSize;
        attribute vec3 aTone;

        uniform float uProgress;
        uniform float uTime;
        uniform float uDispersal;
        uniform float uDissolveProgress;
        uniform float uLetterStep;
        uniform float uSweep;
        uniform float uPointSize;
        uniform float uDpr;
        uniform float uOpacity;
        uniform float uTableSettled;
        uniform float uScrollProgress;
        uniform float uIsScrollActive;
        uniform vec2 uMouse;
        uniform float uMouseRadius;
        uniform float uMouseStrength;

        varying float vAlpha;
        varying vec3 vColor;

        void main() {
          vec3 pos;
          float baseAlpha = aAlpha * uOpacity;
          float currentSize = aSize;
          vec3 currentTone = aTone;

          if (uIsScrollActive > 0.5) {
            // ========================================================
            // HERO & NATURAL SCROLL INTERACTION (Anchored on Portrait)
            // ========================================================
            float p = clamp(uScrollProgress, 0.0, 1.0);

            // Base position is the refined living portrait
            pos = aPortraitPos;
            currentTone = aPortraitTone;
            currentSize = aPortraitSize;
            float portraitAlpha = aPortraitBrightness;
            baseAlpha = portraitAlpha * uOpacity;

            // Subtle parallax and organic dispersal as hero scrolls away:
            // 1. Portrait moves subtly upward
            pos.y += p * 18.0;
            // 2. Soft depth shift
            pos.z -= p * 14.0;

            // 3. Delicate outer dispersion: dust halo & lower torso grains drift gently
            vec3 driftDir = normalize(aRandom - 0.5);
            float driftSensitivity = 1.0 - smoothstep(0.35, 0.85, aPortraitBrightness);
            pos += driftDir * (p * 15.0 * driftSensitivity);

            // 4. Soft fade as hero scrolls out of view toward About section
            baseAlpha *= (1.0 - smoothstep(0.70, 1.0, p));

          } else {
            // ========================================================
            // INTRO CHOREOGRAPHY (Phases 1 - 8)
            // ========================================================
            float staggered = clamp((uProgress - aRandom.x * 0.20) / 0.80, 0.0, 1.0);
            float t = smoothstep(0.0, 1.0, staggered);
            pos = mix(position, aTargetPos, t);

            // 1. Salt blast / transition arc dispersal
            if (uDispersal > 0.0) {
              vec3 dir = normalize(aRandom - 0.5);
              float dispersalMultiplier = uDispersal * (30.0 + aRandom.y * 22.0);
              // Parabolic outward release during morph transitions (e.g. PORTFOLIO into Portrait)
              if (uProgress > 0.01 && uProgress < 0.99) {
                float arc = sin(t * 3.14159);
                pos += dir * (dispersalMultiplier * arc);
                pos.y -= uDispersal * arc * 4.0;
              } else {
                pos += dir * dispersalMultiplier;
                pos.y -= uDispersal * 8.0;
              }
            }

            // 2. Thanos-style dissolution wave across ATIF (directional sweep, gentle outward drift)
            float dissolveFactor = 0.0;
            if (uDissolveProgress > 0.0) {
              float waveThreshold = uDissolveProgress * 1.35 - 0.15;
              if (aDissolveNoise < waveThreshold) {
                float delta = waveThreshold - aDissolveNoise;
                float drift = smoothstep(0.0, 0.45, delta);
                pos.y += drift * (14.0 + aRandom.z * 10.0);
                pos.x += (aRandom.x - 0.35) * drift * 16.0;
                pos.z += (aRandom.y - 0.5) * drift * 10.0;
                dissolveFactor = smoothstep(0.0, 0.45, delta);
              }
            }

            // 3. Progressive assembly across letters for PORTFOLIO with intra-letter group travel
            if (uLetterStep > 0.0 && uLetterStep < 9.8) {
              float letterProgress = uLetterStep - aLetterIdx;
              float intraStagger = aRandom.x * 0.35;
              float assembleT = clamp((letterProgress - intraStagger) / 0.65, 0.0, 1.0);
              if (assembleT < 1.0) {
                float unassembled = 1.0 - smoothstep(0.0, 1.0, assembleT);
                pos.x += (aRandom.x - 0.5) * unassembled * 9.0;
                pos.y += (aRandom.y - 0.5) * unassembled * 10.0;
                pos.z += (aRandom.z - 0.5) * unassembled * 6.0;
              }
            }

            // 4. Tabletop flattening
            if (uTableSettled > 0.0) {
              pos.y = mix(pos.y, (aRandom.y - 0.5) * 55.0 - 15.0, uTableSettled);
              pos.z = mix(pos.z, (aRandom.z - 0.5) * 45.0, uTableSettled);
            }

            baseAlpha *= (1.0 - dissolveFactor);
          }

          // Subtle, restrained cursor deflection field (smooth recovery, preserves facial structure)
          vec2 toMouse = pos.xy - uMouse;
          float distToMouse = length(toMouse);
          if (distToMouse < uMouseRadius && distToMouse > 0.001) {
            float normDist = distToMouse / uMouseRadius;
            float force = pow(1.0 - normDist, 2.5); // delicate cubic falloff
            vec2 push = normalize(toMouse) * force * uMouseStrength;
            pos.xy += push;
          }

          // Subtle organic micro-hover
          pos.x += sin(uTime * 0.7 + aRandom.y * 6.28) * 0.16;
          pos.y += cos(uTime * 0.6 + aRandom.x * 6.28) * 0.16;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Fine-grained silver dust grain size
          float grain = uPointSize * currentSize * (0.85 + aRandom.z * 0.30);
          gl_PointSize = clamp(grain * uDpr * (110.0 / -mvPosition.z), 1.8, 3.8);

          vAlpha = baseAlpha;
          vColor = currentTone;
        }
      `,
      fragmentShader: `
        varying float vAlpha;
        varying vec3 vColor;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          // Crisp sub-pixel circular alpha falloff with solid luminous core
          float edge = smoothstep(0.5, 0.08, dist);
          gl_FragColor = vec4(vColor, vAlpha * edge);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    })

    this.particlePoints = new THREE.Points(this.geometry, this.shaderMaterial)
    this.scene.add(this.particlePoints)
  }

  public setTargetState(
    targetPositions: Float32Array,
    letterIndices?: Float32Array,
    dissolveNoise?: Float32Array,
    brightness?: Float32Array,
    tones?: Float32Array,
    sizes?: Float32Array
  ): void {
    if (!this.geometry) return

    const posAttr = this.geometry.getAttribute('position') as THREE.BufferAttribute
    const targetAttr = this.geometry.getAttribute('aTargetPos') as THREE.BufferAttribute
    const letterAttr = this.geometry.getAttribute('aLetterIdx') as THREE.BufferAttribute
    const dissolveAttr = this.geometry.getAttribute('aDissolveNoise') as THREE.BufferAttribute
    const alphaAttr = this.geometry.getAttribute('aAlpha') as THREE.BufferAttribute
    const toneAttr = this.geometry.getAttribute('aTone') as THREE.BufferAttribute
    const sizeAttr = this.geometry.getAttribute('aSize') as THREE.BufferAttribute

    const currentPositions = posAttr.array as Float32Array
    const prevTarget = targetAttr.array as Float32Array
    const progress = this.uniforms.uProgress.value

    for (let i = 0; i < this.particleCount * 3; i++) {
      currentPositions[i] = currentPositions[i] + (prevTarget[i] - currentPositions[i]) * progress
    }
    posAttr.needsUpdate = true

    const targetArray = targetAttr.array as Float32Array
    targetArray.set(targetPositions)
    targetAttr.needsUpdate = true

    if (letterIndices) {
      const letterArray = letterAttr.array as Float32Array
      letterArray.set(letterIndices)
      letterAttr.needsUpdate = true
    } else {
      const letterArray = letterAttr.array as Float32Array
      letterArray.fill(0)
      letterAttr.needsUpdate = true
    }

    if (dissolveNoise) {
      const dissolveArray = dissolveAttr.array as Float32Array
      dissolveArray.set(dissolveNoise)
      dissolveAttr.needsUpdate = true
    }

    if (brightness) {
      const alphaArray = alphaAttr.array as Float32Array
      for (let i = 0; i < this.particleCount; i++) {
        alphaArray[i] = brightness[i]
      }
      alphaAttr.needsUpdate = true
    } else {
      const alphaArray = alphaAttr.array as Float32Array
      alphaArray.fill(0.60)
      alphaAttr.needsUpdate = true
    }

    if (tones && toneAttr) {
      const toneArray = toneAttr.array as Float32Array
      toneArray.set(tones)
      toneAttr.needsUpdate = true
    }

    if (sizes && sizeAttr) {
      const sizeArray = sizeAttr.array as Float32Array
      sizeArray.set(sizes)
      sizeAttr.needsUpdate = true
    }

    this.uniforms.uProgress.value = 0.0
  }

  // --- Phase Controls ---

  public prepareRing(): void {
    if (this.ringMesh) {
      this.ringMesh.visible = true
      // Sphere stays centered — no drop mechanic
      this.ringMesh.position.set(0, 0, 0)
      this.ringMesh.scale.set(1, 1, 1)
    }
    this.ringUniforms.uRingProgress.value = 0.0
    this.ringUniforms.uRingOpacity.value = 0.0
    this.uniforms.uOpacity.value = 0.0
    this.uniforms.uDispersal.value = 0.0
    this.uniforms.uDissolveProgress.value = 0.0
    this.uniforms.uLetterStep.value = 0.0
    this.uniforms.uIsScrollActive.value = 0.0
    this.uniforms.uScrollProgress.value = 0.0
    this.lightUniforms.uScrollProgress.value = 0.0
    this.isTabletopActive = false
    this.isScrollControlActive = false
  }

  public updateRingProgress(progress: number, posY: number, scaleY: number, opacity: number): void {
    if (!this.ringMesh) return
    this.ringUniforms.uRingProgress.value = progress
    this.ringUniforms.uRingOpacity.value = opacity
    this.ringMesh.position.y = posY
    this.ringMesh.scale.y = scaleY
  }

  public triggerImpactBurst(): void {
    if (this.ringMesh) this.ringMesh.visible = false
    if (!this.targets) return
    this.setTargetState(this.targets.impactBurst)
    this.uniforms.uOpacity.value = 1.0
  }

  /**
   * Detonates the sphere in-place (center position) scattering particles
   * to ALL edges of the viewport — fills the full screen with grain.
   */
  public triggerCenterBurst(): void {
    if (this.ringMesh) this.ringMesh.visible = false
    if (!this.targets) return
    // Use impactBurst targets but they already scatter across full viewport
    this.setTargetState(this.targets.impactBurst)
    this.uniforms.uOpacity.value = 1.0
  }

  public morphToAtif(): void {
    if (!this.targets) return
    this.setTargetState(
      this.targets.atif,
      undefined,
      this.targets.atifDissolveNoise,
      this.targets.atifBrightness,
      this.targets.atifTones,
      this.targets.atifSizes
    )
    this.uniforms.uOpacity.value = 1.0
    this.uniforms.uDissolveProgress.value = 0.0
    this.uniforms.uDispersal.value = 0.0
  }

  public morphToPortfolio(): void {
    if (!this.targets) return
    this.setTargetState(
      this.targets.portfolio,
      this.targets.portfolioLetterIdx,
      undefined,
      this.targets.portfolioBrightness,
      this.targets.portfolioTones,
      this.targets.portfolioSizes
    )
    this.uniforms.uOpacity.value = 1.0
    this.uniforms.uDissolveProgress.value = 0.0
    this.uniforms.uDispersal.value = 0.0
  }

  public triggerPortfolioBurst(): void {
    if (!this.targets) return
    this.setTargetState(this.targets.impactBurst)
    this.uniforms.uLetterStep.value = 9.9
  }

  public morphToPortrait(): void {
    if (!this.targets) return
    this.setTargetState(
      this.targets.portrait,
      undefined,
      undefined,
      this.targets.portraitBrightness,
      this.targets.portraitTones,
      this.targets.portraitSizes
    )
    this.uniforms.uOpacity.value = 1.0
    this.uniforms.uDissolveProgress.value = 0.0
    this.uniforms.uDispersal.value = 0.0
    this.uniforms.uLetterStep.value = 0.0
  }

  public disperseToTable(): void {
    if (!this.targets) return
    this.setTargetState(
      this.targets.table,
      undefined,
      undefined,
      undefined,
      this.targets.tableTones,
      this.targets.tableSizes
    )
    this.isTabletopActive = true
  }

  public setSettledState(): void {
    if (this.ringMesh) this.ringMesh.visible = false
    if (!this.targets) return
    this.morphToPortrait()
    this.uniforms.uProgress.value = 1.0
    this.uniforms.uOpacity.value = 1.0
    this.uniforms.uTableSettled.value = 0.0
    this.uniforms.uDispersal.value = 0.0
    this.uniforms.uDissolveProgress.value = 0.0
    this.uniforms.uLetterStep.value = 0.0
    this.uniforms.uIsScrollActive.value = 1.0
    this.uniforms.uScrollProgress.value = 0.0
    this.lightUniforms.uScrollProgress.value = 0.0
    this.isTabletopActive = false
    this.isScrollControlActive = true
  }

  // --- Pointer & Scroll Handlers ---

  private handleMouseMove = (event: MouseEvent): void => {
    if (!this.projection) return
    // Convert normalized mouse coordinates into 3D world space
    const nx = event.clientX / window.innerWidth
    const ny = event.clientY / window.innerHeight
    const world = this.projection.toWorld(nx, ny)
    this.targetMouse.set(world.x, world.y)
  }

  private handleMouseLeave = (): void => {
    // Gracefully decay mouse influence off-screen when cursor/finger leaves
    this.targetMouse.set(9999, 9999)
  }

  private handleTouchMove = (event: TouchEvent): void => {
    if (!this.projection || event.touches.length === 0) return
    const touch = event.touches[0]
    const nx = touch.clientX / window.innerWidth
    const ny = touch.clientY / window.innerHeight
    const world = this.projection.toWorld(nx, ny)
    this.targetMouse.set(world.x, world.y)
  }

  private handleResize = (): void => {
    if (!this.container || !this.camera || !this.renderer) return
    const width = this.container.clientWidth || window.innerWidth
    const height = this.container.clientHeight || window.innerHeight

    this.projection = calculateViewportProjection(width, height, 110, 54)
    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)

    // Dynamically adjust atmospheric light mesh dimensions on viewport resize
    if (this.lightMesh && this.projection) {
      const planeW = this.projection.visibleWidth * 1.6
      const planeH = this.projection.visibleHeight * 1.6
      this.lightMesh.geometry.dispose()
      this.lightMesh.geometry = new THREE.PlaneGeometry(planeW, planeH)
      this.lightUniforms.uAspect.value = this.projection.visibleWidth / this.projection.visibleHeight
    }
  }

  public updateScrollProgress(progress: number): void {
    this.uniforms.uScrollProgress.value = progress
    this.uniforms.uIsScrollActive.value = 1.0
    this.lightUniforms.uScrollProgress.value = progress
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate)

    if (!this.scene || !this.camera || !this.renderer) return

    // High-precision delta timing without deprecated THREE.Clock
    const now = performance.now()
    const delta = Math.min((now - this.lastFrameTime) * 0.001, 0.1)
    this.lastFrameTime = now

    const isReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (isReducedMotion) {
      this.currentMouse.set(9999, 9999)
      this.uniforms.uMouse.value.set(9999, 9999)
      if (this.particlePoints) {
        this.particlePoints.rotation.set(0, 0, 0)
      }
    } else {
      this.uniforms.uTime.value += delta
      this.lightUniforms.uTime.value += delta

      // Smooth cursor interpolation
      this.currentMouse.lerp(this.targetMouse, 0.08)
      this.uniforms.uMouse.value.copy(this.currentMouse)

      // Dynamic 3D perspective parallax rotation calibrated for wide monitors
      if (this.particlePoints && (this.isScrollControlActive || this.uniforms.uIsScrollActive.value > 0.5)) {
        const halfW = this.projection ? this.projection.visibleWidth * 0.5 : 80
        const halfH = this.projection ? this.projection.visibleHeight * 0.5 : 60
        const normX = Math.max(-1.5, Math.min(1.5, this.currentMouse.x / halfW))
        const normY = Math.max(-1.5, Math.min(1.5, this.currentMouse.y / halfH))

        this.particlePoints.rotation.y = THREE.MathUtils.lerp(this.particlePoints.rotation.y, normX * 0.065, 0.05)
        this.particlePoints.rotation.x = THREE.MathUtils.lerp(this.particlePoints.rotation.x, -normY * 0.042, 0.05)
      }
    }

    this.renderer.render(this.scene, this.camera)
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('mouseleave', this.handleMouseLeave)
    window.removeEventListener('touchmove', this.handleTouchMove)
    window.removeEventListener('touchend', this.handleMouseLeave)
    window.removeEventListener('resize', this.handleResize)

    if (this.geometry) {
      this.geometry.dispose()
      this.geometry = null
    }

    if (this.shaderMaterial) {
      this.shaderMaterial.dispose()
      this.shaderMaterial = null
    }

    if (this.particlePoints && this.scene) {
      this.scene.remove(this.particlePoints)
      this.particlePoints = null
    }

    if (this.lightMesh && this.scene) {
      this.scene.remove(this.lightMesh)
      if (this.lightMesh.geometry) this.lightMesh.geometry.dispose()
      if (this.lightMaterial) this.lightMaterial.dispose()
      this.lightMesh = null
      this.lightMaterial = null
    }

    if (this.ringMesh && this.scene) {
      this.scene.remove(this.ringMesh)
      if (this.ringMesh.geometry) this.ringMesh.geometry.dispose()
      if (this.ringMaterial) this.ringMaterial.dispose()
      this.ringMesh = null
    }

    if (this.renderer) {
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement)
      }
      this.renderer.dispose()
      this.renderer = null
    }

    this.scene = null
    this.camera = null
    this.container = null
  }
}
