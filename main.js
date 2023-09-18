//for debugging
// var board_position_player = 0n;
// var board_position_computer = 0xFFFFFFFFFFFFFFFFn;

var board_position_player   = 0x0000000810000000n;
var board_position_computer = 0x0000001008000000n;
var legal_moves = 0n;

var MAX_DEPTH = 5;
var FINAL_SEARCH = 12;

var computer_isBlack = false;

var playable = false;
var started = false;

function reverse_role() {
    var tmp = board_position_player;
    board_position_player = board_position_computer;
    board_position_computer = tmp;

    computer_isBlack = !computer_isBlack;
    if (computer_isBlack) {
        document.getElementById("player").innerHTML = "White";
        document.getElementById("computer").innerHTML = "Black";
    }
    else {
        document.getElementById("player").innerHTML = "Black";
        document.getElementById("computer").innerHTML = "White";
    }
}

function start() {
    if (!started) {
        started = true;
        document.getElementById("init_start").disabled = true;
        document.getElementById("init_rev").disabled = true;
        document.getElementById("init_range").disabled = true;
        var level = document.getElementById("init_range").value;
        MAX_DEPTH = Math.max(level,0);
        FINAL_SEARCH = Math.ceil(3.4*level+1);

        if (computer_isBlack) update();
        else {
            legal_moves = findlegal(board_position_player,board_position_computer);
            draw_pos(legal_moves,"#808080",0.2);
            playable = true;
        }
    }
}