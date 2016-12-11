var express = require('express');
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

/* GET home page. */
router.get('/', function(req, res, next) {

  // 이미지를 저장할 때
  // 1. db에 저장
  //gridFs.imgProcess('http://cfile25.uf.tistory.com/image/244B354651DF67ED33F603', 'final2.jpg', gfs);
  //res.send('TEST');

  //2. db에 있는 것을 불러온다.

  gridFs.ReturnImageSource('final2.jpg', gfs, function (img) {
    res.render('index', {title: 'gridFs', img: img})
  });

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
  var materals = req.body.materials;

  var mAry = materals.split(',');


  customMongoose.uploadRecipe('tjdudwlsdl', recipeName, recipe, mAry, imageURL, gfs, function (id) {

    res.redirect('/recipe/'+id);
    //res.render('detailrecipe', {});
    //res.send('well done id: ' +id);
  })
});

//이미지 소스 변환 필요
//
//
//
//
router.get('/recipe/:id', function (req, res, next) {
  //res.send('this is '+req.params.id);
  var recipeId = req.params.id;
  console.log('param id: '+recipeId);

  var doc = customMongoose.findDocByID(recipeId, function (recipeDoc) {
    /*res.render('detailrecipe', {recipeName: recipe.recipeName, id: recipe.userId, date: recipe.date,
     url: recipe.image, recommend: recipe.recommend, material: recipe.material,
     recipe: recipe.recipe, comment: recipe.comment});*/
    gridFs.ReturnImageSource(recipeDoc.id, gfs, function (img) {
      var str = recipeDoc.recipe.split('\r\n');

      res.render('detailrecipe', {doc: recipeDoc, img: img, recipeStr:str});
    })
  });
});

//리콰이어 보낸 레시피에 댓글 추가하기
router.post('/comment', function (req, res, next) {


  var recipeId = req.body.recipeId;

  //var writerId = req.session.userId
  var writerId = 'tjdudwlsdl';

  var content = req.body.content;

  customMongoose.addComment(recipeId, writerId, content, function () {
    res.redirect('/recipe/'+recipeId);
  })

});

//해당 댓글 삭제하기
router.post('/delete-comment/:id', function(req, res, next){

  var recipeId = req.params.id;
  console.log(recipeId);
  var commentId = req.body.deleteCommentId;
  console.log(commentId);
  //var currentId = req.session.userId;
  var currentId = 'tjdudwlsdl';

  customMongoose.delComment(currentId, commentId, function () {
    res.redirect('/recipe/'+recipeId);
  })
});


router.get('/board', function(){
  res.render('boardList',{});
});



router.get('/recipe-detail', function (req, res, next) {
  var name = '엄청맛있는거';
  var id = 'tjdudwlsdl';
  var date = 'now';
  var url = 'http://cfile9.uf.tistory.com/image/227A6E3553A823C724F802';
  var recommend = 77;
  var material = '이거랑, 저거랑, 이것도';
  var recipe = '이러저러하게 만들자';
  var commentID = 'tjdudwlsdl';
  var commentDate = 'now';
  var comment = '블라블라블라';

  res.render('detailrecipe', {recipeName: name, id: id, date: date, url: url,
    recommend: recommend, material: material, recipe: recipe, commentID: commentID,
    commentDate: commentDate, comment: comment});
});


module.exports = router;
