import * as THREE from 'three'
import type { ParticleConfig } from '../../types/portfolio'

export class ParticleEngine {
  private container: HTMLElement | null = null
  private scene: THREE.Scene | null = null
  private camera: THREE.PerspectiveCamera | null = null
  private renderer: THREE.WebGLRenderer | null = null
  private particles: THREE.Points | null = null
  private animationFrameId: number | null = null

  // Pointer tracking for subtle cinematic parallax
  private targetMouseX = 0
  private targetMouseY = 0
  private currentMouseX = 0
  private currentMouseY = 0

  private config: Required<ParticleConfig> = {
    count: 650,
    color: 0xffffff,
    size: 2.2,
    speed: 0.0003,
    interactive: true,
  }

  constructor(customConfig?: ParticleConfig) {
    if (customConfig) {
      this.config = { ...this.config, ...customConfig }
    }
  }

  public init(container: HTMLElement): void {
    if (this.renderer) {
      this.destroy()
    }

    this.container = container
    const width = container.clientWidth || window.innerWidth
    const height = container.clientHeight || window.innerHeight

    // 1. Scene setup
    this.scene = new THREE.Scene()

    // 2. Camera setup
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    this.camera.position.z = 100

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
    })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(width, height)
    this.renderer.setClearColor(0x000000, 0)

    // Append canvas
    container.appendChild(this.renderer.domElement)
    this.renderer.domElement.style.position = 'absolute'
    this.renderer.domElement.style.top = '0'
    this.renderer.domElement.style.left = '0'
    this.renderer.domElement.style.width = '100%'
    this.renderer.domElement.style.height = '100%'
    this.renderer.domElement.style.pointerEvents = 'none'

    // 4. Particle field creation
    this.createParticles()

    // 5. Event listeners
    if (this.config.interactive) {
      window.addEventListener('mousemove', this.handleMouseMove, { passive: true })
    }
    window.addEventListener('resize', this.handleResize, { passive: true })

    // 6. Start animation loop
    this.animate()
  }

  private createParticles(): void {
    if (!this.scene) return

    const { count, color, size } = this.config
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(count * 3)
    const opacities = new Float32Array(count)

    const spreadX = 220
    const spreadY = 160
    const spreadZ = 180

    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positions[i3] = (Math.random() - 0.5) * spreadX
      positions[i3 + 1] = (Math.random() - 0.5) * spreadY
      positions[i3 + 2] = (Math.random() - 0.5) * spreadZ

      // Subtle varied opacities for depth
      opacities[i] = 0.2 + Math.random() * 0.7
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

    // Crisp circular particle texture using offscreen canvas to avoid blocky square points
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16)
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)')
      gradient.addColorStop(0.35, 'rgba(255, 255, 255, 0.75)')
      gradient.addColorStop(0.8, 'rgba(255, 255, 255, 0.15)')
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(16, 16, 16, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)

    const material = new THREE.PointsMaterial({
      color: color,
      size: size,
      map: texture,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    })

    this.particles = new THREE.Points(geometry, material)
    this.scene.add(this.particles)
  }

  private handleMouseMove = (event: MouseEvent): void => {
    // Normalized coordinates (-1 to 1)
    this.targetMouseX = (event.clientX / window.innerWidth) * 2 - 1
    this.targetMouseY = -(event.clientY / window.innerHeight) * 2 + 1
  }

  private handleResize = (): void => {
    if (!this.container || !this.camera || !this.renderer) return
    const width = this.container.clientWidth || window.innerWidth
    const height = this.container.clientHeight || window.innerHeight

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate)

    if (!this.scene || !this.camera || !this.renderer) return

    // Gentle particle field rotation
    if (this.particles) {
      this.particles.rotation.y += this.config.speed
      this.particles.rotation.x += this.config.speed * 0.4
    }

    // Parallax camera lerp
    this.currentMouseX += (this.targetMouseX * 12 - this.currentMouseX) * 0.03
    this.currentMouseY += (this.targetMouseY * 8 - this.currentMouseY) * 0.03

    this.camera.position.x = this.currentMouseX
    this.camera.position.y = this.currentMouseY
    this.camera.lookAt(0, 0, 0)

    this.renderer.render(this.scene, this.camera)
  }

  public destroy(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    window.removeEventListener('mousemove', this.handleMouseMove)
    window.removeEventListener('resize', this.handleResize)

    if (this.particles) {
      if (this.particles.geometry) {
        this.particles.geometry.dispose()
      }
      if (this.particles.material) {
        if (Array.isArray(this.particles.material)) {
          this.particles.material.forEach((mat) => mat.dispose())
        } else {
          this.particles.material.dispose()
        }
      }
      if (this.scene) {
        this.scene.remove(this.particles)
      }
      this.particles = null
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
