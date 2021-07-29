import Phaser from "phaser";
import GameScene from "./scenes/GameScene";
import IntroScene from "./scenes/IntroScene";

let isMobile = navigator.userAgent.indexOf("Mobile");
if (isMobile == -1) {
  isMobile = navigator.userAgent.indexOf("Tablet");
}
let w = 320;
let h = 568;
if (isMobile != -1) {
  w = window.innerWidth;
  h = window.innerHeight;
}

const config = {
  type: Phaser.AUTO,
  width: w,
  height: h,
  parent: "phaser-game",
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      //gravity: { y: 300 }
    },
  },
  scene: [IntroScene, GameScene],
};

const game = new Phaser.Game(config);
