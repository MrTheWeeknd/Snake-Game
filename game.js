//Trabalho Prático 1 - Programação para Web
//Aluno: Lucas Silva Araújo
//Número de Matrícula: 22153899


//botao 's' ou 'S' para inicializar/reinciar o jogo
window.addEventListener("keydown", (e) => {
  if ((e.key === 's' || e.key === 'S') && (!gameStarted || isGameOver)) {
      cobra();
  }
});

//declaracao inicial das variaveis que verificarao o estado do jogo
let isGameOver = false;
let gameStarted = false;

const cobra = function () {
  let FPS = 10;
  const SIZE = 40;
  let board;
  let snake;
  let food;
  let score = 0;
  let isPaused = false;
  let runInterval;
  let frameCount = 0;

  function init() {
      //atualiza estado do jogo
      gameStarted = true;

      //reinicia jogo
      isGameOver = false;
      frameCount = 0;

      //reinicia placar
      const existingScoreElement = document.getElementById("score");
      if (existingScoreElement) existingScoreElement.remove();

      //apaga msg que perdeu
      const existingMessageElement = document.getElementById("message");
      if (existingMessageElement) existingMessageElement.remove();

      //cria placar
      const scoreElement = document.createElement("div");
      scoreElement.setAttribute("id", "score");
      scoreElement.innerHTML = formatScore(score);
      document.body.appendChild(scoreElement);

      //msg de perda
      const messageElement = document.createElement("div");
      messageElement.setAttribute("id", "message");
      messageElement.style.display = "none";
      document.body.appendChild(messageElement);

      //reinicia tabuleiro
      const existingBoard = document.getElementById("board");
      if (existingBoard) existingBoard.remove();

      board = new Board(SIZE);
      snake = new Snake([[4, 4], [4, 5], [4, 6]]);
      food = new Food();
      runInterval = setInterval(run, 1000 / FPS);
  }

  window.addEventListener("keydown", (e) => {
      if (isGameOver) return;

      switch (e.key) {
          case "ArrowUp":
              snake.changeDirection(0);
              break;
          case "ArrowRight":
              snake.changeDirection(1);
              break;
          case "ArrowDown":
              snake.changeDirection(2);
              break;
          case "ArrowLeft":
              snake.changeDirection(3);
              break;
          //caso hajam pausa no jogo    
          case "p":
          case "P":
              togglePause();
              break;
          default:
              break;
      }
  });

  class Board {
      constructor(size) {
          this.element = document.createElement("table");
          this.element.setAttribute("id", "board");
          this.color = "#ccc";
          document.body.appendChild(this.element);
          for (let i = 0; i < size; i++) {
              const row = document.createElement("tr");
              this.element.appendChild(row);
              for (let j = 0; j < size; j++) {
                  const field = document.createElement("td");
                  row.appendChild(field);
              }
          }
      }
  }

  class Snake {
      constructor(body) {
          this.body = body;
          this.color = "#222";
          this.direction = 1;
          this.body.forEach(field => document.querySelector(`#board tr:nth-child(${field[0] + 1}) td:nth-child(${field[1] + 1})`).style.backgroundColor = this.color);
      }

      walk() {
          const head = this.body[this.body.length - 1];
          let newHead;
          switch (this.direction) {
              case 0:
                  newHead = [head[0] - 1, head[1]];
                  break;
              case 1:
                  newHead = [head[0], head[1] + 1];
                  break;
              case 2:
                  newHead = [head[0] + 1, head[1]];
                  break;
              case 3:
                  newHead = [head[0], head[1] - 1];
                  break;
              default:
                  break;
          }

          //colisao bordas
          if (newHead[0] < 0 || newHead[0] >= SIZE || newHead[1] < 0 || newHead[1] >= SIZE) {
              endGame("FIM DE JOGO!");
              return;
          }

          //colisao corpo
          for (let i = 0; i < this.body.length; i++) {
              if (this.body[i][0] === newHead[0] && this.body[i][1] === newHead[1]) {
                  endGame("FIM DE JOGO!");
                  return;
              }
          }

          //cobra comeu
          if (newHead[0] === food.position[0] && newHead[1] === food.position[1]) {
              this.body.push(newHead);
              document.querySelector(`#board tr:nth-child(${newHead[0] + 1}) td:nth-child(${newHead[1] + 1})`).style.backgroundColor = this.color;
              updateScore(food.type);
              food.generateNewPosition();
          } else {
              this.body.push(newHead);
              const oldTail = this.body.shift();
              document.querySelector(`#board tr:nth-child(${newHead[0] + 1}) td:nth-child(${newHead[1] + 1})`).style.backgroundColor = this.color;
              document.querySelector(`#board tr:nth-child(${oldTail[0] + 1}) td:nth-child(${oldTail[1] + 1})`).style.backgroundColor = board.color;
          }
      }

      changeDirection(direction) {
          //nao move 180° 
          if (Math.abs(this.direction - direction) !== 2) {
              this.direction = direction;
          }
      }
  }

  class Food {
      constructor() {
          this.generateNewPosition();
      }

      generateNewPosition() {
          let position;
          do {
              position = [Math.floor(Math.random() * SIZE), Math.floor(Math.random() * SIZE)];
          } while (snake.body.some(segment => segment[0] === position[0] && segment[1] === position[1]));

          this.position = position;

          //tipos de comida (comum == preta ou especial == vermelha)
          this.type = Math.random() < 0.666 ? 'common' : 'special';
          this.color = this.type === 'common' ? '#000' : '#f00';

          document.querySelector(`#board tr:nth-child(${position[0] + 1}) td:nth-child(${position[1] + 1})`).style.backgroundColor = this.color;
      }
  }

  function run() {
      if (!isPaused) {
          snake.walk();
          //aumenta a dificuldade através do frame
          frameCount++;
          if (frameCount % 60 === 0) {
              FPS += 1;
              clearInterval(runInterval);
              runInterval = setInterval(run, 1000 / FPS);
          }
      }
  }

  //contagem de pontos
  function updateScore(type) {
      score += type === 'common' ? 1 : 2;
      document.getElementById("score").innerHTML = formatScore(score);
  }

  //formatar placar
  function formatScore(score) {
      return score.toString().padStart(5, '0');
  }

  //pausa no jogo
  function togglePause() {
      isPaused = !isPaused;
  }

  //perdeu
  function endGame(message) {
      clearInterval(runInterval);
      const messageElement = document.getElementById("message");
      messageElement.style.display = "block";
      messageElement.innerHTML = message;
      //atualiza o estado do jogo
      isGameOver = true;
  }

  init();
}
