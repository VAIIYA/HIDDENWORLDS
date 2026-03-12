// src/game/ObjectSpawner.ts
// Renders hidden emoji objects on the map and handles click detection
import Phaser from 'phaser'
import type { LevelData, HiddenObject } from '../levels/LevelData'

export class ObjectSpawner {
  private scene: Phaser.Scene
  private level: LevelData
  private objectContainers: Map<string, Phaser.GameObjects.Container> = new Map()

  constructor(scene: Phaser.Scene, level: LevelData) {
    this.scene = scene
    this.level = level
  }

  spawn(objects: HiddenObject[], onFound: (obj: HiddenObject) => void) {
    objects.forEach(obj => {
      const wx = (obj.x / 100) * this.level.mapWidth
      const wy = (obj.y / 100) * this.level.mapHeight

      const container = this.scene.add.container(wx, wy).setDepth(10)

      // Invisible hit circle (slightly larger than visual for fairness)
      const hitArea = this.scene.add.circle(0, 0, obj.radius * 1.5, 0xffffff, 0)
      hitArea.setInteractive({ useHandCursor: true })

      // The emoji visual (slightly small to be challenging)
      const sizeMap: Record<string, number> = {
        easy: 32, medium: 26, hard: 20, expert: 16
      }
      const fontSize = sizeMap[this.level.difficulty] ?? 24

      const emoji = this.scene.add.text(0, 0, obj.emoji, {
        fontSize: `${fontSize}px`,
      }).setOrigin(0.5).setAlpha(0.9)

      // Subtle float animation (makes objects feel alive)
      this.scene.tweens.add({
        targets: emoji,
        y: -6,
        duration: 1200 + Math.random() * 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: Math.random() * 2000,
      })

      container.add([hitArea, emoji])

      // Click detection
      hitArea.on('pointerdown', () => {
        this.triggerFound(obj, container, onFound)
      })

      // Subtle pulse on hover (encouraging!)
      hitArea.on('pointerover', () => {
        this.scene.tweens.add({ targets: emoji, scaleX: 1.2, scaleY: 1.2, duration: 150 })
      })
      hitArea.on('pointerout', () => {
        this.scene.tweens.add({ targets: emoji, scaleX: 1, scaleY: 1, duration: 150 })
      })

      this.objectContainers.set(obj.id, container)
    })
  }

  private triggerFound(obj: HiddenObject, container: Phaser.GameObjects.Container, onFound: (o: HiddenObject) => void) {
    // Disable further clicks
    const hitArea = container.list[0] as Phaser.GameObjects.Arc
    hitArea.disableInteractive()

    // Stop float tween
    const emoji = container.list[1] as Phaser.GameObjects.Text
    this.scene.tweens.killTweensOf(emoji)

    // Victory animation sequence
    // 1. Pop scale
    this.scene.tweens.add({
      targets: container, scaleX: 1.6, scaleY: 1.6, duration: 200,
      ease: 'Back.easeOut',
    })
    // 2. Spin
    this.scene.tweens.add({
      targets: container, angle: 360, duration: 500, delay: 100,
      ease: 'Cubic.easeOut',
    })
    // 3. Settle with found ring
    this.scene.time.delayedCall(300, () => {
      this.scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 300 })
      this.drawFoundRing(container.x, container.y, obj.radius)
      // Show label popup
      this.showFoundLabel(obj, container.x, container.y)
    })

    // 4. Dim (stays visible but greyed)
    this.scene.time.delayedCall(700, () => {
      emoji.setAlpha(0.45)
      emoji.setTint(0xAAFFAA) // Green tint = found
    })

    // Confetti burst!
    this.burstConfetti(container.x, container.y)

    onFound(obj)
  }

  private drawFoundRing(x: number, y: number, r: number) {
    const g = this.scene.add.graphics().setDepth(11)
    g.lineStyle(4, 0x6BCB77, 1)
    g.strokeCircle(x, y, r * 1.8)

    // Animated ring expand
    g.setScale(0)
    this.scene.tweens.add({ targets: g, scaleX: 1, scaleY: 1, duration: 300, ease: 'Back.easeOut' })
  }

  private showFoundLabel(obj: HiddenObject, x: number, y: number) {
    const label = this.scene.add.text(x, y - 50, `✅ ${obj.name}!`, {
      fontFamily: "'Baloo 2', cursive",
      fontSize: '18px',
      color: '#ffffff',
      stroke: '#FF2D78',
      strokeThickness: 3,
      backgroundColor: '#FF85A1cc',
      padding: { x: 10, y: 4 },
    }).setOrigin(0.5).setDepth(50)

    this.scene.tweens.add({
      targets: label, y: y - 110, alpha: 0, duration: 1500,
      ease: 'Cubic.easeOut',
      onComplete: () => label.destroy()
    })
  }

  private burstConfetti(x: number, y: number) {
    const colors = [0xFF85A1, 0xFFD700, 0x6BCB77, 0x9B5DE5, 0xFF6B6B, 0x00BFFF]
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2
      const speed = 80 + Math.random() * 120
      const g = this.scene.add.graphics().setDepth(50)
      g.fillStyle(colors[i % colors.length], 1)
      g.fillRect(-4, -4, 8, 8)
      g.x = x; g.y = y

      this.scene.tweens.add({
        targets: g,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0, scaleY: 0,
        duration: 600 + Math.random() * 400,
        ease: 'Cubic.easeOut',
        onComplete: () => g.destroy(),
      })
    }
  }

  // Highlight a specific object (for hint)
  flashObject(id: string) {
    const container = this.objectContainers.get(id)
    if (!container) return

    const emoji = container.list[1] as Phaser.GameObjects.Text
    this.scene.tweens.add({
      targets: emoji,
      alpha: 0.2,
      duration: 200,
      yoyo: true,
      repeat: 5,
      onComplete: () => emoji.setAlpha(0.9),
    })

    // Zoom camera toward hint target
    const cam = this.scene.cameras.main
    const targetZoom = Math.min(cam.zoom * 1.5, 3)
    this.scene.tweens.add({ targets: cam, zoom: targetZoom, duration: 500 })
    cam.pan(container.x, container.y, 800, 'Cubic.easeInOut')
  }
}
