var MINVALUE = -5000000;
var MAXVALUE = 5000000;
var multiplier_BP = 6.6;
var multiplier_FS = 230;
var multiplier_CN = 5;
var winning_sequence = false;

function popcount(num) {
    var number = BigInt(num)
    var count = 0;
    while(number) {
        if (number & 1n) count++;
        number >>= 1n;
    }
    return count;
}

function findlegal(pla, opp) {
    var legal = 0n;
    var player = BigInt(pla);
    var opponent = BigInt(opp);
    var horizontalWatch = opponent & 0x7e7e7e7e7e7e7e7en;
    var verticalWatch   = opponent & 0x00FFFFFFFFFFFF00n;
    var allSideWatch    = opponent & 0x007e7e7e7e7e7e00n;
    var allBlank        = (player | opponent) ^ 0xFFFFFFFFFFFFFFFFn;    
    var tmp = 0n;

    //left
    tmp = horizontalWatch & (player << 1n);
    for (let i = 0; i < 5; i++) tmp |= horizontalWatch & (tmp << 1n);
    legal = allBlank & (tmp << 1n);
    //right
    tmp = horizontalWatch & (player >> 1n);
    for (let i = 0; i < 5; i++) tmp |= horizontalWatch & (tmp >> 1n);
    legal |= allBlank & (tmp >> 1n);
    //up
    tmp = verticalWatch & (player << 8n);
    for (let i = 0; i < 5; i++) tmp |= verticalWatch & (tmp << 8n);
    legal |= allBlank & (tmp << 8n);
    //down
    tmp = verticalWatch & (player >> 8n);
    for (let i = 0; i < 5; i++) tmp |= verticalWatch & (tmp >> 8n);
    legal |= allBlank & (tmp >> 8n);
    //topright
    tmp = allSideWatch & (player << 7n);
    for (let i = 0; i < 5; i++) tmp |= allSideWatch & (tmp << 7n);
    legal |= allBlank & (tmp << 7n);
    //topleft
    tmp = allSideWatch & (player << 9n);
    for (let i = 0; i < 5; i++) tmp |= allSideWatch & (tmp << 9n);
    legal |= allBlank & (tmp << 9n);
    //bottomright
    tmp = allSideWatch & (player >> 9n);
    for (let i = 0; i < 5; i++) tmp |= allSideWatch & (tmp >> 9n);
    legal |= allBlank & (tmp >> 9n);
    //bottomleft
    tmp = allSideWatch & (player >> 7n);
    for (let i = 0; i < 5; i++) tmp |= allSideWatch & (tmp >> 7n);
    legal |= allBlank & (tmp >> 7n);    

    return legal;
}

function flipresult(pla, opp, flip) {
    var flip_position = (1n << BigInt(flip));
    var will_flip = 0n;    
    var tmp = 0n;
    var current_flip = 0n;
    var player = BigInt(pla);
    var opponent = BigInt(opp);

    //shift amounts
    var shifting = [1n, 8n, 7n, 9n];
    var boundcheckl = [0x7F7F7F7F7F7F7F7Fn, 0x00FFFFFFFFFFFFFFn, 0x00FEFEFEFEFEFEFEn, 0x007F7F7F7F7F7F7Fn];
    for (let i = 0; i < 4; i++) {
        current_flip = flip_position & boundcheckl[i];
        tmp = 0n;
        for (let j = 0; j < 7; j++) {
            current_flip = (current_flip << shifting[i]);
            var check = (opponent & current_flip);
            if (check) tmp |= check;
            else {
                if (current_flip & player) {
                    will_flip |= tmp;
                }
                break;
            } 
            current_flip &= boundcheckl[i];
        }
    }
    var boundcheckr = [0xFEFEFEFEFEFEFEFEn, 0xFFFFFFFFFFFFFF00n, 0x7F7F7F7F7F7F7F00n, 0xFEFEFEFEFEFEFE00n];
    for(let i = 0; i < 4; i++) {
        current_flip = flip_position & boundcheckr[i];
        tmp = 0n;
        for (let j = 0; j < 7; j++) {
            current_flip = (current_flip >> shifting[i]);
            var check = (opponent & current_flip);
            if (check) tmp |= check;
            else {
                if (current_flip & player) {
                    will_flip |= tmp;
                }
                break;
            } 
            current_flip &= boundcheckr[i];
        }
    }
    // if (will_flip == 0) cout << "flip error" << endl;
    return [(player ^ will_flip ^ flip_position), (opponent ^ will_flip)];
}

