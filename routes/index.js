var express = require('express');
var session = require('express-session');
var router = express.Router();
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var fs = require('fs');
//var MemoryStream = require('memory-stream');
var multer = require('multer');
var request = require('request');

var Schema = mongoose.schema;

var conn = mongoose.connection;

mongoose.connect('mongodb://localhost:27017/data');

var Grid = require('gridfs-stream');

Grid.mongo = mongoose.mongo;

var gfs = Grid(conn.db);

var gridFs = require('./gridFs');
var customMongoose = require('./mongoose');

//router.use('/gridFs', gridFs);

var upload = multer({des: "./uploads"});
conn.once('open', function () {

  //customMongoose.signUpUser('tjdudwlsdl', '1234');

});




//url로부터 이미지를 다운로드한 뒤 디비에 넣고 다시 로컬파일 삭제
var imgProcess = function(url, filename, callback){
  gridFs.downloadImageFromUrl(url, filename, function () {
    gridFs.WriteFile("./"+filename, filename, gfs, function () {
      console.log('unlink start');
      fs.unlink(filename, function (err) {
        if(err) console.log(err);
        console.log('unlink done well');
      });
    });
  });
};


/* GET home page. */
router.get('/', function(req, res, next) {

  // 이미지를 저장할 때
  // 1. db에 저장
  //gridFs.imgProcess('http://cfile25.uf.tistory.com/image/244B354651DF67ED33F603', 'final2.jpg', gfs);
  //res.send('TEST');

  //2. db에 있는 것을 불러온다.

  gridFs.ReturnImageSource('final2.jpg', gfs, function (img) {
    res.render('index', {title: 'gridFs', img: img});
  });
});

/*get test*/
router.get('/test', function(req, res) {
    if (req.session.logined) { //has logined
        res.render('main', {
            userName: req.session.userId
        });
    } else {
        res.render('main', {
            userName: ''
        });
    }
});

router.post('/login', function(req, res) {

});

//레시피 입력 페이지
router.get('/recipe-insert', function(req, res, next){
  res.render('createrecipe', {userId: 'sample'});
});

//레시피 입력 페이지에서 서브밋 하면 여기로 온다
router.post('/recipe-inserted', function(req, res, next){
  var userId = req.body.userId;
  var recipeName = req.body.recipeName;
  var recipe = req.body.recipe;
  var imageURL = req.body.image;



  customMongoose.uploadRecipe('tjdudwlsdl', recipeName, recipe, imageURL, gfs, function (id) {
    res.send('Test is ok :'+id+ ' is inserted');
  })



});



module.exports = router;
