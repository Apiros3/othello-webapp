
var c = document.getElementById("othello_board");
var ctx = c.getContext("2d");

//offset values
var offsetX = c.offsetLeft + c.clientLeft;
var offsetY = c.offsetTop + c.clientTop;
var rects = [];
var height = c.height;
var width = c.width;


//adding event listeners
function board_click(event) {
    //obtains values x and y on where the mouse is relative to canvas 
    var x = event.offsetX, y = event.offsetY
    var dx = 7 - Math.floor(8*x/width);
    var dy = 7 - Math.floor(8*y/height);

    if (playable && ((1n << BigInt(dy*8+dx)) & legal_moves)) {
        playable = false;
        var uv = flipresult(board_position_player,board_position_computer,dy*8+dx);
        
        board_position_player = uv[0];
        board_position_computer = uv[1];

        legal_moves = 0n;
        draw_board();
        
        legal_moves = findlegal(board_position_computer,board_position_player);
        draw_pos(1n << BigInt(dy*8+dx),"#FF0000",0.2);
        if (legal_moves) {
            setTimeout(update,400);
        }
        else {
            legal_moves = findlegal(board_position_player,board_position_computer);
            if (legal_moves) {
                playable = true;
                draw_board();
                draw_pos(1n << BigInt(dy*8+dx),"#FF0000",0.2);
            }
        }
    }
}
const canvas = document.querySelector('canvas');
c.addEventListener('mousedown',function(e) {board_click(e)});

function end_game() {
    var p_cnt = popcount(board_position_player);
    var c_cnt = popcount(board_position_computer);
    var to_send = p_cnt + "対" + c_cnt;
    var x = p_cnt - c_cnt;
    var y = document.getElementById("init_range").value;
    if (x > 0) {
        document.getElementById("win").innerHTML = "YOU WIN!!"
        document.getElementById("seq").innerHTML = "<a class=\"twitter-share-button\" href=\"https://twitter.com/intent/tweet?text=Apiros3のオセロAI(レベル" + y + ")に" + to_send + "で勝ちました！%0d&url=https://apiros3.github.io/othello/index.html\" data-size=\"large\">Tweet</a>"
    }
    else if (x < 0) {
        document.getElementById("win").innerHTML = "You lose..."
        document.getElementById("seq").innerHTML = "<a class=\"twitter-share-button\" href=\"https://twitter.com/intent/tweet?text=Apiros3のオセロAI(レベル" + y + ")に" + to_send + "で負けました…%0d&url=https://apiros3.github.io/othello/index.html\" data-size=\"large\">Tweet</a>"
    }
    else {
        document.getElementById("win").innerHTML = "YOU TIED!?"
        document.getElementById("seq").innerHTML = "<a class=\"twitter-share-button\" href=\"https://twitter.com/intent/tweet?text=Apiros3のオセロAI(レベル" + y + ")に" + to_send + "で引き分けました…!%0d&url=https://apiros3.github.io/othello/index.html\" data-size=\"large\">Tweet</a>"
    }
    

}

function draw_pos(board_pos, color, rad) {
    var dim = height/8;
    for(let i = 7; i >= 0; i--) {
        for(let j = 7; j >= 0; j--) {
            if (board_pos & 1n) {
                ctx.beginPath();
                ctx.arc(dim*j+dim/2,dim*i+dim/2,dim*rad,0,2*Math.PI);
                ctx.fillStyle = color
                ctx.fill();
                ctx.stroke();
            }
            board_pos >>= 1n;
        }
    }
}
function draw_board() {
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle = "#378805";
    ctx.fillRect(0,0,width,height);
    
    var dim = height/8;
    //draws board outlines
    for(let i = 0; i < 8; i++) {
        for(let j = 0; j < 8; j++) {
            ctx.beginPath();
            ctx.rect(dim*i,dim*j,dim,dim);
            ctx.stroke();
        }
    }
    //draw circles
    if (computer_isBlack) {
        draw_pos(board_position_player,"#FFFFFF",0.4);
        draw_pos(board_position_computer,"#000000",0.4);
    }
    else {
        draw_pos(board_position_player,"#000000",0.4);
        draw_pos(board_position_computer,"#FFFFFF",0.4);
    }
    draw_pos(legal_moves,"#808080",0.2);

    document.getElementById("player_stone").innerHTML = popcount(board_position_player);
    document.getElementById("computer_stone").innerHTML = popcount(board_position_computer);

    //Game ended
    if(!findlegal(board_position_player,board_position_computer) && !findlegal(board_position_computer,board_position_player)) {
        end_game();
    }

}

