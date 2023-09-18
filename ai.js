function update() {
    var left = 64 - popcount(board_position_computer | board_position_player)
    if (left <= FINAL_SEARCH) winning_sequence = true;

    var listlegal = findlegal(board_position_computer,board_position_player);
    if (winning_sequence) MAX_DEPTH = left-1;

    var maxpos = MINVALUE;
    var move;
    for(let i = 0; i < 64; i++) {
        if (listlegal & 1n) {
            var uv = flipresult(board_position_computer,board_position_player,i)
            var cst = -cost(uv[1],uv[0],MAX_DEPTH,MINVALUE,MAXVALUE)
            if (maxpos < cst) {
                maxpos = cst;
                move = i;
            }
        }
        listlegal >>= 1n;
    }
    
    // if (winning_sequence && maxpos > 0) {
    //     document.getElementById("seq").innerHTML = "0";
    // }
    // else if (winning_sequence && maxpos <= 0) {
    //     document.getElementById("seq").innerHTML = "1";
    // }
    uv = flipresult(board_position_computer,board_position_player,move);
    board_position_computer = uv[0];
    board_position_player = uv[1];
    legal_moves = findlegal(board_position_player,board_position_computer);

    draw_board();
    draw_pos(1n << BigInt(move),"#FF0000",0.2);

    if (legal_moves) {
        playable = true;
    }
    else {
        legal_moves = findlegal(board_position_computer,board_position_player);
        if (legal_moves) {
            setTimeout(update,400);
        }
    }
}

function show() {
    var str = "";
    var tp_black = board_position_player;
    var tp_white = board_position_computer;
    
    for(let i = 0; i < 8; i++) {
        for(let j = 0; j < 8; j++) {
            if (tp_black & 1n) str += "B";
            else if (tp_white & 1n) str += "W";
            else str += "X";
            tp_black /= 2n;
            tp_white /= 2n;
        }
        str += " ";
    }
    // document.getElementById("show").innerHTML = str;    
}
