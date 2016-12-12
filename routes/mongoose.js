/**
 * Created by Seo on 2016-12-10.
 */
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var gridFs = require('./gridFs');

//사용자 스키마
var UserSchema = mongoose.Schema({
    userId : String,            //사용자 id
    password : String,          //비밀번호
    materials : [String],       //가지고 있는 재료
    uploaded : [String],        //올린 글 목록(글의 _id)
    uploadedRecipe : [String], //올린 레시피 목록
    recommended : [String],     //추천한 글 목록(레시피의 _id)
//    commented : [String],       //작성한 댓글 목록(댓글의 _id)
    signUpDate : {type: Date, default: Date.now}  //가입일
});
var Users = mongoose.model('Users', UserSchema);

var defaultImage; // 기본 이미지 아이디
//레시피 스키마
var RecipeSchema = mongoose.Schema({
    userId : String,             //작성자
    date : {type: Date, default: Date.now}, //작성일
    recipeName: String,         //요리 이름
    material : [String],        //재료
    recipe : String,            //조리법
    recommend : {type: Number, default: 0},         //추천수
    recommendList : [{type:String}],   //추천인 목록(중복 추천 방지에만 사용)
    comment : [{writerId: String,     //댓글(작성자 id, 댓글 내용, 작성일)
        content : String,
        writeDate : {type: Date, default: Date.now}}],
    image : {type: String, default: defaultImage} // 이미지의 파일 이름(레시피 이름으로 저장)
});
var Recipes = mongoose.model('Recipes', RecipeSchema);

////////////////////////////////////////////////////////////
/////////////////////////////////////////////////사용자 등록
//가입할 때 id를 비교하여 중복 id가 있을 경우 가입 시퀀스를 새로 시작해야 한다
//가입 시퀀스를 재시작할 때 기존 입력을 남겨두어야 하나? - id랑 비번만 받으니 딱히 필요 없을듯
//비밀번호 복잡도 파악하여 일정 이상의 복잡도를 가진 비번만 등록 가능하게 - api가 있는지 확인 필요
exports.signUpUser = function(id, pw, mat, callback) {
    var user = new Users({
        'userId': id,
        'password': pw,
        'materials':mat
    });
    user.save(function(err) {
      if(err){
        console.log("ERROR in save user's info");
      }
      else {
        console.log(id+pw+mat);
      callback(err);
      }
    });//end save
};
//check duplicated by jodongmin
exports.checkDuplicatedID = function(id,callback) {
    Users.find({'userId':id},function(err,users){
      if(err){
        console.log('ERROR in check duplicated');
      }else{
        callback(users);
      }
  });
};


////////////////////////////////////////////////////////////
/////////////////////////////////////////////////사용자 탈퇴
//사용자 정보 메뉴에서 탈퇴 메뉴를 보여준다.
//탈퇴 시도시 비번을 한번 더 물어본다
//
exports.leaveUser = function(id, pw, callback){
    Users.find({'userId':id, 'password':pw}).remove(callback());
};

/////////////////////////////////////////////////사용자 탈퇴
//login
//by jodongmin
exports.login = function(id,pw,callback){

  Users.find({
      'userId': id,
      'password': pw
  },function(err,user){
    if(err){
      console.log('ERROR in login');
    }else {
      callback(user);
    }
  });
};
////////////////////////////////////////////////////////////
/////////////////////////////////////////////////레시피 등록
//id : 작성자 id
//name : 레시피 이름
//recipe : 조리 방법
//image : url (일단)
//gfs : object
exports.uploadRecipe = function(id, name, recipe, materials, image, gfs, callback){

    //레시피 문서를 만든다
    //레시피 문서의 _id를 파일 이름으로 한 이미지를 저장한다
    //레시피 문서에 이미지의 _id를 추가한다
    //레시피 문서의 _id를 사용자 문서에 추가한다(작성한 레시피 항목)

    var recipeID;

    var material_array = materials;

    var count = material_array.length;

    console.log(material_array[0]);

    var newrecipe = new Recipes({
        'userId': id, 'recipeName': name, 'recipe': recipe, 'material': material_array});
    newrecipe.save(function (err, recipeObject) {
        if(err) console.log('recipe update error');
        console.log('recipe upload done');
        recipeID = recipeObject.id;
        console.log('recipeID: '+recipeID);
//'https://namu.moe/file/%ED%8C%8C%EC%9D%BC%3Aattachment/%EC%9D%BC%EB%B3%B8%20%EC%9A%94%EB%A6%AC/japanesefood.jpg'
        gridFs.imgProcess(image, recipeID, gfs, function () {
            console.log('img process done');
            Recipes.update({_id: recipeID}, {$set:{image: recipeID}}, function(){
                console.log('image name set done');
                console.log('image : '+recipeID);
                Users.update({userId: id}, {$push:{uploadedRecipe: recipeID}}, function () {
                    console.log('push recipe done');
                    console.log('recipe id: '+recipeID);
                    callback(recipeID);
                })
            })
        })
    });
};

