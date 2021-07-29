import Phaser from "phaser";

//assets
import BackgroundImg from "../assets/background.png";
import LogoImg from "../assets/logo.png";
import ButtonImg from "../assets/button_sprite_sheet.png";

//Utils
import AlignGrid from "../utils/AlignGrid";
import Align from "../utils/Align";

//consts
const BACKGROUND_KEY = "background";
const LOGO_KEY = "logo";
const BUTTON_KEY = "button";

class IntroScene extends Phaser.Scene {
  constructor() {
    super("intro-scene");

    this.scoreLabel = undefined;
    this.stars = undefined;
    this.align = undefined;
  }

  preload() {
    this.load.image(BACKGROUND_KEY, BackgroundImg);
    this.load.image(LOGO_KEY, LogoImg);
    this.load.image(BUTTON_KEY, ButtonImg);
  }

  create() {
    this.align = new Align(this); //magic toolkit to align objs in the grid
    //the background image
    let bg = this.add.image(0, 0, BACKGROUND_KEY).setOrigin(0, 0);
    this.align.scaleToGameW(bg, 2);

    //a kit to generate a grid to assist in obj alignment
    this.blockGrid = new AlignGrid(this, {
      scene: this,
      rows: 22,
      cols: 22,
      height: bg.displayHeight,
      width: bg.displayWidth,
    });

    //add logo
    let logo = this.add.image(0, 0, LOGO_KEY);
    this.align.scaleToGameW(logo, 0.6);
    this.blockGrid.placeAtIndex(137, logo);

    let button = this.physics.add.sprite(0, 0, BUTTON_KEY);
    this.align.scaleToGameW(button, 0.4);
    this.blockGrid.placeAtIndex(269, button);

    button.setInteractive();
    button.on("pointerdown", this.startGame.bind(this));

    //set the world bounds to the size of the bg image
    this.physics.world.setBounds(0, 0, bg.displayWidth, bg.displayHeight);
  }

  startGame() {
    this.scene.start("game-scene");
  }
}

export default IntroScene;
