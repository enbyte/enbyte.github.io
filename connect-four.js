let CANVAS_WIDTH = 700;
let CANVAS_HEIGHT = 700;

let ROWS = 7;
let COLS = 7;

let ROW_WIDTH = CANVAS_HEIGHT / ROWS;
let COL_WIDTH = CANVAS_WIDTH / COLS;

let COMPUTER_PLAYER = 1;
let PLAYER_PLAYER = COMPUTER_PLAYER === 1 ? 2 : 1;
let COMPUTER_NEXTMOVE_API = 'https://kevinalbs.com/connect4/back-end/index.php/getMoves';

let GAMEMODE = "singleplayer";

let ZWSP = "\u200B";

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function maxKeyOfDict(dict) {
    for (let key in dict) {
        if (dict[key] === Math.max(...Object.values(dict))) return key;
    }
}

function setWinText(text) {
    let winText = document.getElementById("win-text");
    winText.innerText = text;

}

class GameState {
    constructor(rows=ROWS, cols=COLS) {
        this.rows = rows;
        this.cols = cols;
        this.board = this.createBoard();
        this.turn = 1;
        this.winner = null;
        this.allowMoreMoves = true;
    }
    getPlayerTurn() {
        return (this.turn % 2 + 1);
    }
    createBoard() {
        return [...Array(this.rows)].map(() => Array(this.cols).fill(0));
    }
    clearBoard() {
        this.board = this.createBoard();
        this.turn = 1;
        this.winner = null;
        this.allowMoreMoves = true;
    }
    canDropPiece(col) {
        return this.board[0][col] === 0;
    }
    dropPiece(col, player) {
        // 1 = red; 2 = yellow
        console.log('dropping piece, player: ' + player + ' col: ' + col);
        if (!this.canDropPiece(col)) return false;
        let row = this.rows - 1;
        while (this.board[row][col] !== 0) {
            row--;
        }
        this.board[row][col] = player;
        return true;
    }
    getCell(x, y) {
        return [Math.floor(y / ROW_WIDTH), Math.floor(x / COL_WIDTH)];
    }
    handleCanvasClick(x, y) {
        if (!this.allowMoreMoves) return false;
        let cell = this.getCell(x, y)[1];
        console.log(cell);
        if (this.dropPiece(cell, this.turn % 2 + 1)) {
            this.turn++;
            console.log('piece dropped')
            if (this.checkWin()) {
                drawManager.drawBoardFromGameState(gameState);
            }
            return true;
        } else {
            console.log("Invalid move");
            return false;
        }
    }
    checkWinPiece(row, col) {
        let player = this.board[row][col];
        if (player === 0) return false;
        let directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        for (let [dx, dy] of directions) {
            let count = 1;
            for (let i = 1; i < 4; i++) {
                let newRow = row + dy * i;
                let newCol = col + dx * i;
                if (newRow < 0 || newRow >= this.rows || newCol < 0 || newCol >= this.cols) break;
                if (this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            for (let i = 1; i < 4; i++) {
                let newRow = row - dy * i;
                let newCol = col - dx * i;
                if (newRow < 0 || newRow >= this.rows || newCol < 0 || newCol >= this.cols) break;
                if (this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            if (count >= 4) {
                this.winner = player;
                return true
            };
        }
        return false;
    }
    checkWin() {

        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.checkWinPiece(row, col)) {
                    this.winner = (this.board[row][col] % 2 + 1);
                    this.allowMoreMoves = false;
                    return true;
                }
            }
    
        }
    }
    getBoardAsString() {
        // 0 = empty; 1 = red; 2 = yellow
        // left to right, top to bottom
        let boardString = "";
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                boardString += this.board[row][col];
            }
        }
        return boardString;
    }
}



