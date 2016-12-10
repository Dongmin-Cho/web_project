var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var fs = require('fs');

var Schema = mongoose.schema;

var conn = mongoose.connection;

mongoose.connect('mongodb://localhost:27017/data');

var Grid = require('gridfs-stream');

Grid.mongo = mongoose.mongo;

var gfs = Grid(conn.db);

var gridFs = require('./gridFs');
//router.use('/gridFs', gridFs);


conn.once('open', function () {

    //gridFs.WriteFile('D:/2016/web/untitled9/public/images/cattest.jpg', 'cat.jbg', gfs);

/*  console.log('gridfs open start');

//디비에 저장할 파일 이름 지정
  var writeStream = gfs.createWriteStream({
    filename: 'test.jpg'
  });
  console.log('writeStream done');

  //읽을 파일 불러오기 (실제 시스템에서는 url이나 param, req 등으로 넘어온 객체가 될 것)
  fs.createReadStream('D:/2016/web/untitled9/public/images/cattest.jpg').pipe(writeStream);
  console.log('createReadStream done');

  writeStream.on('close', function (file) {
    //do something with file
    console.log(file.filename+' written to DB');
  });*/


/*
  var fs_write_stream = fs.createWriteStream('testtest.jpg');

//read from mongodb
  var readStream = gfs.createReadStream({
    filename: 'test.jpg'
  });
  readStream.pipe(fs_write_stream);
  fs_write_stream.on('close', function () {
    console.log('file has been written fully!');
  });
*/
/*
  gfs.remove({
    filename: 'test.jpg'
  }, function (err) {
    if (err) return handleError(err);
    console.log('success');
  });
*/

});



//write content to file system




/* GET home page. */
router.get('/', function(req, res, next) {

  var img1;
  var img2;

  gridFs.ReturnImageSource('cat.jbg', gfs, function (img) {
    img1= img;
    gridFs.ReturnImageSource('cat.jbg', gfs, function (img) {
      img2=img;
      res.render('index', {title: 'GridFS', img1: img1, img2: img2});
    })

  });



/*
  gfs.files.find({filename: 'cat.jbg'}).toArray(function(err, files){
    if(err) console.log(err);
    console.log(files);
    if(files.length>0) {
      //var imgtype = 'image/jpeg';
      //res.set('Content-Type', imgtype);

      //var readStream = gfs.createReadStream({filename: 'cat.jbg'});
      //readStream.pipe(res);

      var readStream = gfs.createReadStream({filename: 'cat.jbg'});
      var bufs = [];

      readStream.on('data', function(chunk) {

        bufs.push(chunk);

      }).on('end', function() { // done

        var fbuf = Buffer.concat(bufs);

        var base64 = (fbuf.toString('base64'));

        res.render('index', { title: 'GridFs Test', img: base64 });
      });

    } else{
      res.json('File not found');
    }
  });
*/

});

module.exports = router;