function check(value, player) {
    return ((1n << BigInt(value)) & BigInt(player)) == (1n << BigInt(value));
}
function costBP(pla) {
    var player = BigInt(pla)
    var ret = 0;
    var BP_value = [45,1,0.2,-3,-5,-10,-16];
    var BP_checker = [
        0x8100000000000081n, 0x2400810000810024n,
        0x0000240000240000n, 0x18245AA5A55A2418n,
        0x0018004242001800n, 0x4281000000008142n,
        0x0042000000004200n
    ];
    for(let i = 0; i < 7; i++) {
        ret += (popcount(BP_checker[i] & player) * BP_value[i]);
    }
    
    return ret;
}
function findBP(player, opponent) {
    return costBP(player) - costBP(opponent);
}

//finds the number of fixed stones (FS)
function costFS(pla) {
    var player = BigInt(pla)
    var fixed_stones = 0n;
    var tmp = 0n;
    //going: left, right, down, up
    var leftWatch =  0x0100000000000001n;
    var rightWatch = 0x8000000000000080n;
    var downWatch =  0x8100000000000000n;
    var upWatch =    0x0000000000000081n;

    tmp = leftWatch & player;
    for (let i = 0; i <7; i++) tmp |= (tmp << 1n) & player; 
    fixed_stones |= tmp;
    // debugboard(tmp);

    tmp = rightWatch & player;
    for (let i = 0; i <7; i++) tmp |= (tmp >> 1n) & player;
    fixed_stones |= tmp;
    // debugboard(tmp);

    tmp = downWatch & player;
    for (let i = 0; i <7; i++) tmp |= (tmp << 8n) & player;
    fixed_stones |= tmp;
    // debugboard(tmp);

    tmp = upWatch & player;
    for (let i = 0; i <7; i++) tmp |= (tmp >> 8n) & player;
    fixed_stones |= tmp;
    // debugboard(tmp);

    return fixed_stones;
}
function findFS(pla, opp) {
    var player = BigInt(pla);
    var opponent = BigInt(opp);
    var player_FS = costFS(player), opponent_FS = costFS(opponent);
    var both = player | opponent;
    var testedge = [0xFF00000000000000n, 0x8080808080808080n, 0x0101010101010101n, 0x00000000000000FFn];
    for(let i = 0; i < 4; i++) {
        if ((both & testedge[i]) == testedge[i]) {
            player_FS |= player & testedge[i];
            opponent_FS |= opponent & testedge[i];
        }
    }
    return popcount(player_FS) - popcount(opponent_FS);
}

function findCN(player, opponent) {
    // return 0;
    return popcount(findlegal(player,opponent));
}

function cost(player, opponent, depth, alpha, beta) {
    if (!depth) {
        if (winning_sequence) {
            return popcount(player) - popcount(opponent);
        }
        var position_value = 0;
        position_value += multiplier_BP * (findBP(player,opponent) + Math.random());
        position_value += multiplier_FS * findFS(player,opponent);
        position_value += multiplier_CN * findCN(player,opponent);

        return position_value;
    }
    else {
        // double position_value = MINVALUE;
        var next_legal_moves = findlegal(player,opponent);

        if (!next_legal_moves) {
            if (!findlegal(opponent,player))
                return (popcount(player) - popcount(opponent)) * 50000;
            return (-cost(opponent,player,depth,-beta,-alpha));
        }
        for(let i = 0; i < 64; i++) {
            if (next_legal_moves & 1n) {
                var uv = flipresult(player,opponent,i);
                var cst = -cost(uv[1],uv[0],depth-1,-beta,-alpha);
                alpha = Math.max(alpha, cst);
                if (alpha >= beta && !winning_sequence) return alpha;
                if (alpha > 0 && winning_sequence) return alpha;
            }
            next_legal_moves >>= 1n;
        }
        return alpha;
    }
}