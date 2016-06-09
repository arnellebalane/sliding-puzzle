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

    function up() {
        if (mp.y > 0) {
            grid[mp.y][mp.x] = grid[mp.y - 1][mp.x];
            grid[mp.y - 1][mp.x] = 0;
            mp.y--;
        }
    }

    function down() {
        if (mp.y < h - 1) {
            grid[mp.y][mp.x] = grid[mp.y + 1][mp.x];
            grid[mp.y + 1][mp.x] = 0;
            mp.y++;
        }
    }

    function left() {
        if (mp.x > 0) {
            grid[mp.y][mp.x] = grid[mp.y][mp.x - 1];
            grid[mp.y][mp.x - 1] = 0;
            mp.x--;
        }
    }

    function right() {
        if (mp.x < w - 1) {
            grid[mp.y][mp.x] = grid[mp.y][mp.x + 1];
            grid[mp.y][mp.x + 1] = 0;
            mp.x++;
        }
    }

    function move(direction) {
        if (!mp) {
            return null;
        }
        switch (direction) {
            case 'up': return up();
            case 'down': return down();
            case 'left': return left();
            case 'right': return right();
        }
    }

    return {
        getPosition: getPosition,
        showMoveableTile: showMoveableTile,
        move: move
    };
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


function startGame() {
    grid.showMoveableTile();
}





document.addEventListener('keydown', function(e) {
    switch (e.keyCode) {
        case 83: startGame(); break; // "S"
        case 38: grid.move('up'); break; // "Up"
        case 40: grid.move('down'); break; // "Down"
        case 37: grid.move('left'); break; // "Left"
        case 39: grid.move('right'); break; // "Right"
    }
});