class DrawManager {
    constructor(canvas, rows=ROWS, cols=COLS) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.rows = rows;
        this.cols = cols;
    }
    drawBoard() {
        this.ctx.fillStyle = "blue";
        this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        this.ctx.fillStyle = "black";
        for (let row = 0; row <= this.rows; row++) {
            for (let col = 0; col <= this.cols; col++) {
                this.ctx.fillRect(col * COL_WIDTH, row * ROW_WIDTH, 5, ROW_WIDTH);
                this.ctx.fillRect(col * COL_WIDTH, row * ROW_WIDTH, COL_WIDTH, 5);
                console.log('drew line');
            }
        }
    }
    drawPiece(row, col, player) {
        let color = player === 1 ? "red" : "yellow"; // yellow is 2nd
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(col * COL_WIDTH + COL_WIDTH / 2, row * ROW_WIDTH + ROW_WIDTH / 2, 0.4 * COL_WIDTH, 0, 2 * Math.PI);
        this.ctx.fill();
    }
    drawBoardFromGameState(gameState) {
        this.drawBoard();
        for (let x = 0; x < this.cols; x++) {
            for (let y = 0; y < this.rows; y++) {
                if (gameState.board[y][x] !== 0) {
                    this.drawPiece(y, x, gameState.board[y][x]);
                }
            }
        }
    }
}

class NetworkManager {
    constructor(api) {
        this.api = api;
    }
    async getMoves(boardString, player=COMPUTER_PLAYER) {
        let endpoint = this.api + "?board_data=" + boardString + "&player=" + player;
        console.log(endpoint);
        /* let req = new XMLHttpRequest();
        req.open("GET", endpoint, false);
        req.send();
        console.log('req: ' + req.responseText);
        return parseInt(maxKeyOfDict(JSON.parse(req.responseText))); */

        return fetch(endpoint)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                return parseInt(maxKeyOfDict(data));
            }); 
    } 
    async getNextMove(gameState) {
        let boardString = gameState.getBoardAsString();
        let player = gameState.getPlayerTurn();
        console.log('board string: ' + boardString + " " + boardString.length + " " + player); 
        return await this.getMoves(boardString, player);
    }

}

let gameState = new GameState();
let canvas = document.getElementById("canvas");
let drawManager = new DrawManager(canvas);
let networkManager = new NetworkManager(COMPUTER_NEXTMOVE_API);

canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

// handle computer making initial move

let hasWon = false;
drawManager.drawBoardFromGameState(gameState);
let next_move = await networkManager.getNextMove(gameState);
console.log(gameState.dropPiece(next_move, COMPUTER_PLAYER));
drawManager.drawBoardFromGameState(gameState);
console.log(next_move);
console.log('dropped piece from computer');

async function canvasEventListener(e) {
    if (gameState.getPlayerTurn() === PLAYER_PLAYER) {
        if (gameState.handleCanvasClick(e.offsetX, e.offsetY)) {
            drawManager.drawBoardFromGameState(gameState);
            let next_move = await networkManager.getNextMove(gameState);
            gameState.dropPiece(next_move, COMPUTER_PLAYER);
            gameState.turn++;
            console.log('clickety clack, network done');
            drawManager.drawBoardFromGameState(gameState);
            setWinText(ZWSP);

            if (gameState.checkWin()) {
                drawManager.drawBoardFromGameState(gameState);
                hasWon = true;
                gameState.allowMoreMoves = false;
            }
        } else if (gameState.allowMoreMoves) {
            setWinText("Invalid move! Please move in a valid column.");
        }
    } else {
        console.log('uh oh stinky')
        console.log(gameState.getPlayerTurn() + " " + PLAYER_PLAYER + " " + COMPUTER_PLAYER);
    };
    if (hasWon) { 
        drawManager.drawBoardFromGameState(gameState);
        // force canvas update
        drawManager.drawBoardFromGameState(gameState);

        setWinText("Player " + gameState.winner + ` (${gameState.turn % 2 + 1 === 2 ? "red" : "yellow"}) wins! Game over! Press reset board to play again.`);
        hasWon = false;
    }
        
}

canvas.addEventListener("click", (e) => {
    canvasEventListener(e);
});

let resetButton = document.getElementById("reset");

async function resetGame() {
    gameState.clearBoard();
    drawManager.drawBoardFromGameState(gameState);
    setWinText(ZWSP);
    let hasWon = false;
    let next_move = await networkManager.getNextMove(gameState);
    console.log(gameState.dropPiece(next_move, COMPUTER_PLAYER));
    drawManager.drawBoardFromGameState(gameState);
    console.log(next_move);
    console.log('dropped piece from computer');
}

resetButton.addEventListener("click", resetGame);

drawManager.drawBoardFromGameState(gameState);
