/**
 * Created by Seo on 2016-12-08.
 */
/**
 * Modulized GridFs ...
 */
var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require('fs');

///////////////////////////////////////////////////////////////////
/////////////////////////////////////////////Insert file to database
//url : 저장할 파일의 위치 - 어디서 불러올 것인지 (string)
//filename : 저장할 파일의 이름(이 이름으로 저장됨)(string)
//gfs : mongoose connection 객체(index.js -> var gfs = Grid(conn.db);
exports.WriteFile = function (url, filename, gfs) {
    console.log('WriteFile Start');

    //디비에 저장할 파일 이름 지정
    var writeStream = gfs.createWriteStream({
        filename: filename
    });
    console.log('writeStream done');

    //읽을 파일 불러오기 (실제 시스템에서는 url이나 param, req 등으로 넘어온 객체가 될 것)
    fs.createReadStream(url).pipe(writeStream);
    console.log('createReadStream done');

    writeStream.on('close', function (file) {
        //do something with file
        console.log(file.filename+' written to DB');
    });
};


///////////////////////////////////////////////////////////////////
/////////////////////////////////////////////Read file from database
//현재 프로젝트의 루트에 파일이 생성됨
//filename: 저장될 파일의 이름(이 이름으로 저장된다.)
//inmongoname: db안에서 찾을 파일의 이름
//gfs: gfs 객체
exports.ReadFile = function (filename, inmongoname, gfs) {
    //write content to file system
    var fs_write_stream = fs.createWriteStream(filename);

    //read from mongodb
    var readStream = gfs.createReadStream({
        filename: inmongoname
    });
    readStream.pipe(fs_write_stream);
    fs_write_stream.on('close', function () {
        console.log('file has been written fully!');
    });
};


///////////////////////////////////////////////////////////////////
/////////////////////////////////////////////Delete file from database
//inmongoname: 지울 파일의 이름(db 안에 있는)
//gfs: gfs 객체
exports.DeleteFile = function(inmongoname, gfs){
    gfs.remove({
        filename: inmongoname
    }, function (err) {
        if (err) return handleError(err);
        console.log('success');
    });
};


///////////////////////////////////////////////////////////////////
/////////////////////////////////////////////Read file from database
//홈페이지에 이미지 렌더할 객체 생성
//gridfs를 이용할 경우 파일을 chunk로 나누어 저장하므로 이미지를 웹에
//바로 출력할 수 없다. 따라서 버퍼에 담아 이어붙인 후 RFC2397의
//데이터 URI 스킴을 이용한다.
//
//데이터 처리에 시간이 걸리므로 동기 처리가 필요하다
//filename: 로드할 파일 이름(쿼리를 _id와 같이 변경할 수도 있다)
//gfs: gfs 객체
//사용예:
/*gridFs.ReturnImageSource('cat.jbg', gfs, function (img) {
    var img64 = img;
    res.render('index', {title: 'GridFS', img: img64});
});*/

exports.ReturnImageSource = function (filename, gfs, callback) {
    //write content to file system
    gfs.files.find({filename: filename}).toArray(function(err, files) {
        if (err) console.log(err);
        console.log(files);
        if (files.length > 0) {
            var readStream = gfs.createReadStream({filename: filename});
            var bufs = [];
            readStream.on('data', function(chunk){
              bufs.push(chunk);
            }).on('end', function(){
                var fbuf = Buffer.concat(bufs);
                var base64 = (fbuf.toString('base64'));
                console.log('file string will be returned');
                //console.log(base64);

                callback(base64);
                return base64;
            })
        } else {
            console.log('file not found error');
        }
    })
};