////////////////////////////////////////////////////////////
//////////////////Recipes 컬렉션 문서의 objectid로 문서 객체 반환
exports.findDocByID = function (id, callback) {
    Recipes.findOne({_id: id}, function(err, doc){
        if(err) console.log(err);
        console.log('find doc process: '+doc.id);
        callback(doc);
        return doc;
    });
 };

////////////////////////////////////////////////////////////
/////////////////////////////////////////////////레시피 수정
//이미지 수정이 있는 경우만 분류가 가능한지, 아니면 수정 모듈을 하나 더 만들어야 하는지?
exports.updateRecipe = function(id, name, recipe, image){

};

////////////////////////////////////////////////////////////
/////////////////////////////////////////////////레시피 삭제
//삭제 권한 : 관리자 혹은 작성자 본인
//애초에 삭제 버튼을 관리자나 작성자에게만 보여주거나
//삭제시 체크하는 것이 필요
exports.deleteRecipe = function (userid, _id) {


};

////////////////////////////////////////////////////////////
///////////////////////////////////////////////////댓글 등록
//댓글 삭제 기능이 필요한가?
//recipeId: 댓글이 들어갈 레시피의 오브젝트 아이디
//writerId: 댓글 작성자의 아이디(세션으로 획득하자)
//content: 댓글 내용
//584d6731d5d267200c8a7477
exports.addComment = function(recipeId, writerId, content, callback){
    Recipes.update({_id: recipeId}, {$push: {comment: {writerId: writerId, content: content}}},
        function () {
            callback();
        });
};

////////////////////////////////////////////////////////////
///////////////////////////////////////////////////댓글 삭제
//어드민과 작성자만 삭제 가능하도록 하는 기능 추가 필요
//인덱스.제이에스나 여기나 아무데나 추가해도 괜찮을듯
exports.delComment = function (writerId, commentId, callback) {
    Recipes.update({"comment": { $elemMatch : {'_id': commentId}}},
        {$pull:{"comment": {'_id':commentId}}},function (err) {
            if(err) console.log(err);
            console.log('comment is deleted');
            callback();
        });
};

////////////////////////////////////////////////////////////
////////////////////////////////////////////////추천수 올리기
exports.addRecommend = function(userId, recipeId, callback){

    //레시피에 추천 아이디 목록을 만든다(스키마 추가)
    //추천하면 임베디드 도큐먼트에 아이디가 추가된다
    //추천할 때 임베디드 도큐먼트에 아이디가 있으면 추천할 수 없다(중복 추천 방지)
    //추천하면 사용자 스키마의 추천글 리스트에 해당 레시피 오브젝트 아이디를 추가해준다

    //Recipes.update({_id: recipeId, recommendList:{$ne:userId}}, {})
    Recipes.findOne({image: recipeId},function (err,recipe) {
      if(err){console.log('ERROR in recommend');}
      console.log(recipe);
        callback(recipe);
    });

};



////////////////////////////////////////////////////////////
///////////////////////////////////////////////////재료 세팅
//재료는 배열로 받는 것이 좋을듯
//따로 등록, 수정을 나누지 않고 radio 타입 input으로 받아서 매번 수정
exports.updateMaterial = function(id, materials){

};


////////////////////////////////////////////////////////////
//////////////////////////////////////////////게시판 글 등록
//사용자들이 이미지를 첨부하고 싶다면?
exports.postWriting = function(id, title, content){

};

////////////////////////////////////////////////////////////
/////////////////////////////////////////////게시판 글 삭제
//by jodongmin
exports.deleteWriting = function (userid, _id) {
    var doc = mongoose.RecipeSchema.find({'_id':ObjectID(_id)});
    if(doc.userId === userId){//글의 작성자와 삭제 요청자가 같은 경우 삭제,
        //관리자일 경우도 지울 수 있도록 추가하면 괜찮을 것 같음
        mongoose.RecipeSchema.find({'_id':ObjectID(_id)}).remove().exec();
        return true;
    }
    else {//글의 작성자와 삭제 요청자가 다른 경우
        return false;
    }
};

////////////////////////////////////////////////////////////
//////////////////////////////////////////////게시판 글 검색
//검색 분류를 여러 개 할 필요?
//작성자 id로 검색, 제목으로 검색, 내용으로 검색



////////////////////////////////////////////////////////////
/////////////////////////////////////////////////레시피 검색
//검색에 대한 구체적 구상이 필요



////////////////////////////////////////////////////////////
/////////////////////////////////////////////////
