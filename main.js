var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');

var video = document.createElement('video');
video.src = 'https://d3heg6bx5jbtwp.cloudfront.net/video/enc/FkFqcLd88amRhQQdA8fPVK-360.webm';
video.autoplay = true;
video.loop = true;
video.crossOrigin = 'anonymous';
video.play();


var grid = (function() {
    var grid = [];
    var w = 0;
    var h = 0;

    var mp = null;
    var moves = [];

    function generate(dimension) {
        for (var y = 0; y < dimension; y++) {
            grid[y] = [];
            for (var x = 0; x < dimension; x++) {
                grid[y][x] = y * dimension + (x + 1);
            }
        }
        w = dimension;
        h = dimension;
    }

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
        if (!ignore) {
            moves.push(direction);
        }
        switch (direction) {
            case 'up': return up();
            case 'down': return down();
            case 'left': return left();
            case 'right': return right();
        }
        return null;
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
    }

    function solve() {
        var last = moves.pop();
        switch (last) {
            case 'up': return move('down', true);
            case 'down': return move('up', true);
            case 'left': return move('right', true);
            case 'right': return move('left', true);
        }
        return true;
    }

    return {
        generate: generate,
        getPosition: getPosition,
        showMoveableTile: showMoveableTile,
        move: move,
        shuffle: shuffle,
        solve: solve
    };
})();


var filters = {
    grayscale: function(data) {
        for (var i = 0; i < data.length; i += 4) {
            var r = data[i];
            var g = data[i + 1];
            var b = data[i + 2];
            var average = (r + g + b) / 3;
            data[i] = average;
            data[i + 1] = average;
            data[i + 2] = average;
        }
        return data;
    },
    negative: function(data) {
        for (var i = 0; i < data.length; i += 4) {
            data[i] = 256 - data[i];
            data[i + 1] = 256 - data[i + 1];
            data[i + 2] = 256 - data[i + 2];
        }
        return data;
    }
};


var game = (function() {
    var dimension = 10;
    var readied = false;
    var started = false;
    var solving = false;

    var width = 640;
    var height = 360;

    var activeFilter = null;

    canvas.width = width;
    canvas.height = height;
    grid.generate(dimension);

    function ready() {
        readied = true;
        grid.showMoveableTile();
    }

    function start() {
        if (started) {
            return null;
        }
        if (!readied) {
            ready();
        }
        started = true;
        grid.shuffle(100);
    }

    function move(direction) {
        if (solving) {
            return null;
        }
        grid.move(direction);
    }

    function camera() {
        var gum = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        var constraints = { video: { width: width, height: height } };
        gum.call(navigator, constraints, function(stream) {
            video.src = URL.createObjectURL(stream);
        }, function() {});
    }

    function filter(style) {
        activeFilter = style || null;
    }

    function solve() {
        if (!started || solving) {
            return null;
        }
        solving = true;
        var timer = setInterval(function() {
            var solved = grid.solve();
            if (solved) {
                started = false;
                solving = false;
                clearInterval(timer);
            }
        }, 100);
    }

    function render() {
        clearCanvas();

        for (var i = 1; i <= dimension * dimension; i++) {
            var vp = grid.getPosition(i, width, height, true);
            var cp = grid.getPosition(i, canvas.width, canvas.height);

            if (vp && cp) {
                context.drawImage(video, vp.x, vp.y, vp.width, vp.height, cp.x, cp.y, cp.width, cp.height);
            }
        }

        if (activeFilter) {
            var data = context.getImageData(0, 0, canvas.width, canvas.height);
            data.data = filters[activeFilter](data.data);
            context.putImageData(data, 0, 0);
        }
    }

    return {
        ready: ready,
        start: start,
        move: move,
        camera: camera,
        filter: filter,
        solve: solve,
        render: render
    };
})();


function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}





setInterval(game.render, 1000 / 60);

document.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
        case 49: return game.filter('grayscale'); // "1"
        case 50: return game.filter('negative'); // "2"
        case 48: return game.filter(null); // "0"
        case 65: return game.ready(); // "A"
        case 83: return game.start(); // "S"
        case 81: return game.solve(); // "Q"
        case 77: return game.camera(); // "M"
        case 38: return game.move('up'); // "Up"
        case 40: return game.move('down'); // "Down"
        case 37: return game.move('left'); // "Left"
        case 39: return game.move('right'); // "Right"
    }
});

console.info('Controls:');
console.info('  "1" - Grayscale Filter');
console.info('  "2" - Negative Filter');
console.info('  "0" - No Filter');
console.info('  "A" - Ready Puzzle');
console.info('  "S" - Shuffle Tiles');
console.info('  "Q" - Solve Puzzle');
console.info('  "M" - Switch To Camera Input');
console.info('  "Up/Left/Right/Down" - Move Pink Tile');
