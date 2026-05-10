const Jimp = require('jimp');

Jimp.read('C:\\Users\\Sonny Saggar\\.gemini\\antigravity\\scratch\\hivebaby\\apps\\master-engine\\public\\ud-logo-micro.png').then(img => {
    let r=0, g=0, b=0, count=0;
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
        if(this.bitmap.data[idx+3] > 0) { // If not completely transparent
            r += this.bitmap.data[idx];
            g += this.bitmap.data[idx+1];
            b += this.bitmap.data[idx+2];
            count++;
        }
    });
    console.log(`Average Color: rgb(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)})`);
}).catch(err => console.error(err));
