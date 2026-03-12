// src/game/scenes/GameScene.ts
// The main gameplay scene — zoom, pan, find hidden objects!
import Phaser from 'phaser'
import { ALL_LEVELS, type LevelData, type HiddenObject, THEME_CONFIGS } from '../../levels/LevelData'
import { ScoreManager } from '../ScoreManager'
import { HintSystem } from '../HintSystem'
import { CameraController } from '../CameraController'
import { ObjectSpawner } from '../ObjectSpawner'

export class GameScene extends Phaser.Scene {
  // Level state
  private level!: LevelData
  private foundObjects: Set<string> = new Set()
  private score = 0
  private startTime = 0
  private isDaily = false
  private hintCooldown = 0

  // Systems
  private scoreManager!: ScoreManager
  private hintSystem!: HintSystem
  private cameraController!: CameraController
  private objectSpawner!: ObjectSpawner

  // UI elements
  private timerText!: Phaser.GameObjects.Text
  private scoreText!: Phaser.GameObjects.Text
  private progressText!: Phaser.GameObjects.Text
  private hintBtn!: Phaser.GameObjects.Container
  private foundCircles: Map<string, Phaser.GameObjects.Graphics> = new Map()
  private mapImage!: Phaser.GameObjects.Image

  // Touch tracking
  private lastPointerDist = 0
  private isPanning = false
  private panStartX = 0
  private panStartY = 0
  private camStartX = 0
  private camStartY = 0

  constructor() { super({ key: 'GameScene' }) }

  init(data: { levelId: number; isDaily?: boolean }) {
    this.foundObjects.clear()
    this.foundCircles.clear()
    this.score = 0
    this.hintCooldown = 0
    this.isDaily = data.isDaily ?? false

    const level = ALL_LEVELS.find(l => l.id === data.levelId)
    if (!level) { this.scene.start('MenuScene'); return }
    this.level = level
  }

