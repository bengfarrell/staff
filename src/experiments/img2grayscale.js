var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

var img = new Image();
img.src = 'food.jpg';
img.onload = function(e) {
    canvas.height = this.naturalHeight;
    canvas.width = this.naturalWidth;

    var starttime = new Date().getTime();
    ctx.drawImage(img, 0, 0, this.naturalWidth, this.naturalHeight);
    var imgPixels = ctx.getImageData(0, 0, this.naturalWidth, this.naturalHeight);
    ctx.putImageData( toGrayscale(imgPixels), 0, 0, 0, 0, this.naturalWidth, this.naturalHeight );
    var endtime = new Date().getTime();
    console.log((endtime-starttime)/1000 + ' seconds');
};


function toGrayscale(pxs) {
    for (var c = 0; c < pxs.data.length; c+=4) {
        var gray = (pxs.data[c] + pxs.data[c+1] + pxs.data[c+2])/3;
        pxs.data[c] = pxs.data[c+1] = pxs.data[c+2] = gray;
    }
    return pxs;
}