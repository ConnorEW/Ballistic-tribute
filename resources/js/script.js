const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");

//Height and width of the games
var x = canvas.width/2;
var y = canvas.height-82;

var ballRadius = 8;
//Speed of the ball
//currently non functional
/* 
    Instead of adjusting the draw rate speed,
    Adjust the x and y movement of the ball
    in relation to the amount of balls

*/
//Brick variables
const brickSetUp = {
    brickRowCount: 5,
    brickColumnCount: 5,
    brickWidth: 78,
    brickHeight: 25,
    brickPadding: 10,
    brickOffsetTop: 30,
    brickOffsetLeft: 30,
    brickTotalCount: 0,
    blockColors: ['red', 'orange', 'yellow', '#0095DD', 'purple']
}

var distX = 3;
var distY = -3;
// var increaseSpeed = brickSetUp.brickTotalCount * 0.1;

var paddleHeight = 15;
var paddleWidth = 100;
//paddleX, x upper left corner the rectangle will start at
var paddleX = (canvas.width-paddleWidth) / 2;
//paddleY, y coordinate for the paddle
/* starting value 590 if 1280 x 780 screen*/
var paddleY = paddleHeight * 5;

//paddle movement flags
var rightPressed = false;
var leftPressed = false;
var ballStart = false;

//Score keeping
var score = 0;

function drawScore() {
    ctx.font ="16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText(`Score: ${score}`, 8, 20);
}

window.onload = init;
function init() {
    window.requestAnimationFrame(draw);
}

//Creating an array to store the amount of bricks in a column/row
var bricks = [];
for (var c = 0; c < brickSetUp.brickColumnCount; c++){
    bricks[c] = [];
    for (var r = 0; r < brickSetUp.brickRowCount; r++){
        //the object holds the position of the brick and whether or not its been hit
        bricks[c][r] = {
            x: 0,
            y: 0,
            hit: false
        };
        brickSetUp.brickTotalCount += 1;
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI*2);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height-paddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = "#0095DD";
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
}

function draw() {
    if (ballStart === true){
        //This code makes the ball move
        if(y + distY < ballRadius) {
            console.log('top bump');
            distY = -distY;
        } else if(y + distY > canvas.height-ballRadius) {
            //checks if the ball has hit the bottom of the screen
            alert("GAME OVER");
            document.location.reload();
            clearInterval(interval);
        } else if(y + distY > canvas.height-paddleY){
            if (y < paddleY - paddleHeight && x < paddleX + paddleWidth){
                distY = distY;
            }
            if(x > paddleX && x < paddleX + paddleWidth) {    
                distY = -distY;
            }
/* 
            BUG: if the ball falls underneath the paddle,
                the ball continues to bounce up and down
                until the paddle isnt over top of it
*/
        };
        //reverses the ball when the sides have been touched
        if (x + distX < ballRadius || x + distX > canvas.width-ballRadius) {
            distX = -distX;
            console.log(`side bump`);
            console.log(brickSetUp.brickTotalCount);
        };
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        x += distX;
        y += distY;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    //Paddle movements
    if(rightPressed) {
        paddleX += 8;
        if (paddleX + paddleWidth > canvas.width) {
            paddleX = canvas.width - paddleWidth;
            //moves the ball with the paddle
            if (ballStart === false){
                x = canvas.width - (paddleWidth/2);
            }
        }
        if (ballStart === false){
            x += 8;
        }
    }
    else if(leftPressed) {
        paddleX -= 8;
        if (paddleX < 0){
            paddleX = 0;
            //moves the ball with the paddle
            if (ballStart === false){
                x = (paddleWidth/2) + ballRadius;
            }
        }
        if (ballStart === false){
            x -= 8;
        }
    }
    drawBricks();
    drawBall();
    drawPaddle();
    brickCollisionDetection();
    drawScore();
    window.requestAnimationFrame(draw);
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(el) {
    if(el.key == "Right" || el.key == "ArrowRight") {
        rightPressed = true;
    }else if(el.key == "Left" || el.key == "ArrowLeft") {
        leftPressed = true;
    }else if(el.keyCode === 13){
        ballStart = true;
    }
}

function keyUpHandler(el) {
    if(el.key == "Right" || el.key == "ArrowRight") {
        rightPressed = false;
    }else if(el.key == "Left" || el.key == "ArrowLeft") {
        leftPressed = false;
    }
}

function drawBricks() {
    for(var c = 0; c < brickSetUp.brickColumnCount; c++) {
        for(var r = 0; r < brickSetUp.brickRowCount; r++) {
            if (bricks[c][r].hit === false){
                var brickX = (c * (brickSetUp.brickWidth + brickSetUp.brickPadding)) + brickSetUp.brickOffsetLeft;
                var brickY = (r * (brickSetUp.brickHeight + brickSetUp.brickPadding)) + brickSetUp.brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickSetUp.brickWidth, brickSetUp.brickHeight);
                ctx.fillStyle = brickSetUp.blockColors[r];
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function brickCollisionDetection() {
    for(var c=0; c<brickSetUp.brickColumnCount; c++) {
        for(var r=0; r<brickSetUp.brickRowCount; r++) {
            var b = bricks[c][r];
            if(b.hit === false) {
                if(x > b.x && x < b.x+brickSetUp.brickWidth && y > b.y && y < b.y+brickSetUp.brickHeight) {
                    distY = -distY;
                    b.hit = true;
                    score++;
                    //fix placement of game won code. 
                    //brick doesn't disappear and the score doesnt update
                    brickSetUp.brickTotalCount -= 1;
                    gameWon(score);
                }
            }
        }
    }
}

function gameWon(finalScore) {
    if (brickSetUp.brickTotalCount === 0){
        alert(`Congratulations! Your score is ${finalScore}!`);
        document.location.reload();
        clearInterval(interval);
    }
};



/* 
    Two variables for storing information on whether the left or right control button is pressed.
    Two event listeners for keydown and keyup events. We want to run some code to handle the paddle movement when the buttons are pressed.
    Two functions handling the keydown and keyup events  the code that will be run when the buttons are pressed.
    The ability to move the paddle left and right
 */