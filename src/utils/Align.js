export default class Align {
  constructor(scene) {
    this.scene = scene;
  }
  scaleToGameW(obj, per) {
    obj.displayWidth = this.scene.game.config.width * per;
    obj.scaleY = obj.scaleX;
  }
  static centerH(obj) {
    obj.x = this.scene.game.config.width / 2 - obj.displayWidth / 2;
  }
  static centerV(obj) {
    obj.y = this.scene.game.config.height / 2 - obj.displayHeight / 2;
  }
  static center2(obj) {
    obj.x = this.scene.game.config.width / 2 - obj.displayWidth / 2;
    obj.y = this.scene.game.config.height / 2 - obj.displayHeight / 2;
  }
  static center(obj) {
    obj.x = this.scene.game.config.width / 2;
    obj.y = this.scene.game.config.height / 2;
  }
}
