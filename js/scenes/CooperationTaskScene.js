export class CooperationTaskScene extends Phaser.Scene {
  constructor() {
      super({ key: 'CooperationTaskScene' });
      
      // タスクリストの初期化
      this.taskList = [
        {name: "Task1", imagekey: 'taskCard'},
        {name: "Task2", imagekey: 'taskCard'},
        {name: "Task3", imagekey: 'taskCard'},
      ];
      this.todoList = [];
      this.doneList = [];
  }

  preload() {
    this.load.image('backButton', '../../assets/images/BackButton.png');
    this.load.image('taskCard', '../../assets/images/taskCard.png');
  }

  create() {
    this.createTaskButton2();

    const taskSpacing = 400;
    this.taskList.forEach((task, index) => {
      const xOffset = 400 + (index * taskSpacing);
      let taskImage = this.add.image(xOffset, 300, task.imagekey).setScale(0.2);
      let taskText = this.add.text(xOffset, 300, task.name, {fontSize: '16px', fill: '#000'});

      taskImage.setInteractive();
      taskImage.on('pointerdown', () => {
        this.addToTodoList(task.name);

        // クリックされたタスクの削除
        taskImage.destroy();
        taskText.destroy();
      });
    });

    this.todoText = this.add.text(1500, 100, 'TODO List:\n', { fill: '#fff' });
    this.doneText = this.add.text(1500, 300, 'Done List:\n', { fill: '#fff' });
  }

  update() {
    // TODOリストとDONEリストの表示を更新
    this.todoText.setText('TODO List:\n' + this.todoList.join('\n'));
    this.doneText.setText('Done List:\n' + this.doneList.join('\n'));
  }

  addToTodoList(taskName) {
    // TODOリストにタスクを追加
    if (!this.todoList.includes(taskName)) {
      this.todoList.push(taskName);
    }
  }

  completeTask(taskName) {
    this.todoList = this.todoList.filter(t => t !== taskName);
    this.doneList.push(taskName);
  }

  createTaskButton2() {
    const buttonScale = 0.2;
    const buttonWidth = this.textures.get('Task2').getSourceImage().width * buttonScale;
    const buttonHeight = this.textures.get('Task2').getSourceImage().height * buttonScale;

    // ボタンの配置位置を設定
    const x = this.cameras.main.width - buttonWidth / 2 - 10;
    const y = this.cameras.main.height - buttonHeight / 2 - 10;

    // ボタンの生成とクリックイベントの設定
    this.add.image(x, y, 'backButton')
        .setInteractive()
        .setScale(buttonScale)
        .on('pointerdown', () => {
            this.scene.start('MainGameScene'); 
        });
}
}