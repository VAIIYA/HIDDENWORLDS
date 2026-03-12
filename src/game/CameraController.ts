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
