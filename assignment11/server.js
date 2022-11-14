const express = require('express');
const app = express();
const fs = require('fs');
const hostname = 'localhost';
const port = 3000;
const bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
const multer = require('multer');
const path = require('path');
const { resolve } = require('path');
const { rejects } = require('assert');
const { json } = require('express');

app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, 'img/');
    },

    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  });

  const imageFilter = (req, file, cb) => {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};

//ทำให้สมบูรณ์
app.post('/profilepic', (req,res) => {
    let upload = multer({ storage: storage, fileFilter: imageFilter }).single('avatar');

    upload(req, res, (err) => {

        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        }
        else if (!req.file) {
            return res.send('Please select an image to upload');
        }
        else if (err instanceof multer.MulterError) {
            return res.send(err);
        }
        else if (err) {
            return res.send(err);
        }

        //res.send('You uploaded this image filename: '+ req.file.filename);
        updateImg(req.cookies.username, req.file.filename);
        res.cookie('img',req.file.filename);
        
        console.log("Upload already");
        return res.redirect('feed.html')
    });

  
 })

//ทำให้สมบูรณ์
// ถ้าต้องการจะลบ cookie ให้ใช้
// res.clearCookie('username');
app.get('/logout', (req,res) => {
    res.clearCookie('username');
    res.clearCookie('img');
    return res.redirect('index.html');
})

//ทำให้สมบูรณ์
app.get('/readPost', async (req,res) => {
    console.log("Read post");

    let readPost = await readJson('js/postDB.json');
    res.send(readPost);
})

//ทำให้สมบูรณ์
app.post('/writePost',async (req,res) => {
    console.log("Write post");
    
    let readPost = await readJson('js/postDB.json');
    let writePost = await writeJson(readPost, req.body, 'js/postDB.json');
    res.send(JSON.stringify(writePost));
})

//ทำให้สมบูรณ์
app.post('/checkLogin',async (req,res) => {
    // ถ้าเช็คแล้ว username และ password ถูกต้อง
    // return res.redirect('feed.html');
    // ถ้าเช็คแล้ว username และ password ไม่ถูกต้อง
    // return res.redirect('index.html?error=1')

    var readLogin = await readJson('js/userDB.json');
    console.log("read user");

    var dataRead = JSON.parse(readLogin);
    var dtReadKey = Object.keys(dataRead);

    console.log(dtReadKey.length);
    for(var i = 0; i < dtReadKey.length; i++){
        console.log(req.body.username+"="+ dataRead[dtReadKey[i]].username);
        if(req.body.username == dataRead[dtReadKey[i]].username && req.body.password == dataRead[dtReadKey[i]].password){
            console.log("correct");
            res.cookie('username', dataRead[dtReadKey[i]].username);
            res.cookie('img', dataRead[dtReadKey[i]].img)

            console.log(i);
            return res.redirect('feed.html');
        }
       
    }
    if(req.body.username == dataRead[dtReadKey[i]].username || req.body.password == dataRead[dtReadKey[i]].password){
        console.log("Wrong");

        return res.redirect('index.html?error=1');
    }
})

//ทำให้สมบูรณ์
const readJson = (file_name) => {
    console.log("read");

    return new Promise((resolve,rejects) => {
        fs.readFile(file_name, 'utf8', (err, data) => {
            if(err)
                rejects(err)
            else{
                resolve(data);
            }
        })
    })
}

//ทำให้สมบูรณ์
const writeJson = (data, newData, file_name) => {
    console.log("write");

    return new Promise((resolve, rejects) => {
        var postData = JSON.parse(data);
        var keyPostData = Object.keys(postData);
        var postNum = "post" + (keyPostData.length + 1).toString();

        var newPost = JSON.parse(newData);
        postData[postNum] = newPost;

        var nData = JSON.stringify(postData);   //ถ้าไม่ได้ JSON.stringify(JSON.parse(postdata))

        fs.writeFile(file_name, nData, (err) => {
          if (err)
            rejects(err);
          else
          {
            resolve(nData);
          }
        });
    
        resolve(JSON.stringify(nData, null, "\t"))
      })
}

//ทำให้สมบูรณ์
const updateImg = async (username, fileimg) => {
    console.log("update");

    var data = await readJson("js/userDB.json");

    return new Promise((resolve, rejects) => {
        var oData = JSON.parse(data);
        var odKey  = Object.keys(oData);

        for(var i = 0; i < odKey.length; i++){
            if(username  == oData[odKey[i]].username){       //check user ตรงมั้ย
                oData[odKey[i]].img = fileimg;

                fs.writeFile("js/userDB.json", dataNew, (err) => {
                    if(err)
                        rejects(err);
                    else{
                        resolve(dataNew);
                    }
                })
                break;
            }
        }

    })

}

 app.listen(port, hostname, () => {
        console.log(`Server running at   http://${hostname}:${port}/`);
});