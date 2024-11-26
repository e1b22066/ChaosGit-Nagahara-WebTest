// このシステムで使うシーンをインポート
import { TitleScene } from './scenes/TitleScene.js';
import { MainGameScene } from './scenes/MainGameScene.js';
import { DiscussionScene } from './scenes/DiscussionScene.js';
import { QuizScene } from './scenes/QuizScene.js';
import { RepairScene } from './scenes/RepairScene.js';
import { CooperationTaskScene } from './scenes/CooperationTaskScene.js';
import { RegisterScene } from './scenes/RegisterScene.js';

// ゲームの設定
const config = {
    type: Phaser.AUTO,
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT, 
        autoCenter: Phaser.Scale.CENTER_BOTH, 
        width: 1920, 
        height: 1080
    },
    backgroundColor: '#024578',
    parent: 'game-container',
    scene: [TitleScene, RegisterScene, MainGameScene, DiscussionScene, QuizScene, RepairScene, CooperationTaskScene],  // インポートしたシーンを設定
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 }
        }
    }
};

// Phaser.Gameオブジェクトを作った瞬間にゲームが開始される
const game = new Phaser.Game(config);
