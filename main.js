var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');

var video = document.createElement('video');
video.src = 'https://d3heg6bx5jbtwp.cloudfront.net/video/enc/kXSUWT2dw7XRrq3oxqGfx6-360.webm';
video.autoplay = true;
video.loop = true;
video.play();

setInterval(render, 1000 / 60);


var grid = (function() {
    var grid = [
        [ 1, 2, 3 ],
        [ 4, 5, 6 ],
        [ 7, 8, 9 ]
    ];

    var w = grid[0].length;
    var h = grid.length;

    var mp = null;
    var moves = [];

    function getCoordinates(n, original) {
        if (original) {
            var x = (n - 1) % grid[0].length;
            var y = Math.floor((n - 1) / grid.length);
            return { x: x, y: y };
        }
        for (var y = 0; y < grid.length; y++) {
            for (var x = 0; x < grid[y].length; x++) {
                if (grid[y][x] === n) {
                    return { x: x, y: y };
                }
            }
        }
    }

    function getPosition(i, width, height, original) {
        var coords = getCoordinates(i, original);
        if (!coords) {
            return null;
        }
        var position = {
            x: width / w * coords.x,
            y: height / h * coords.y,
            width: width / w,
            height: height / h
        };
        return position;
    }

    function showMoveableTile() {
        grid[h - 1][w - 1] = 0;
        mp = { x: w - 1, y: h - 1 };
    }

    function canmove(direction) {
        switch (direction) {
            case 'up': return mp.y > 0;
            case 'down': return mp.y < h - 1;
            case 'left': return mp.x > 0;
            case 'right': return mp.x < w - 1;
        }
    }

    function up() {
        if (canmove('up')) {
            grid[mp.y][mp.x] = grid[mp.y - 1][mp.x];
            grid[mp.y - 1][mp.x] = 0;
            mp.y--;
        }
    }

    function down() {
        if (canmove('down')) {
            grid[mp.y][mp.x] = grid[mp.y + 1][mp.x];
            grid[mp.y + 1][mp.x] = 0;
            mp.y++;
        }
    }

    function left() {
        if (canmove('left')) {
            grid[mp.y][mp.x] = grid[mp.y][mp.x - 1];
            grid[mp.y][mp.x - 1] = 0;
            mp.x--;
        }
    }

    function right() {
        if (canmove('right')) {
            grid[mp.y][mp.x] = grid[mp.y][mp.x + 1];
            grid[mp.y][mp.x + 1] = 0;
            mp.x++;
        }
    }

    function move(direction, ignore) {
        if (!mp) {
            return null;
        }
        console.info(direction, ignore);
        if (!ignore) {
            moves.push(direction);
        }
        switch (direction) {
            case 'up': return up();
            case 'down': return down();
            case 'left': return left();
            case 'right': return right();
        }
    }

    function shuffle(times) {
        var directions = ['up', 'down', 'left', 'right'];
        var previous = null;
        for (var i = 0; i < times; i++) {
            var index = Math.floor(Math.random() * directions.length);
            var direction = directions[index];
            if (direction === 'left' && previous === 'right'
            || direction === 'right' && previous === 'left'
            || direction === 'up' && previous === 'down'
            || direction === 'down' && previous === 'up'
            || !canmove(direction)) {
                i--;
                continue;
            }
            move(direction);
            previous = direction;
        }
        console.info(moves, moves.length);
    }

    function solve() {
        var last = moves.pop();
        switch (last) {
            case 'up': return move('down', true);
            case 'down': return move('up', true);
            case 'left': return move('right', true);
            case 'right': return move('left', true);
        }
    }

    return {
        getPosition: getPosition,
        showMoveableTile: showMoveableTile,
        move: move,
        shuffle: shuffle,
        solve: solve
    };
})();


var game = (function() {
    var started = false;
    var solving = false;

    function start() {
        if (started) {
            return null;
        }
        started = true;
        grid.showMoveableTile();
        grid.shuffle(30);
    }

    function move(direction) {
        if (solving) {
            return null;
        }
        grid.move(direction);
    }

    function solve() {
        solving = true;
        setInterval(grid.solve, 100);
    }

    return { start: start, move: move, solve: solve };
})();


function render() {
    clearCanvas();

    for (var i = 1; i <= 9; i++) {
        var vp = grid.getPosition(i, 640, 360, true);
        var cp = grid.getPosition(i, canvas.width, canvas.height);

        if (vp && cp) {
            context.drawImage(video, vp.x, vp.y, vp.width, vp.height, cp.x, cp.y, cp.width, cp.height);
        }
    }
}


function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}





document.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
        case 83: return game.start(); // "S"
        case 81: return game.solve(); // "Q"
        case 38: return game.move('up'); // "Up"
        case 40: return game.move('down'); // "Down"
        case 37: return game.move('left'); // "Left"
        case 39: return game.move('right'); // "Right"
    }
});
