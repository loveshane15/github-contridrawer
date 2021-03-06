'use strict';
/*global moment*/
/*eslint camelcase: false*/
/*eslint no-loop-func: false*/


// function setPixel(imagedata, x, y, r, g, b, a) {
//     var i = (y * imagedata.width + x) * 4;
//     imagedata.data[i++] = r;
//     imagedata.data[i++] = g;
//     imagedata.data[i++] = b;
//     imagedata.data[i] = a;
// }

var one_day = 1000 * 60 * 60 * 24;

var git_size = {
    width: 0,
    height: 7
};

var datesToDraw = [];

function getPixel(imagedata, x, y) {
    var i = (y * imagedata.width + x) * 4;
    return {
        r: imagedata.data[i],
        g: imagedata.data[i + 1],
        b: imagedata.data[i + 2],
        a: imagedata.data[i + 3]
    };
}

function download(filename, text) {
  var pom = document.createElement('a');
  pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text) );
  pom.setAttribute('download', filename);

  pom.style.display = 'none';
  document.body.appendChild(pom);

  pom.click();

  document.body.removeChild(pom);
}

var downloadshell = function(){
    var template = document.getElementById('shell-template').innerText;
    var dates = 'dates=(';

    for (var i = datesToDraw.length - 1; i >= 0; i--) {
        var d = new Date(datesToDraw[i]);
        var date = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
        dates += date + ' ';
    }

    dates += ')';

    template = template.replace('dates=()', dates);
    download('github-contridrawer.sh', template);
};

var handleDragOver = function(e){
    e.stopPropagation();
    e.preventDefault();
    // e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
};

var render_preview = function(){
    // var ctx = c.getContext("2d");
    // // debugger;
    var img = document.getElementById('import-image');

    var width_compress_rate = img.naturalHeight / 7;
    git_size.width = img.naturalWidth / width_compress_rate;

    var canvas = document.getElementById('myCanvas');
    canvas.width = git_size.width;
    canvas.height = git_size.height;
    // var canvas2 = document.getElementById("myCanvas2");


    var context = canvas.getContext('2d');

    // var context2 = canvas2.getContext("2d");

    // context2.beginPath();

    context.drawImage(img, 0, 0, git_size.width, git_size.height);
    var imagedata = context.getImageData(0, 0, canvas.width, canvas.height);

    // debugger;
    // var axis  = [];
    (function(){
        var contribution = document.getElementById('contribution');
        // reset preview block
        contribution.innerHTML = '';

        var start_date = new Date('2014-08-03');

        // var end_date = new Date( start_date.getTime() + (one_day * axis.length) );
        // var length = (end_date.getTime() - start_date.getTime()) / one_day;

        var i = 0;
        for( var x = 0; x < imagedata.width; x++ ) {
            var week = document.createElement('div');

            week.className = 'week week-' + x;

            for( var y = 0; y < imagedata.height; y++ ) {
                var day = document.createElement('span');

                var current_date = new Date( start_date.getTime() + (one_day * i) );
                // console.log(current_date);

                // get the pixel color code
                var pixel = getPixel(imagedata, x, y);
                if(pixel.r === 0 && pixel.g === 0 && pixel.b === 0 && pixel.a === 0){
                    // transparent pixel
                    pixel = null;
                }else{
                    day.className = 'dot';
                    datesToDraw.push(moment(current_date));
                }

                week.appendChild(day);
                i++;
            }

            contribution.appendChild(week);
        }
    })();
};

var fileChangeHandler = function(e){
    e.stopPropagation();
    e.preventDefault();


    var files;
    if(typeof e.target.files === 'undefined'){
        files = e.dataTransfer.files;
    }else{
        files = e.target.files;
    }

    for (var i = 0, f; f = files[i]; i++) {  //eslint-disable-line no-cond-assign
        if(!f.type.match('image.*')){
            continue;
        }

        var reader = new FileReader();

        reader.onload = (function(){  //eslint-disable-line no-loop-func
            return function(evt){  //eslint-disable-line no-loop-func
                var data = evt.target.result;

                var img = document.getElementById('import-image');
                img.src = data;
                render_preview();
            };
        })(f);

        reader.readAsDataURL(f);
        // debugger;

    }

};

window.onload = function() {
    var input = document.getElementById('import-file');
    input.addEventListener('change', fileChangeHandler);  //eslint-disable-line no-use-before-define

    var importForm = document.getElementById('import-form');
    importForm.addEventListener('dragover', handleDragOver, false);
    importForm.addEventListener('drop', fileChangeHandler, false);  //eslint-disable-line no-use-before-define
    importForm.addEventListener('click', function(){
        input.click();
    });

    render_preview();

    var downloadButton = document.getElementById('download-button');
    downloadButton.addEventListener('click', downloadshell);
};
