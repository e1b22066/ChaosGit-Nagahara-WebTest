import { TitleScene } from './scenes/TitleScene.js';
import { MainGameScene } from './scenes/MainGameScene.js';

// ゲームの設定
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: '#024578',
    parent: 'game-container',
    scene: [TitleScene, MainGameScene],  // シーンを設定
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    }
};

// Phaser.Gameオブジェクトを作った瞬間にゲームが開始される
const game = new Phaser.Game(config);
