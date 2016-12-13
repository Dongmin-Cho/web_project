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

var upload = multer({
    des: "./uploads"
});
/*
 conn.once('open', function() {


 //customMongoose.signUpTest('tjdudwlsdl', '1234');
 });
 */
/* GET home page. */
router.get('/', function(req, res) {
    var userName;

    if (req.session.logined) { //has logined
        userName = req.session.userId;
    } else {
        userName = "";
    }

    customMongoose.findALL(function(recipe) {
        console.log("1st recipe: " + recipe[0].id);
        gridFs.ReturnImageSource(recipe[0].id, gfs, function(img1) {
            gridFs.ReturnImageSource(recipe[1].id, gfs, function(img2) {
                gridFs.ReturnImageSource(recipe[2].id, gfs, function(img3) {
                    res.render('main', {
                        userName: userName,
                        top1: recipe[0],
                        top2: recipe[1],
                        top3: recipe[2],
                        img1: img1,
                        img2: img2,
                        img3: img3
                    });
                });
            });
        });
    });
});

router.get('/search',function(req,res){
  var userName;
  if(req.session.logined){
    userName = req.session.userId;
  }else {
    userName = "";
  }
  if(req.param('searchQuery') !==''){
    console.log(req.param('searchQuery'));
    customMongoose.searchRecipes(req.param('searchQuery'),function(output){
      res.render('list',{userName:userName, recipes:output});
    });
  }
  else {
    res.redirect('/');
  }
});
//레시피 입력 페이지에서 서브밋 하면 여기로 온다
//재료 입력 추가
router.post('/recipe-inserted', function(req, res, next){
    var userId = req.body.userId;
    var recipeName = req.body.recipeName;
    var recipe = req.body.recipe;
    var imageURL = req.body.image;
    var materals = req.body.materials;
    var mAry = materals.split(',');

    console.log('material array: '+mAry);
    console.log('userId: '+userId);
    console.log('session Id: '+req.session.userId);

    customMongoose.uploadRecipe(req.session.userId, recipeName, recipe, mAry, imageURL, gfs, function (id) {
        console.log('uploadRecipe check');
        res.redirect('/recipe/'+id);
        //res.render('detailrecipe', {});
        //res.send('well done id: ' +id);
    });
});



//레시피 입력 페이지
router.get('/recipe-insert', function(req, res, next){
    var userName;
    if (req.session.logined) { //has logined
        userName = req.session.userId;
    } else {
        userName = "";
    }

    res.render('createrecipe', {userName: userName});
});

router.post('/delete-recipe/:id', function (req, res) {
  var recipeId = req.params.id;
  var userId = req.body.userId;
  console.log(recipeId);
  customMongoose.deleteRecipe(userId,recipeId,function(){
    res.redirect('/');
  });
});

//이미지 소스 변환 필요
router.get('/recipe/:id', function (req, res, next) {
    //res.send('this is '+req.params.id);
    var recipeId = req.params.id;
    console.log('param id: '+recipeId);
    var userName;
    if (req.session.logined) { //has logined
        userName = req.session.userId;
    } else {
        userName = "";
    }

    var doc = customMongoose.findDocByID(recipeId, function(recipeDoc) {
        /*res.render('detailrecipe', {recipeName: recipe.recipeName, id: recipe.userId, date: recipe.date,
         url: recipe.image, recommend: recipe.recommend, material: recipe.material,
         recipe: recipe.recipe, comment: recipe.comment});*/
        console.log('findbyid check: '+recipeDoc.id);
        gridFs.ReturnImageSource(recipeDoc.id, gfs, function(img) {
            var str = recipeDoc.recipe.split('\r\n');
            console.log('split test '+str[0]);
            console.log('split test '+str[1]);
            res.render('detailrecipe', {userName:userName, doc: recipeDoc, img: img, recipeStr:str});
        });
    });
});


//리콰이어 보낸 레시피에 댓글 추가하기
router.post('/comment', function(req, res, next) {

    var recipeId = req.body.recipeId;
    if (req.session.logined === true) {
        var writerId = req.session.userId;
        var content = req.body.content;

        customMongoose.addComment(recipeId, writerId, content, function() {
            res.redirect('/recipe/' + recipeId);
        });
    }else {
        res.render('login',{message:'로그인이 필요합니다.'});
    }
});


