// src/game/ScoreManager.ts
import type { LevelData } from '../levels/LevelData'

export class ScoreManager {
  private level: LevelData
  private baseScore = 100

  constructor(level: LevelData) {
    this.level = level
  }

  /** Score for finding a single object */
  scoreFind(elapsedSeconds: number, isRare: boolean): number {
    // Time bonus: full bonus if under timeBonus seconds, scales down
    const timeRatio = Math.max(0, 1 - elapsedSeconds / this.level.timeBonus)
    const timeBonus = Math.floor(this.baseScore * timeRatio)
    const rareBonus = isRare ? 150 : 0
    return this.baseScore + timeBonus + rareBonus
  }

  /** Calculate 1-3 stars at level end */
  calculateStars(totalSeconds: number, score: number): number {
    const maxScore = this.level.objects.length * (this.baseScore * 2)
    const ratio = score / maxScore
    if (ratio >= 0.8 && totalSeconds < this.level.timeBonus) return 3
    if (ratio >= 0.5) return 2
    return 1
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// src/game/HintSystem.ts
import Phaser from 'phaser'
import type { LevelData, HiddenObject } from '../levels/LevelData'
import type { ObjectSpawner } from './ObjectSpawner'

export class HintSystem {
  private scene: Phaser.Scene
  private level: LevelData

  constructor(scene: Phaser.Scene, level: LevelData) {
    this.scene = scene
    this.level = level
  }

  showHint(obj: HiddenObject) {
    const w = this.scene.scale.width, h = this.scene.scale.height

    // Show toast with hint text
    const toast = this.scene.add.text(w/2, h - 100, `💡 ${obj.hint}`, {
      fontFamily: "'Nunito', sans-serif",
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#9B5DE5cc',
      padding: { x: 16, y: 10 },
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300)

    this.scene.tweens.add({
      targets: toast, alpha: 0, duration: 600, delay: 3000,
      onComplete: () => toast.destroy()
    })

    // Flash the object (delegated to spawner via scene registry)
    const gameScene = this.scene as any
    gameScene.objectSpawner?.flashObject(obj.id)

    // Pan camera toward the general area (but not exact position — that would be cheating!)
    const roughX = ((obj.x + (Math.random()*20-10)) / 100) * this.level.mapWidth
    const roughY = ((obj.y + (Math.random()*20-10)) / 100) * this.level.mapHeight
    this.scene.cameras.main.pan(roughX, roughY, 1000, 'Cubic.easeInOut')
  }
}

// ─────────────────────────────────────────────────────────────────────────────

// src/game/CameraController.ts
// (Camera management — zoom limits + bounds)
import Phaser from 'phaser'

export class CameraController {
  private scene: Phaser.Scene
  readonly MIN_ZOOM = 0.3
  readonly MAX_ZOOM = 4

  constructor(scene: Phaser.Scene, mapW: number, mapH: number) {
    this.scene = scene
    scene.cameras.main.setBounds(0, 0, mapW, mapH)
  }

  clampZoom(zoom: number): number {
    return Phaser.Math.Clamp(zoom, this.MIN_ZOOM, this.MAX_ZOOM)
  }
}
