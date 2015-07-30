var canvas = [ document.createElement('canvas'), document.createElement('canvas') ];
var ctx = [ canvas[0].getContext('2d'), canvas[1].getContext('2d') ];
document.body.appendChild(canvas[0]);
document.body.appendChild(canvas[1]);

var count = 0;
var imgs = [new Image(), new Image()];
imgs[0].src = 'imgdiff-a.jpg';
imgs[1].src = 'imgdiff-b.jpg';
imgs[0].onload = imgs[1].onload = function(e) {
    canvas[count].height = this.naturalHeight;
    canvas[count].width = this.naturalWidth;
    ctx[count].drawImage(imgs[count], 0, 0, this.naturalWidth, this.naturalHeight);
    count ++;
    if (count >= 2) {
        var diffcanvas = document.createElement('canvas');
        var diffctx = diffcanvas.getContext('2d');
        document.body.appendChild(diffcanvas);

        diffcanvas.width = this.naturalWidth;
        diffcanvas.height = this.naturalHeight;
        var starttime = new Date().getTime();
        var imgPixelsA = ctx[0].getImageData(0, 0, this.naturalWidth, this.naturalHeight);
        var imgPixelsB = ctx[1].getImageData(0, 0, this.naturalWidth, this.naturalHeight);
        diffctx.putImageData( diff(imgPixelsA, imgPixelsB, 25), 0, 0, 0, 0, this.naturalWidth, this.naturalHeight );
        var endtime = new Date().getTime();
        console.log((endtime-starttime)/1000 + ' seconds');
    }
};

function diff(pxs1, pxs2, tolerance) {
    if (pxs1.data.length !== pxs2.data.length) { throw new Error('images not the same size'); }
    var diff = new ImageData(pxs1.width, pxs1.height);
    for (var c = 0; c < pxs1.data.length; c+=4) {
        var draw = 255;
        for (var d = 0; d < 4; d++) {
            if (pxs1.data[c+d] - pxs2.data[c+d] > tolerance) {
                draw = 0;
                continue;
            }
        }

        diff.data[c] = draw;
        diff.data[c+1] = draw;
        diff.data[c+2] = draw;
        diff.data[c+3]= 255;
    }
    return diff;
}