//해당 댓글 삭제하기
//구현은 페이지에서
router.post('/delete-comment/:id', function(req, res, next){

    var recipeId = req.params.id;
    console.log(recipeId);
    var commentId = req.body.deleteCommentId;
    console.log(commentId);

    var currentId = req.session.userId;

    customMongoose.delComment(currentId, commentId, function () {
        res.redirect('/recipe/'+recipeId);
    });
});

//추천추천!
router.post('/recommend', function(req, res, next) {
    var recipeId = req.body.recipeId;

    customMongoose.addRecommend(req.body.id, recipeId, function(recipe) {
        var isthere = recipe.recommendList.find(function(doc) {
            return doc=== req.body.id;
        });

        if (isthere !== undefined) {
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end('FAILED');
        } else {
            var num = recipe.recommend;
            recipe.recommend += 1;
            recipe.recommendList.push(req.body.id);
            recipe.save(function(err){
                console.log(err);
            });
            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            res.end(""+recipe.recommend);
        }
    });

});


router.post('/checkDUP', function(req, res) {
    var id = req.body.id;
    customMongoose.checkDuplicatedID(id, function(users) {
        res.writeHead(200, {
            'Content-Type': 'text/plain'
        });
        if (users.length > 0) {
            res.end('DUP');
        } else {
            res.end('VALID');
        }
    });
});

router.get('/signUp', function(req, res) {
    res.render('join', {
        userName: ''
    });
});
router.post('/signUp', function(req, res) {
    var id = req.body.id;
    var pw = req.body.password;
    var materials = req.body.materials;
    /*re valied check*/
    if (/\W/.test(id) || id.length > 12 || id.length < 4) {
        res.send('invalid id');
    } else if (!/\W/.test(pw) || !/\w/.test(pw) || pw.length > 20 || pw.length < 6) {
        res.send('invalid password');
    } else {
        customMongoose.signUpUser(id, pw, materials, function(err) {
            if (err) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end('ERROR');
            } else {
                console.log('new user registered');
                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.end('SUCCESS');
            }
        });
    }
});
/*log in by jodongmin*/
router.post('/login', function(req, res) {
    var id = req.body.id;
    var pw = req.body.password;
    customMongoose.login(id, pw, function(user) {
        if (user.length > 0) {
            /*login success, set session*/
            req.session.regenerate(function() {
                req.session.logined = true;
                req.session.userId = user[0].userId;
                res.redirect('/');
            });
        } else {
            res.render('login',{message :'ID 또는 비밀번호를 다시 확인하세요.<br>'+
            '등록되지 않은 아이디이거나,<br>'+
            'ID 또는 비밀번호를 잘못 입력하셨습니다.'});
        }
    });
});

/*log out by jodongmin*/
router.post('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) console.error('err', err);
        res.redirect('/');
    });
});


router.post('/modify-recipe', function (req, res, next) {
    var recipeId = req.body.delRecipeId;

    customMongoose.findDocByID(recipeId, function(doc){
        if(doc.userId==req.session.userId || req.session.userId=='admin') {
            var str = doc.recipe.split('\r\n');
            console.log('modify str: '+str[0]);
            res.render('modify_recipe', {doc: doc, userName: req.session.userId, recipe: str});
        }
        else
            res.redirect('/');
    });
});

router.post('/recipe-modified', function (req, res, next) {

    //var userId = req.body.userId;
    var recipeId = req.body.modified_id;
    var recipeName = req.body.recipeName;
    var recipe = req.body.recipe;
    var imageURL = req.body.image;
    var materals = req.body.materials;
    var mAry = materals.split(',');

    console.log('material array: '+mAry);
    //console.log('userId: '+userId);
    console.log('session Id: '+req.session.userId);

    var str = recipe.split('\r\n');

    console.log('modify str: '+str[0]);

    customMongoose.updateRecipe(recipeId, recipeName, str, mAry, imageURL, gfs, function (id) {
        console.log('uploadRecipe check');
        res.redirect('/recipe/'+id);
        //res.render('detailrecipe', {});
        //res.send('well done id: ' +id);
    });

});

module.exports = router;
