import Phaser from "phaser";

export default class BombSpawner {
  /**
   * @param {Phaser.Scene} scene
   */
  constructor(scene, bombKey = "bomb") {
    this.scene = scene;
    this.key = bombKey;

    this._group = this.scene.physics.add.group();
  }

  get group() {
    return this._group;
  }

  spawn(playerX = 0) {
    const x =
      playerX < 350
        ? Phaser.Math.Between(350, 599)
        : Phaser.Math.Between(0, 350);

    const bomb = this.group.create(x, 16, this.key);
    bomb.setBounce(0.5);
    bomb.setCollideWorldBounds(false);
    bomb.setGravityY(700);
    bomb.setVelocity(Phaser.Math.Between(-360, 200), 20);

    return bomb;
  }
}
