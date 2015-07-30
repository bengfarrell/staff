var ImageUtils = function() {

    /**
     * convert image to grayscale
     * @param {ImageData} pxs
     * @returns {*}
     */
    this.toGrayscale = function(pxs) {
        for (var c = 0; c < pxs.data.length; c+=4) {
            var gray = (pxs.data[c] + pxs.data[c+1] + pxs.data[c+2])/3;
            pxs.data[c] = pxs.data[c+1] = pxs.data[c+2] = gray;
        }
        return pxs;
    };

    /**
     * convert 2 images to an image highlighting differences
     * @param pxs1
     * @param pxs2
     * @param tolerance
     * @returns {*}
     */
    this.toDiff = function(pxs1, pxs2, tolerance) {
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
};