  create() {
    const w = this.scale.width, h = this.scale.height

    // ── Map setup ──────────────────────────────────────────────────────────
    const mapKey = `map_${this.level.theme}`

    if (this.textures.exists(mapKey)) {
      this.mapImage = this.add.image(0, 0, mapKey).setOrigin(0, 0)
    } else {
      // Fallback gradient if texture not loaded
      const g = this.add.graphics()
      const cfg = THEME_CONFIGS[this.level.theme]
      const col1 = parseInt(cfg.palette[0].replace('#', ''), 16)
      const col2 = parseInt(cfg.palette[cfg.palette.length-1].replace('#', ''), 16)
      g.fillGradientStyle(col1, col1, col2, col2, 1)
      g.fillRect(0, 0, this.level.mapWidth, this.level.mapHeight)
      // Add a fun emoji grid so the map isn't empty
      this.addEmojiBackground()
    }

    // ── Systems ────────────────────────────────────────────────────────────
    this.scoreManager = new ScoreManager(this.level)
    this.hintSystem = new HintSystem(this, this.level)
    this.cameraController = new CameraController(this, this.level.mapWidth, this.level.mapHeight)
    this.objectSpawner = new ObjectSpawner(this, this.level)

    // Spawn hidden objects
    this.objectSpawner.spawn(this.level.objects, (obj) => this.onObjectFound(obj))

    // ── HUD ────────────────────────────────────────────────────────────────
    this.buildHUD(w, h)

    // ── Camera ────────────────────────────────────────────────────────────
    this.cameras.main.setBounds(0, 0, this.level.mapWidth, this.level.mapHeight)
    // Start zoomed out
    this.cameras.main.setZoom(Math.min(w / this.level.mapWidth, h / this.level.mapHeight) * 0.9)
    this.cameras.main.centerOn(this.level.mapWidth / 2, this.level.mapHeight / 2)

    // ── Input ─────────────────────────────────────────────────────────────
    this.setupInput()

    // ── Timer ─────────────────────────────────────────────────────────────
    this.startTime = Date.now()
    this.time.addEvent({ delay: 100, loop: true, callback: this.updateTimer, callbackScope: this })

    // Hint cooldown tick
    this.time.addEvent({ delay: 1000, loop: true, callback: this.tickHint, callbackScope: this })

    // ── Entrance ──────────────────────────────────────────────────────────
    this.cameras.main.fadeIn(500, 255, 240, 245)
    this.showLevelIntro()

    // Accessibility: wrong click feedback
    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      this.onMapClick(pointer)
    })
  }

  // ── Emoji background fallback ──────────────────────────────────────────────
  private addEmojiBackground() {
    const cfg = THEME_CONFIGS[this.level.theme]
    const items = cfg.emoji
    for (let r = 0; r < 20; r++) {
      for (let c = 0; c < 30; c++) {
        this.add.text(c * 120 + 40, r * 100 + 40, items, {
          fontSize: '40px', alpha: 0.08
        })
      }
    }
  }

  // ── HUD ────────────────────────────────────────────────────────────────────
  private buildHUD(w: number, h: number) {
    // Sticky HUD — not affected by camera transforms
    // We use a fixed camera-ignoring layer via setScrollFactor(0)

    // Top strip
    const hudBg = this.add.graphics().setScrollFactor(0).setDepth(100)
    hudBg.fillStyle(0x00000040, 1)
    hudBg.fillRect(0, 0, w, 60)

    // Timer
    this.timerText = this.add.text(w/2, 30, '00:00', {
      fontFamily: "'Baloo 2', cursive", fontSize: '28px', color: '#ffffff',
      stroke: '#FF2D78', strokeThickness: 3,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101)

    // Score
    this.scoreText = this.add.text(w - 20, 30, '0', {
      fontFamily: "'Nunito', sans-serif", fontSize: '22px', color: '#FFD700',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(1, 0.5).setScrollFactor(0).setDepth(101)

    // Progress counter
    this.progressText = this.add.text(20, 30, `0 / ${this.level.objects.length}`, {
      fontFamily: "'Nunito', sans-serif", fontSize: '20px', color: '#ffffff',
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101)

    // Back button
    const backBtn = this.add.text(20, h - 25, '← Exit', {
      fontFamily: "'Nunito', sans-serif", fontSize: '16px', color: '#ffffff',
      backgroundColor: '#FF85A188', padding: { x: 10, y: 6 },
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true })
    backBtn.on('pointerup', () => {
      this.cameras.main.fadeOut(300, 255, 240, 245)
      this.time.delayedCall(300, () => this.scene.start('LevelSelectScene'))
    })

    // Hint button (bottom right)
    this.buildHintButton(w, h)

    // Object checklist panel (bottom)
    this.buildChecklist(w, h)
  }

  private buildHintButton(w: number, h: number) {
    const btn = this.add.container(w - 65, h - 30).setScrollFactor(0).setDepth(101)

    const bg = this.add.graphics()
    bg.fillStyle(0xFFD700, 1)
    bg.fillCircle(0, 0, 28)

    const icon = this.add.text(0, 0, '💡', { fontSize: '22px' }).setOrigin(0.5)
    const cd = this.add.text(0, 0, '', {
      fontFamily: "'Nunito', sans-serif", fontSize: '14px', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5)

    btn.add([bg, icon, cd])
    btn.setSize(56, 56)
    btn.setInteractive({ useHandCursor: true })

    btn.on('pointerup', () => {
      if (this.hintCooldown > 0) {
        this.showToast(`⏳ Hint in ${this.hintCooldown}s`)
        return
      }
      const nextUnfound = this.level.objects.find(o => !this.foundObjects.has(o.id))
      if (nextUnfound) {
        this.hintSystem.showHint(nextUnfound)
        this.hintCooldown = 60
      }
    })

    this.hintBtn = btn

    // Store reference to CD text for updates
    ;(btn as any)._cdText = cd
    ;(btn as any)._bgGfx = bg
  }

  private buildChecklist(w: number, _h: number) {
    // Scrollable panel on left showing objects to find
    const panelX = 0, panelY = 65
    const panelW = Math.min(180, w * 0.22)

    const panelBg = this.add.graphics().setScrollFactor(0).setDepth(100)
    panelBg.fillStyle(0xFFFFFF, 0.85)
    panelBg.fillRoundedRect(panelX, panelY, panelW, this.level.objects.length * 34 + 10, 8)

    this.level.objects.forEach((obj, i) => {
      const oy = panelY + 10 + i * 34
      const txt = this.add.text(panelX + 10, oy, `${obj.emoji} ${obj.name}`, {
        fontFamily: "'Nunito', sans-serif",
        fontSize: '14px',
        color: '#999999',
      }).setScrollFactor(0).setDepth(101)
      ;(txt as any)._objId = obj.id
      // Store for update
      ;(this as any)[`_check_${obj.id}`] = txt
    })
  }

  private updateChecklist(id: string) {
    const txt = (this as any)[`_check_${id}`] as Phaser.GameObjects.Text | undefined
    if (txt) {
      txt.setColor('#FF2D78').setText(`✅ ${txt.text.substring(3)}`)
      this.tweens.add({ targets: txt, scaleX: 1.1, scaleY: 1.1, duration: 200, yoyo: true })
    }
  }

  // ── Input ──────────────────────────────────────────────────────────────────
  private setupInput() {
    // Pinch-to-zoom (mobile)
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!p.isDown) return

      // Pinch zoom
      if (this.input.pointer2.isDown) {
        const d = Phaser.Math.Distance.Between(
          this.input.pointer1.x, this.input.pointer1.y,
          this.input.pointer2.x, this.input.pointer2.y
        )
        if (this.lastPointerDist > 0) {
          const delta = d - this.lastPointerDist
          const newZoom = Phaser.Math.Clamp(this.cameras.main.zoom + delta * 0.005, 0.3, 4)
          this.cameras.main.setZoom(newZoom)
        }
        this.lastPointerDist = d
        return
      }
      this.lastPointerDist = 0

      // Pan
      if (this.isPanning) {
        const dx = (p.x - this.panStartX) / this.cameras.main.zoom
        const dy = (p.y - this.panStartY) / this.cameras.main.zoom
        this.cameras.main.setScroll(this.camStartX - dx, this.camStartY - dy)
      }
    })

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.input.pointer2.isDown) return // pinch
      this.isPanning = true
      this.panStartX = p.x; this.panStartY = p.y
      this.camStartX = this.cameras.main.scrollX; this.camStartY = this.cameras.main.scrollY
    })

    this.input.on('pointerup', () => {
      this.isPanning = false
      this.lastPointerDist = 0
    })

    // Mouse wheel zoom (desktop)
    this.input.on('wheel', (_p: any, _g: any, _dx: number, dy: number) => {
      const z = Phaser.Math.Clamp(this.cameras.main.zoom - dy * 0.001, 0.3, 4)
      this.cameras.main.setZoom(z)
    })
  }

  // ── Map click – wrong tap feedback ────────────────────────────────────────
  private onMapClick(pointer: Phaser.Input.Pointer) {
    // Only trigger if not panning
    if (Math.abs(pointer.x - this.panStartX) > 8 || Math.abs(pointer.y - this.panStartY) > 8) return

    // Get world coords
    const worldX = this.cameras.main.scrollX + pointer.x / this.cameras.main.zoom
    const worldY = this.cameras.main.scrollY + pointer.y / this.cameras.main.zoom

    // Check against unfound objects
    let foundAny = false
    for (const obj of this.level.objects) {
      if (this.foundObjects.has(obj.id)) continue
      const ox = (obj.x / 100) * this.level.mapWidth
      const oy = (obj.y / 100) * this.level.mapHeight
      const dist = Phaser.Math.Distance.Between(worldX, worldY, ox, oy)
      if (dist < obj.radius * 2) {
        foundAny = true
        break
      }
    }

    if (!foundAny && this.input.activePointer.getDuration() < 300) {
      // Wrong click ripple
      this.showWrongClick(pointer.x, pointer.y)
    }
  }

  private showWrongClick(sx: number, sy: number) {
    const g = this.add.graphics().setScrollFactor(0).setDepth(200)
    g.lineStyle(3, 0xFF0000, 0.6)
    g.strokeCircle(sx, sy, 20)
    this.tweens.add({
      targets: g, alpha: 0, scaleX: 2, scaleY: 2, duration: 400,
      onComplete: () => g.destroy()
    })
  }

  // ── Object found ───────────────────────────────────────────────────────────
  onObjectFound(obj: HiddenObject) {
    if (this.foundObjects.has(obj.id)) return
    this.foundObjects.add(obj.id)

    // Score
    const elapsed = (Date.now() - this.startTime) / 1000
    const pts = this.scoreManager.scoreFind(elapsed, obj.rare ?? false)
    this.score += pts
    this.scoreText.setText(`${this.score}`)

    // Update checklist
    this.updateChecklist(obj.id)

    // Progress
    this.progressText.setText(`${this.foundObjects.size} / ${this.level.objects.length}`)

    // Floating score popup
    const ox = (obj.x / 100) * this.level.mapWidth
    const oy = (obj.y / 100) * this.level.mapHeight
    const screenX = (ox - this.cameras.main.scrollX) * this.cameras.main.zoom
    const screenY = (oy - this.cameras.main.scrollY) * this.cameras.main.zoom

    const popup = this.add.text(screenX, screenY - 40, `+${pts}${obj.rare ? ' 🌟 RARE!' : ''}`, {
      fontFamily: "'Baloo 2', cursive", fontSize: '24px', color: '#FFD700',
      stroke: '#FF2D78', strokeThickness: 3,
    }).setScrollFactor(0).setDepth(200).setOrigin(0.5)

    this.tweens.add({
      targets: popup, y: screenY - 120, alpha: 0, duration: 1200,
      ease: 'Cubic.easeOut', onComplete: () => popup.destroy()
    })

    // Screen flash
    this.cameras.main.flash(150, 255, 240, 245, false)

    // Check win
    if (this.foundObjects.size >= this.level.objects.length) {
      this.time.delayedCall(800, () => this.triggerLevelComplete())
    }
  }

  // ── Level complete ─────────────────────────────────────────────────────────
  private triggerLevelComplete() {
    const elapsed = (Date.now() - this.startTime) / 1000
    const stars = this.scoreManager.calculateStars(elapsed, this.score)

    // Save to Supabase
    const supabase = this.registry.get('supabase')
    const wallet = this.registry.get('wallet')
    if (supabase && wallet?.isConnected()) {
      supabase.saveProgress(wallet.getAddress(), this.level.id, stars, Math.floor(elapsed))
    }

    // Check achievements
    const ui = this.registry.get('ui')
    ui?.checkAchievements(this.foundObjects.size, elapsed, this.level.id)

    this.cameras.main.fadeOut(400, 255, 240, 245)
    this.time.delayedCall(400, () => {
      this.scene.start('ResultScene', {
        levelId: this.level.id,
        score: this.score,
        stars,
        time: Math.floor(elapsed),
        isDaily: this.isDaily,
      })
    })
  }

  // ── Timer update ───────────────────────────────────────────────────────────
  private updateTimer() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000)
    const m = Math.floor(elapsed / 60).toString().padStart(2, '0')
    const s = (elapsed % 60).toString().padStart(2, '0')
    this.timerText.setText(`${m}:${s}`)
  }

  private tickHint() {
    if (this.hintCooldown > 0) {
      this.hintCooldown--
      const cdText = (this.hintBtn as any)._cdText as Phaser.GameObjects.Text
      const bgGfx = (this.hintBtn as any)._bgGfx as Phaser.GameObjects.Graphics
      if (this.hintCooldown > 0) {
        bgGfx.clear()
        bgGfx.fillStyle(0xAAAAAA, 1)
        bgGfx.fillCircle(0, 0, 28)
        cdText.setText(`${this.hintCooldown}`)
      } else {
        bgGfx.clear()
        bgGfx.fillStyle(0xFFD700, 1)
        bgGfx.fillCircle(0, 0, 28)
        cdText.setText('')
        this.showToast('💡 Hint ready!')
      }
    }
  }

  // ── Level intro popup ─────────────────────────────────────────────────────
  private showLevelIntro() {
    const w = this.scale.width, h = this.scale.height

    const overlay = this.add.rectangle(w/2, h/2, w, h, 0x000000, 0.5).setScrollFactor(0).setDepth(300)

    const box = this.add.graphics().setScrollFactor(0).setDepth(301)
    box.fillStyle(0xFFFFFF, 1)
    box.fillRoundedRect(w/2 - 200, h/2 - 130, 400, 260, 24)

    const title = this.add.text(w/2, h/2 - 90, `Level ${this.level.id}: ${this.level.title}`, {
      fontFamily: "'Baloo 2', cursive", fontSize: '20px', color: '#FF2D78',
      wordWrap: { width: 360 }, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302)

    const desc = this.add.text(w/2, h/2 - 20, this.level.description, {
      fontFamily: "'Nunito', sans-serif", fontSize: '16px', color: '#444444',
      wordWrap: { width: 360 }, align: 'center',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302)

    const objList = this.add.text(w/2, h/2 + 40, `🔍 Find ${this.level.objects.length} hidden objects!`, {
      fontFamily: "'Nunito', sans-serif", fontSize: '18px', color: '#666666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302)

    const diff = this.level.difficulty.toUpperCase()
    const diffColors: Record<string, string> = { EASY:'#6BCB77', MEDIUM:'#FFD93D', HARD:'#FF6B6B', EXPERT:'#9B5DE5' }
    const diffText = this.add.text(w/2, h/2 + 75, `Difficulty: ${diff}`, {
      fontFamily: "'Nunito', sans-serif", fontSize: '16px', color: diffColors[diff] ?? '#444',
      fontStyle: 'bold',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302)

    const tapText = this.add.text(w/2, h/2 + 110, '[ Tap anywhere to start! ]', {
      fontFamily: "'Nunito', sans-serif", fontSize: '14px', color: '#AAAAAA',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(302)

    this.tweens.add({ targets: tapText, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 })

    const dismiss = () => {
      [overlay, box, title, desc, objList, diffText, tapText].forEach(o => o.destroy())
      this.startTime = Date.now()
    }
    this.input.once('pointerup', dismiss)
    this.time.delayedCall(6000, dismiss)
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  showToast(msg: string) {
    const w = this.scale.width, h = this.scale.height
    const t = this.add.text(w/2, h - 80, msg, {
      fontFamily: "'Nunito', sans-serif", fontSize: '18px', color: '#ffffff',
      backgroundColor: '#FF85A1cc', padding: { x: 16, y: 8 }, borderRadius: 20,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300)
    this.tweens.add({ targets: t, y: h - 120, alpha: 0, duration: 1500, delay: 1000, onComplete: () => t.destroy() })
  }
}
