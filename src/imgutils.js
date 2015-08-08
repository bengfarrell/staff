var ImageUtils =  {
    MIN_BLOB_SIZE: 100,

    /**
     * scale down
     * @param pxs
     * @param scalefactor
     * @returns {*}
     */
    scaleDown: function(pxs, scalefactor) {
        var width = pxs.width;
        var height = pxs.height;
        var rowsize = width * 4;
        var len = pxs.data.length;
        var pixels = new Uint8ClampedArray(pxs.data.length/(scalefactor*2));

        for (var c = 0; c < len; c += 4 * scalefactor) {
            var neighbors = [c - 4, c + 4, c - rowsize, c + rowsize, c - 4 - rowsize, c + 4 - rowsize, c - 4 + rowsize, c + 4 + rowsize];
            var numNeighbors = neighbors.length;
            var r = 0;
            var b = 0;
            var g = 0;
            var neighbors = 0;
            for (var neighbor = 0; neighbor < numNeighbors; neighbor++) {
                if (neighbors[neighbor] >= 0 && neighbors[neighbor] < len) {
                    r += pxs.data[neighbors[neighbor]];
                    g += pxs.data[neighbors[neighbor] + 1];
                    b += pxs.data[neighbors[neighbor] + 2];
                    neighbors ++;
                }
            }
            pixels[c] = r/neighbors;
            pixels[c+1] = g/neighbors;
            pixels[c+2] = b/neighbors;
            pixels[c+3] = 255; // alpha
        }

        console.log(pixels.length, pxs.data.length)
        return new ImageData(pixels, width/scalefactor, height/scalefactor);
    },

    /**
     * convert image to grayscale
     * @param {ImageData} pxs
     * @returns {*}
     */
    toGrayscale: function(pxs) {
        for (var c = 0; c < pxs.data.length; c+=4) {
            var gray = (pxs.data[c] + pxs.data[c+1] + pxs.data[c+2])/3;
            pxs.data[c] = pxs.data[c+1] = pxs.data[c+2] = gray;
        }
        return pxs;
    },

    /**
     * convert 2 images to an image highlighting differences
     * @param pxs1
     * @param pxs2
     * @param tolerance
     * @returns {*}
     */
    toDiff: function(pxs1, pxs2, tolerance) {
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

            diff.data[c] = dr
            diff.data[c+1] = draw;
            diff.data[c+2] = draw;
            diff.data[c+3]= 255;
        }
        return diff;
    },

    /**
     * convert to pure black or pure white
     * @param pxs
     * @param pxs
     * @returns {*}
     */
    toBlackAndWhite: function(pxs, thresholdtoblackpercent) {
        if (!thresholdtoblackpercent) { thresholdtoblackpercent = 50; }
        var threshold = thresholdtoblackpercent/100 * (255 + 255 + 255);
        for (var c = 0; c < pxs.data.length; c+=4) {
            if (pxs.data[c] + pxs.data[c+1] + pxs.data[c+2] < threshold ) {
                pxs.data[c] = 0;
                pxs.data[c+1] = 0;
                pxs.data[c+2] = 0;
            } else {
                pxs.data[c] = 255;
                pxs.data[c+1] = 255;
                pxs.data[c+2] = 255;
            }
        }

        return pxs;
    },

    /**
     * find blobs
     * BLACK AND WHITE IMAGE REQUIRED
     * @param pxs
     * @return {Array} blob coordinates
     */
    findBlobs: function(pxs, cfg) {
        if (!cfg) { cfg = {}; }

        var width = pxs.width;
        var rowsize = width * 4;
        var len = pxs.data.length;
        var pixels = new Uint16Array(pxs.data.length);
        for (var d = 0; d < pxs.data.length; d++) {
            pixels[d] = pxs.data[d];
        }
        var blobs = [];
        var blobIndex = -1;

        // contains pixel indices for blobs that touch
        var blobTable = [];
        for (var c = 0; c < len; c += 4) {
            if (pixels[c] === 255) { continue; }
            var neighbors = [c - 4, c + 4, c - rowsize, c + rowsize, c - 4 - rowsize, c + 4 - rowsize, c - 4 + rowsize, c + 4 + rowsize];
            var numNeighbors = neighbors.length;

            // just check one channel, because we assume every px is black or white
            var blobIndexFound = -1;
            for (var neighbor = 0; neighbor < numNeighbors; neighbor++) {
                if (neighbors[neighbor] >= 0 && neighbors[neighbor] < len && pixels[neighbors[neighbor]] === pixels[c]) {
                    // if touching a neighbor, record index of that blob index of that neighbor
                    // also if touching different indices, record that these indices should be the same index
                    // the blob table records which blob index maps to which other blob index
                    if (pixels[neighbors[neighbor] +1] > 0) {
                        if (blobIndexFound !== -1 && blobIndexFound !== pixels[neighbors[neighbor] +1]) {
                            // green channel (+1) records blob index
                            blobTable.push([blobIndexFound, pixels[neighbors[neighbor] +1]]);
                        }
                        blobIndexFound = pixels[neighbors[neighbor] + 1];
                    }
                }
            }

            if (blobIndexFound > -1) {
                // blob is found, mark pixel and record in blobs
                pixels[c + 1] = blobIndexFound; // use green channel as blob tracker
                blobs[blobIndexFound].push(c);
            } else {
                // brand new blob
                blobIndex++;
                blobs.push([c]);
                pixels[c + 1] = blobIndex; // use green channel as blob tracker
            }
        }

        // merge intersecting pairs
        // maybe not the most efficient code, but blob count should be fairly low (hopefully)
        // revisit if speed gets in the way
        for (var c = 0; c < blobTable.length; c++) {
            for (var d = 0; d < blobTable.length; d++) {
                var connected = false;
                for (var e = 0; e < blobTable[d].length; e++) {
                    if (blobTable[c].indexOf(blobTable[d][e]) !== -1) {
                        connected = true;
                    }
                }
                if (connected && d !== c) {
                    for (var f = 0; f < blobTable[d].length; f++) {
                        // only add uniques
                        if (blobTable[c].indexOf(blobTable[d][f]) === -1) {
                            blobTable[c].push(blobTable[d][f]);
                        }
                    }
                    blobTable[d] = [];
                }
            }
        }

        // weed out empties
        blobTable = blobTable.filter( function(pair) { if (pair.length > 0) { return true; }});

        // each blob is a list of image indices
        // use blobs index to match to blob table index and concat the blobs at that index
        for (var c = 0; c < blobs.length; c++) {
            for (var d = 0; d < blobTable.length; d++) {
                if (blobTable[d].indexOf(c) !== -1) {
                    for (var e = 0; e < blobTable[d].length; e++) {
                        if (blobTable[d][e] !== c) {
                            blobs[c] = blobs[c].concat(blobs[blobTable[d][e]]);
                            blobs[blobTable[d][e]] = [];
                        }
                    }
                }
            }
        }

        // refine blobs now that the right things are concated and we don't need to track
        // meaning we can start splicing things without worrying about the index
        blobs = blobs.filter(function(blb) {
            return blb.length >= this.MIN_BLOB_SIZE;
        }, this);


        // get blob dimensions positions
        var blobCoords = [];
        for (var c = 0; c < blobs.length; c++) {
            var minX = -1, maxX = -1, minY = -1, maxY = -1;
            for (var d = 0; d < blobs[c].length; d++) {
                var px = Math.floor(blobs[c][d] / 4);
                var x = px % width;
                var y = parseInt( px / width );

                if (x < minX || minX === -1) { minX = x; }
                if (x > maxX || maxX === -1) { maxX = x; }
                if (y < minY || minY === -1) { minY = y; }
                if (y > maxY || maxY === -1) { maxY = y; }
            }
            blobCoords.push( { x: minX, y: minY, width: maxX - minX, height: maxY - minY });
        }

        // paint the blobs
        if (cfg.paint) {
            for (var d = 0; d < blobs.length; d++) {
                var clr = [ Math.random() * 255, Math.random() * 255, Math.random() * 255 ];
                for (var e = 0; e < blobs[d].length; e++) {
                    pxs.data[blobs[d][e]] = clr[0];
                    pxs.data[blobs[d][e] + 1] = clr[1];
                    pxs.data[blobs[d][e] + 2] = clr[2];
                }
            }
        }
        return { image: pxs, blobs: blobCoords } ;
    }
};