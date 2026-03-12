// src/game/HintSystem.ts
import Phaser from 'phaser'
import type { LevelData, HiddenObject } from '../levels/LevelData'

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
