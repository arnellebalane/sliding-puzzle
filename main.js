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
        [ 1, 9, 3 ],
        [ 4, 7, 6 ],
        [ 5, 8, 2 ]
    ];

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
        var w = grid[0].length;
        var h = grid.length;
        var position = {
            x: width / w * coords.x,
            y: height / h * coords.y,
            width: width / w,
            height: height / h
        };
        return position;
    }

    return { getPosition: getPosition };
})();


function render() {
    for (var i = 1; i <= 9; i++) {
        var vp = grid.getPosition(i, 640, 360, true);
        var cp = grid.getPosition(i, canvas.width, canvas.height);

        context.drawImage(video, vp.x, vp.y, vp.width, vp.height, cp.x, cp.y, cp.width, cp.height);
    }
}
