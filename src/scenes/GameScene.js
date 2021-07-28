import Phaser from "phaser";

//assets
import SkyImg from "../assets/sky.png";
import StarImg from "../assets/star.png";
import BombImg from "../assets/bomb.png";

import BrickBrownImg from "../assets/tiles/brickBrown.png";
import BrickGreyImg from "../assets/tiles/brickGrey.png";

//the hero
import DudeImg from "../assets/dude.png";

import LadderImg from "../assets/objects/ladder.png";
import BackgroundImg from "../assets/background.png";

//UI
import ScoreLabel from "../ui/ScoreLabel";
import BombSpawner from "./BombSpawner";
import AlignGrid from "../utils/AlignGrid";
import Align from "../utils/Align";

//consts
const DUDE_KEY = "dude";
const STAR_KEY = "star";
const BOMB_KEY = "bomb";
const LADDER_KEY = "ladder";
const BACKGROUND_KEY = "background";

class GameScene extends Phaser.Scene {
  constructor() {
    super("game-scene");

    this.player = undefined;
    this.cursors = undefined;
    this.scoreLabel = undefined;
    this.stars = undefined;
    this.bombSpawner = undefined;

    this.gameOver = false;

    this.align = undefined;
    this.brickGroup = undefined;
    this.ladderGroup = undefined;

    this.onLadder = false;
    this.blockGrid = undefined;
  }

  preload() {
    this.load.image("sky", SkyImg);
    this.load.image(STAR_KEY, StarImg);
    this.load.image(BOMB_KEY, BombImg);

    this.load.spritesheet(DUDE_KEY, DudeImg, {
      frameWidth: 32,
      frameHeight: 48,
    });

    this.load.image("brown", BrickBrownImg);
    this.load.image("grey", BrickGreyImg);

    this.load.image(BACKGROUND_KEY, BackgroundImg);
    this.load.image(LADDER_KEY, LadderImg);
  }

  create() {
    this.align = new Align(this); //magic toolkit to align objs in the grid
    //the background image
    let bg = this.add.image(0, 0, BACKGROUND_KEY).setOrigin(0, 0);
    this.align.scaleToGameW(bg, 2);

    //set the world bounds to the size of the bg image
    this.physics.world.setBounds(0, 0, bg.displayWidth, bg.displayHeight);

    this.brickGroup = this.physics.add.group(); //a ground for the bricks
    this.ladderGroup = this.physics.add.group(); //a group for the ladders

    //let's create our hero
    this.player = this.createPlayer();

    //a kit to generate a grid to assist in obj alignment
    this.blockGrid = new AlignGrid(this, {
      scene: this,
      rows: 22,
      cols: 22,
      height: bg.displayHeight,
      width: bg.displayWidth,
    });

    //use this to see grid lines and numbers
    //this.blockGrid.showNumbers();

    //we want the camera to follow our hero
    this.cameras.main.setBounds(0, 0, bg.displayWidth, bg.displayHeight);
    this.cameras.main.startFollow(this.player);
    this.player.setDepth(10000);

    //let's load some starts
    this.stars = this.createStars();

    this.makeObjs(); //a func to create laddrs
    this.makePlats(); //a func to create platforms

    //what happens when our hero collides with a brick
    this.physics.add.collider(
      this.player,
      this.brickGroup,
      null,
      this.checkUp.bind(this)
    );
    //make hero and ladders to overlap
    this.physics.add.overlap(this.player, this.ladderGroup);

    //a simple score board for illustration purposes
    this.scoreLabel = this.createScoreLabel(10, 10, 0);
    this.scoreLabel.setScrollFactor(0);
    this.align.scaleToGameW(this.scoreLabel, 0.25);

    // //bomb spawner
    this.bombSpawner = new BombSpawner(this, BOMB_KEY);
    const bombGroup = this.bombSpawner.group;

    // //add collition
    this.physics.add.collider(this.stars, this.brickGroup);
    this.physics.add.collider(bombGroup, this.brickGroup);
    this.physics.add.collider(this.player, bombGroup, this.hitBomb, null, this);

    this.physics.add.overlap(
      this.player,
      this.stars,
      this.collectStar,
      null,
      this
    );

    // //add keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  placeBlock(pos, key) {
    //add the block to the scene. Position is not important yet
    let block = this.physics.add.sprite(0, 0, key);
    this.blockGrid.placeAtIndex(pos, block);
    this.brickGroup.add(block);
    block.setImmovable();

    //scale the block
    this.align.scaleToGameW(block, 0.1);
  }

