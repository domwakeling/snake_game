/* THINGS TO THINK ABOUT
 * - fix the problem where you can 'turn twice' very quickly and effectively headbutt yourself
 * - be nice to have a different shape for the head and tail of the snake
 * - add some styling
 * - what else did the original game have? some kind of black/brown apple that kills you?
 * - think about making the apples circles?
 * - some of the above will necessitate turning off scaling and having 1:1 pixel mapping for tests
 */

// CONSTANTS
const SCALE = 10
const GAME_WIDTH = 40
const GAME_HEIGHT = 40
const MID_V = GAME_HEIGHT / 2;
const VECTORS = { 37: [-1,0], 38: [0, -1], 39: [1, 0], 40: [0,1] };
const FPS = 12;
const SNAKE_COL = '#0000FF';
const APPLE_COL = '#00FF00';

/* CALCULATED CONSTANTS
 * Want these to be constants (avoiding repetitive calculations) AND to only declare colours in one
 * place; so declare colours first and then these constants use a formula to convert them. Need for
 * these at all is because we need to compare colour data from the canvas which comes out as a
 * strange array format
 */
const SNAKE_COL_DATA = hexToArray(SNAKE_COL);
const APPLE_COL_DATA = hexToArray(APPLE_COL);

// GLOBALS
let level = 0;
let score = 0;
let apples = 0;
let gameLoop = null; // declare here so that it'll be in scope when set to the interval timer

// DOM ELEMENTS
const canvas = document.getElementById('canvas');
const levelDiv = document.getElementById("level");
const scoreDiv = document.getElementById("score");
const messageDiv = document.getElementById("message");
const button = document.getElementById("newGame");

/* CONTEXT
 * Get context, scale it and resize the canvas from there
 */
let context = canvas.getContext('2d');
context.canvas.height = SCALE * GAME_HEIGHT;
context.canvas.width = SCALE * GAME_WIDTH;
context.scale(SCALE,SCALE);

// DRAWING FUNCTIONS

// draw new head for the snake and if bool is true delete the old tail and pop it
const updateAndDrawSnake = (bool) => {
    context.fillStyle = SNAKE_COL;
    context.fillRect(snake[0][0], snake[0][1], 1, 1);
    if (bool) {
        const oldPos = snake.pop();
        context.clearRect(oldPos[0], oldPos[1], 1, 1);
    }
};

// randomly place 'num' apples in empty spaces, NOT against the edge
const addAndDrawApples = (num) => {
    // set fill colour once at start
    context.fillStyle = APPLE_COL;
    // loop until apples is ther right length; since we're checking the canvas state, need to
    // draw each apple as it's set to avoid placing an apple twice in the same place
    while(apples < num) {
        let n = [randInt(GAME_WIDTH - 2) + 1, randInt(GAME_HEIGHT - 2) + 1];
        const candCol = context.getImageData(n[0] * SCALE, n[1] * SCALE, 1, 1).data;
        if( !matchColorData(candCol, APPLE_COL_DATA) && !matchColorData(candCol, SNAKE_COL_DATA)) {
            context.fillRect(n[0], n[1], 1, 1);
            apples += 1;
        }
    }
}

// logic for the update loop
function update() {
    const candPos = addVectors(snake[0], VECTORS[snakeDir]);
    const candCol = context.getImageData(candPos[0] * SCALE, candPos[1] * SCALE, 1, 1).data;
    if (candPos[0] < 0 || candPos[0] >= GAME_WIDTH || candPos[1] < 0 || candPos[1] >= GAME_HEIGHT) {
        clearInterval(gameLoop);
        messageDiv. innerText = 'GAME OVER - HIT A WALL';
        button.style.display = 'block';
    } else if (matchColorData(candCol, SNAKE_COL_DATA)) {
        clearInterval(gameLoop);
        messageDiv.innerText = 'GAME OVER - HIT YOURSELF';
        button.style.display = 'block';
    } else {
        snake.unshift(candPos);
        if (matchColorData(candCol, APPLE_COL_DATA)) {
            apples -= 1;
            score += 1;
            updateAndDrawSnake(false);
        } else {
            updateAndDrawSnake(true);
        }
    }
    if (apples == 0) {
        level += 1;
        addAndDrawApples(level + 5);
    }
    levelDiv.innerText = "Level: " + level;
    scoreDiv.innerText = "Score: " + score;
}

// add event listener for keys
document.addEventListener('keydown', e => {
    // check it's an arrow key and not opposite of current direction (curr + new = odd)
    if (e.keyCode >= 37 && e.keyCode <= 40 && (snakeDir + e.keyCode) % 2 > 0) {
        snakeDir = e.keyCode;
    }
});

// clear screen, set variables, draw snake, add apples, start loop
function startGame(e) {
    level = 1;
    score = 0;
    apples = 0;
    snake = [4, 3, 2, 1, 0].map(x => [x, MID_V]);
    snakeDir = 39;
    messageDiv.innerText = " ";
    context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    button.style.display = 'none';
    context.fillStyle = SNAKE_COL;
    snake.forEach(([x, y]) => context.fillRect(x, y, 1, 1));
    addAndDrawApples(level + 5);
    gameLoop = setInterval(update, 1000 / FPS);
}

// add handler to the button so that it starts game!
button.addEventListener('click', startGame);

/* HELPER FUNCTIONS
 * Declared here for ease of code and because they're fairly easy to discern from name - since
 * declared at bottom there's an issue if trying to call an ES6 function before it's init'd so most
 * of them are declared as ES5 functions
 * */

const addVectors = (a, b) => [a[0] + b[0], a[1] + b[1]];

function hexToArray(hexString) {
    let tempArr = hexString.split(""); // creates an array
    tempArr.shift(); // removes first element, which is a has; can't assign
    return tempArr.join("").match(/.{2}/g).map( a => parseInt('0x'+a));
}

function matchColorData (a, b) {
    // pass data as Uint8ClampedArray compared to 3-RGB array - to check matching from canvas
    return (a[0] == b[0] && a[1] == b[1] && a[2] == b[2]);
}

function randInt(a) {
    return Math.floor(Math.random() * a)
};