  makeFloor(fromPos, toPos, key) {
    for (var i = fromPos; i < toPos + 1; i++) {
      this.placeBlock(i, key);
    }
  }

  makePlats() {
    this.makeFloor(66, 87, "grey");
    this.makeFloor(125, 128, "brown");
    this.makeFloor(135, 141, "brown");
    this.makeFloor(204, 206, "brown");
    this.makeFloor(208, 208, "brown");
    this.makeFloor(235, 235, "brown");
    this.makeFloor(262, 263, "brown");
    this.makeFloor(269, 269, "brown");
    this.makeFloor(271, 275, "brown");
    this.makeFloor(288, 288, "brown");
    this.makeFloor(310.5, 310.5, "brown");
    this.makeFloor(322, 329, "brown");
    this.makeFloor(334, 338, "brown");
    this.makeFloor(396, 417, "brown");
  }

  makeObjs() {
    this.makeObj(113, "ladder", "ladder");
    this.makeObj(182, "ladder", "ladder");
    this.makeObj(307, "ladder", "ladder");
    this.makeObj(378, "ladder", "ladder");
  }

  makeObj(pos, key, type) {
    let obj = this.physics.add.image(0, 0, key);
    this.align.scaleToGameW(obj, 0.1);
    this.blockGrid.placeAtIndex(pos, obj);
    if (type == "ladder") {
      this.ladderGroup.add(obj);
    }
  }

  checkUp() {
    if (this.onLadder == true && this.player.body.velocity.y < 0) {
      return false;
    }
    return true;
  }

  checkLadder() {
    this.onLadder = false;
    this.ladderGroup.children.iterate(
      function (child) {
        if (!child.body.touching.none) {
          this.onLadder = true;
        }
      }.bind(this)
    );
  }

  update() {
    let xVelocity = 150;
    let yVelocity = -150;

    if (this.isMobileDevice()) {
      xVelocity = 250;
      yVelocity = -250;
    }
    if (this.gameOver) {
      return;
    }
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(xVelocity * -1);
      this.player.anims.play("left", true);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(xVelocity);
      this.player.anims.play("right", true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }
    if (this.cursors.up.isDown) {
      this.checkLadder();
      if (this.onLadder == true) {
        this.player.setVelocityY(yVelocity);
      } else if (this.player.body.touching.down) {
        this.player.setVelocityY(yVelocity);
      }
    }
  }

  //returns true if mobile device
  isMobileDevice() {
    if (navigator.userAgent.indexOf("Mobile") == -1) {
      console.log(`is not mobile`);
      return false;
    }
    console.log(`is mobile`);
    return true;
  }

  //creates the player
  createPlayer() {
    let yGravity = 150;

    if (this.isMobileDevice) {
      yGravity = 250;
    }

    const player = this.physics.add.sprite(50, 450, DUDE_KEY);
    player.setBounce(0.1);
    player.setCollideWorldBounds(true);

    this.align.scaleToGameW(player, 0.1);
    player.setGravityY(yGravity);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: DUDE_KEY, frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers(DUDE_KEY, { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    return player;
  }

  //create starts
  createStars() {
    const stars = this.physics.add.group({
      key: STAR_KEY,
      repeat: 6,
      setXY: { x: 12, y: 0, stepX: 90 },
    });

    stars.children.iterate((child) => {
      child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      child.setGravityY(250);
    });

    return stars;
  }

  //collect starts
  collectStar(player, star) {
    star.disableBody(true, true);

    this.scoreLabel.add(10);
    console.log("remaining stars", this.stars.countActive(true));

    if (this.stars.countActive(true) === 0) {
      this.stars.children.iterate((child) => {
        child.enableBody(true, child.x, 0, true, true);
      });
    }

    this.bombSpawner.spawn(player.x);
  }

  //create score label
  createScoreLabel(x, y, score) {
    const style = { fontSize: "32px", fill: "#000" };
    const label = new ScoreLabel(this, x, y, score, style);

    this.add.existing(label);

    return label;
  }

  hitBomb(player, bomb) {
    // this.physics.pause();
    // player.setTint(0xff0000);
    // player.anims.play("turn");
    // this.gameOver = true;
    //this.registry.destroy(); // destroy registry
    //this.events.off(); // disable all active events
    //this.scene.restart(); // restart current scene
  }

  restartScene() {
    this.registry.destroy();
    this.events.off();
    this.scene.restart();
  }
}

export default GameScene;
