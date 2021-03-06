var express = require('express');
var fs = require('fs');
var ejs = require('ejs');
var urlencode = require('urlencode');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var mongoose = require('mongoose');
var conn = mongoose.connection;
var User = require('../models/user');
var Order_count = require('../models/order_count')
var Order_data = require('../models/order_data')
var user = require('../models/user')
var Qna = require('../models/qna');
var Item_data = require('../models/item_data');
var winston = require('winston');
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      timestamp: function(){return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')}
    })
  ]
});
var router = express.Router();
// middleware that is specific to this router
router.use(cookieParser());
router.use(session({
    key: 'sid', // 세션키
    secret: 'secret', // 비밀키
    cookie: {
        maxAge: 1000 * 60 * 60 // 쿠키 유효기간 1시간
    },
    resave: false,
    saveUninitialized: true
}));
//router.use(function timeLog(req, res, next) {});
// define the home page route
router.get('/admin.html', function (req, res) { // 웹서버 기본주소로 접속 할 경우 실행 . ( 현재 설정은 localhost 에 3303 port 사용 : 127.0.0.1:3303 )
  console.log(req.session);
  if (req.session.username != "admin") {
      res.redirect("/")
  }else{
    fs.readFile('admin.html', function (error, data) { // index.html 파일 로드 .
        if (error) {
            logger.log("info", error);
        } else {
            res.writeHead(200, {'Content-Type': 'text/html'}); // Head Type 설정 .
            res.end(data); // 로드 html response .
        }
    });
  }
});
router.get('/index', function (req, res) {
    fs.readFile('./Cafe/index.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
            if (req.session.username) {
                var user = req.session.username
            }
            res.end(ejs.render(data, {data: user}))
        }
    })
});
router.get('/introduce.html', function (req, res) {
  if (req.session.username == 'admin') {
    return res.redirect("/cafe/admin.html")
  }
    fs.readFile('./Cafe/introduce.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("err",err);
        } else {
            if (req.session.username) {
                var user = req.session.username
            }
            res.end(ejs.render(data, {data: user}))
        }
    })
});
router.get('/main.html/:redirect_url?', function (req, res) {
    fs.readFile('./Cafe/main.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
            if (req.session.username) {
                var user = req.session.username

            }
            res.end(ejs.render(data, {data: user, redirect: req.params.redirect_url}))
        }
    })
});
router.get('/menu_page.html', function (req, res) {
    fs.readFile('./Cafe/menu_page.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
            if (req.session.username) {
                var user = req.session.username

            }
            res.end(ejs.render(data, {data: user}))
        }
    })
});
router.get('/order_page.html', function (req, res) { //회원 주문확인
    fs.readFile('./Cafe/order_page.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
            var user = req.session.username
            if (user) {
                User.findOne({username: user}, function (err, doc) {
                    doc.password = ""
                    doc._id = ""
                    res.end(ejs.render(data, {data: null, userdata: doc}))
                })
            }
        }
    })
});
router.post('/order_page.html', function (req, res) { //비회원 주문확인
    fs.readFile('./Cafe/order_page.html', 'utf8', function (err, data) {
        res.end(ejs.render(data, {data: req.body.password, userdata: null}))
    })
});
router.post('/order_check.html', function (req, res) {
    fs.readFile('./Cafe/order_check.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
            res.end(ejs.render(data, {userdata: req.body.userdata, orderdata: req.body.orderdata, pw: req.body.pw}))
        }
    })
});
router.get('/order_fin.html/:id?', function (req, res) {
    fs.readFile('./Cafe/order_fin.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
          if (req.params.id) {
            res.end(ejs.render(data, {userdata: req.body.userdata, orderdata: req.body.orderdata, id:req.params.id}))
          }else{
            res.end(ejs.render(data, {userdata: req.body.userdata, orderdata: req.body.orderdata, id:null}))
          }
        }
    })
});
router.get('/order_check/:page?', function (req, res) { //주문내역 확인
    fs.readFile('./Cafe/order_check_list.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
          if (req.params.page) {
              var page_num = req.params.page;
          } else {
              var page_num = 1;
          }
            Order_data.paginate({order_id: req.session.username}, {page: page_num, limit: 5,sort:{order_date:-1}}, function (err, docs) {
              res.end(ejs.render(data, {data: docs}))
            })
        }
    })
});
router.get('/order_check_in/:id?', function (req, res) { //주문내역 확인
    fs.readFile('./Cafe/order_check_in.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
            Order_data.findOne({order_id: req.session.username}, function (err, doc) {
              res.end(ejs.render(data, {userdata: doc.user_index, orderdata: doc.order_item_index, price: doc.order_total_price}))
            })
        }
    })
});
router.get('/sign_up.html', function (req, res) {
    fs.readFile('./Cafe/sign_up.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
            res.end(ejs.render(data))
        }
    })
});

router.get('/user_modify.html', function (req, res) {
    fs.readFile('./Cafe/user_modify.html', 'utf8', function (err, data) {

        User.find({username:req.session.username}).exec(function (err, documents) {

            return res.end(ejs.render(data,{data: documents}));

        })
})
});
router.get('/QnA.html/:page?', function (req, res) {
    fs.readFile('./Cafe/QnA.html', 'utf8', function (err, data) {
        try {
            if (req.params.page) {
                var page_num = req.params.page;
            } else {
                var page_num = 1;
            }
            Qna.paginate({}, {page: page_num, limit: 5,sort:{created_at:-1}}, function (err, documents) {
                var seen_button = new Array()
                for (var i = 0; i < documents.docs.length; i++) {
                    var saved_user = documents.docs[i].username;
                    var logged_in_user = req.session.username
                    var not_logged_in = saved_user == "nonuser" && !logged_in_user;
                    var logged_inNits_my_article = logged_in_user == saved_user && logged_in_user != "nonuser";
                    var isAdmin = logged_in_user == "admin"
                    seen_button.push(not_logged_in || logged_inNits_my_article || isAdmin)
                }
                return res.end(ejs.render(data, {data: documents, seen_button: seen_button}))
            })
        } catch (err) {
            logger.log("error",err);
        }
    })
});

//Qna CRUD 라우팅
router.get('/QnA_cu/:id?/:redirect_url?', function (req, res) {
    fs.readFile('./Cafe/QnA_cu.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
            var user = req.session.username
            if (req.params.id && !req.params.redirect_url) {
                //수정하기
                Qna.find({_id: req.params.id}, function (err, documents) {
                    var saved_user = documents[0].username;
                    var logged_in_user = req.session.username
                    var not_logged_in = saved_user == "nonuser" && !logged_in_user;
                    var logged_inNits_my_article = logged_in_user == saved_user && logged_in_user != "nonuser";
                    var isAdmin = logged_in_user == "admin"
                    if (not_logged_in || logged_inNits_my_article || isAdmin) {
                        return res.end(ejs.render(data, {data: documents[0], user: req.session.username}))
                    } else {
                        return res.end("수정 권한이 없습니다") //warning
                    }
                })
            } else if (req.params.id && req.params.redirect_url) {
                //삭제 비밀번호 받기
                res.end(ejs.render(data, {data: [unescape(req.params.redirect_url), req.params.id], user: req.session.username, content:urlencode.decode(req.query.content)}))
            } else {
                //글쓰기
                res.end(ejs.render(data, {data: {}, user: req.session.username}))
            }
        }
    })
});
router.post('/QnA_write/:id?/:isAns?', function (req, res) {
    try {
        if (req.params.id) { //수정하기
            Qna.findOne({_id: req.params.id}, function (err, doc) {
                if (doc.username != "nonuser" && req.session.username == doc.username && req.params.isAns != "1") {
                    //회원 수정하기
                    if (req.body.title != "" && req.body.content != "") {
                      doc.title = req.body.title;
                      doc.content = req.body.content;
                      doc.save();
                    }
                    logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
                    logger.log("info",req.session.username+"회원 수정하기")
                    res.redirect("/cafe/QnA.html")
                } else if (((req.body.password == doc.password && !req.session.username) || req.session.username == doc.username || req.session.username == "admin" )&& req.params.isAns == "1") {
                    // 회원, 관리자 댓글 달기
                    if (req.body.answer != "") {
                      doc.answer.push({username:req.session.username, content:req.body.answer});
                      logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
                      logger.log("info",req.session.username+"회원 댓글")
                      doc.save();
                    }
                    res.redirect("/cafe/QnA_in/"+req.params.id)
                } else if (!req.session.username && req.params.isAns == "1") {
                    //비회원 댓글 달기
                    if (req.body.answer != "") {
                      res.redirect("/cafe/QnA_cu/"+req.params.id + "/" + escape("/QnA_write/"+req.params.id+"/1")+"?content="+urlencode(req.body.answer))
                    }else{
                      res.redirect("/cafe/QnA_in/"+req.params.id)
                    }
                } else if (!req.session.username && req.body.password == doc.password && doc.password != "") {
                    //비회원 비밀번호 받았을때 수정하기
                    doc.title = req.body.title;
                    doc.content = req.body.content;
                    doc.save();
                    logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
                    logger.log("info",req.session.username+"비회원 수정")
                    res.redirect("/cafe/QnA.html")
                } else {
                    //비회원 비밀번호 틀렸을 때
                    res.end("본인이 쓴 글이 아니거나 비밀번호가 틀렸습니다.") //warning
                }
            });
        } else {             //글쓰기
          console.log(req.body.username != 'nonuser', !!req.body.password, req.body.username != 'nonuser' || !!req.body.password);
          if (req.body.title != "" && req.body.content != "" && (req.body.username != 'nonuser' || !!req.body.password)) {
            conn.collection('Qna').insert({
                username: req.body.username,
                password: req.body.password,
                title: req.body.title,
                content: req.body.content,
                created_at: new Date(),
                answer: []
            });
          }
          res.redirect("/cafe/QnA.html")
        }
    } catch (e) {
        logger.log("error",e);
        res.end(e)
    }
});
router.get('/QnA_d/:id/:ansArrayNumb?', function (req, res) {
    var user = req.session.username;
    try {
        Qna.findOne({_id: req.params.id}, function (err, doc) {
            var saved_user = doc.username;
            var logged_in_user = req.session.username
            var not_logged_in = saved_user == "nonuser" && !logged_in_user && req.query.password == doc.password;
            var logged_inNits_my_article = logged_in_user == saved_user && logged_in_user != "nonuser";
            var isAdmin = logged_in_user == "admin"
            if ((logged_inNits_my_article || not_logged_in  || isAdmin )&& !req.params.ansArrayNumb) {
                //회원, 비회원 삭제하기
                Qna.find({_id: req.params.id}).remove().exec();
                logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
                logger.log("info","Qna "+req.params.id+" del success")
                res.redirect("/cafe/QnA.html")
            } else if (doc.username == "nonuser" && !req.query.password) {
                //비회원 비밀번호 받으러 가기
                if (!req.params.ansArrayNumb) {
                  req.params.ansArrayNumb = ""
                }
                res.redirect("/cafe/QnA_cu/" + req.params.id +"/"+ escape("/QnA_d/" + req.params.id + "/" + req.params.ansArrayNumb))
            } else if ((logged_inNits_my_article || not_logged_in  || isAdmin ) && req.params.ansArrayNumb) {
                //댓글 삭제
                doc.answer.splice(req.params.ansArrayNumb, 1);
                doc.save()
                logger.log("-----")
                logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
                logger.log("info","Qna "+req.params.id+": reply del success\n")
                res.redirect("/cafe/QnA_in/"+req.params.id)
            } else {
                return res.end("글쓴이와 로그인 정보가 다릅니다") //warning
            }
        })
    } catch (e) {
        logger.log("error",e);
        res.end(e)
    }
});
//qna 내용 보여주기
router.get('/QnA_in/:id?', function (req, res) {
    fs.readFile('./Cafe/QnA_in.html', 'utf8', function (err, data) {
        Qna.find({_id: req.params.id}, function (err, doc) {
          var saved_user = doc[0].username;
          var logged_in_user = req.session.username
          var not_logged_in = saved_user == "nonuser" && !logged_in_user;
          var logged_inNits_my_article = logged_in_user == saved_user && logged_in_user != "nonuser";
          var isAdmin = logged_in_user == "admin"
          seen_button = not_logged_in || logged_inNits_my_article || isAdmin
            return res.end(ejs.render(data,{doc:doc[0], seen_button: seen_button, isAdmin: isAdmin}))
        })
    })
});
//회원 주문
router.post('/user_order', function (req, res) {
    if (req.session.username && req.body.orderdata) {
        var item = req.body.orderdata;
        var total_price = 0;
        var count;

        Order_count.find({}).lean().exec(function (err, doc) {
            if (doc[0]) {
              count = doc[0].order_count;
            }else{
              conn.collection('order_count').insert({order_count:0})
              count = 0;
            }
            conn.collection('order_count').update({value: count},
                {value: count + 1});

            var county = 0;
            for (var i = 0; i < item.length; i++) {
                //보안 관련하여 db의 실제 제품가격으로 참조함
                Item_data.find({item_name: req.body.orderdata[i].item_name}).lean().exec(function (err, doc) {
                    total_price = Number(total_price) + Number(doc[0].item_price);
                    insert();
                })
            }
            function insert() {

                county++;
                if (county == item.length) {
                    //쿠폰 증가
                    user.findOne({username: req.session.username}).exec(function (err, doc) {
                        doc.coupon += item.length;
                        doc.save();
                    })
                    var goitem = new Array()
                    for (i = 0; i < item.length; i++) {
                        goitem.push({name: item[i].item_name, option: item[i].option})
                    }

                    conn.collection('order_data').insert({
                        order_count: count,
                        order_count_today: 0,
                        order_date: Date.now(),
                        order_total_price: total_price,
                        order_state: "ready", //ready or done
                        order_id: req.session.username,
                        order_count: count,
                        order_item_index: goitem,
                        user_index: req.body.userdata
                    })
                }
            }
        });
    }
    res.end()
});
;
//비회원 주문

router.post('/nonuser_order', function (req, res) {
  nonuser_signup();
  function nonuser_signup() {
      User.find({}, function (err, documents) {
        username = "" + documents.length + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10)
          var testUser = new User({
              username: username,
              password: req.body.pw,
              address: "not saved",
              realname: "not saved"
          });
          function atfunctionend(){
            testUser.save(function (err) {
                if (err) {
                  logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
                    logger.log("info",testUser.username + "sign up failed");
                    logger.log("error",err);
                    if (err.code == 11000) return res.end('{"err":"' + testUser.username + '은 이미 사용중입니다"}')
                    return res.end(JSON.stringify(err))
                }else{
                  logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
                    logger.log("info",req.body + "sign_up success\n");
                    return res.end('{"err":"id값이 ' + testUser.username + '로 비회원 가입되었습니다!"}')
                }
            })
            return insert_order(username);
          }
          // save user to database
          return atfunctionend()
      })
  }

  function insert_order(username) {
      var item = req.body.orderdata;
      var total_price = 0;
      var count;
      Order_count.find({}).lean().exec(function (err, doc) {
          if (doc[0]) {
            count = doc[0].order_count;
          }else{
            conn.collection('order_count').insert({order_count:0})
            count = 0;
          }
          if (item) {
            for (i = 0; i < item.length; i++) {
              total_price = Number(total_price) + Number(item[i].item_price);
            }
            var goitem = new Array();
            for (i = 0; i < item.length; i++) {
              goitem.push({name: item[i].item_name, option: item[i].option})
            }
          }else {
            res.end()
          }
          conn.collection('order_data').insert({
              order_count: count,
              order_count_today: 0,
              order_date: Date.now(),
              order_total_price: total_price,
              order_state: "ready", //ready or done
              order_id: username,
              order_count: count,
              order_item_index: goitem,
              user_index: req.body.userdata
          });

          conn.collection('order_count').update({value: count},
              {value: count + 1});

          res.end(username)
      });
  }
});

// 최근 주문
router.get('/recent_order', function (req, res) {
    if (req.session.username) {
        Order_data.find({order_id: req.session.username}).lean().exec(function (err, documents) {
            var goitem = new Array();
            if (documents.length >= 3) {
                for (i = 0; i < 3; i++) {
                    goitem.push(documents[i].order_item_index)
                }
            } else {
                for (i = 0; i < documents.length; i++) {
                    goitem.push(documents[i].order_item_index)
                }
            }
            return res.end(JSON.stringify(goitem));

        });
    }

    else
        res.end();
});
//쿠폰 정보
router.get('/get_coupon_data',function(req,res){
  if (req.session.username) {
    User.findOne({username:req.session.username},function(err,doc){
      res.end(""+doc.coupon)
    })
  }else {
    res.end("0")
  }
})

//쿠폰 적립 큐알코드
router.get('/coupon_in.html',function(req,res){
    fs.readFile('./Cafe/coupon_in.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
            var user = req.session.username;
            res.end(ejs.render(data,{user:user}));
            }
        })
});
//쿠폰 사용 큐알코드
router.get('/coupon_out.html',function(req,res){
     fs.readFile('./Cafe/coupon_out.html', 'utf8', function (err, data) {
        if (err) {
            logger.log("error",err);
        } else {
                var user = req.session.username;
               res.end(ejs.render(data,{user:user}));
        }
    })

});
//User 로그인
// create a user a new user
router.post("/login", function (req, res) {
    logger.log("info","login attempt");
    // attempt to authenticate user
    User.getAuthenticated(req.body.username, req.body.password, function (err, user, reason) {
        if (err) return res.end(JSON.stringify(err))
        // login was successful if we have a user
        if (user) {
            // handle login success
            logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
            logger.log("info",user.username + 'login success');
            req.session.username = req.body.username
            return res.end(JSON.stringify(user));
        }
        // otherwise we can determine why we failed
        var reasons = User.failedLogin;
        switch (reason) {
            case reasons.NOT_FOUND:
                return res.end('{"err":"아이디가 없습니다"}')
                break;
            case reasons.PASSWORD_INCORRECT:
                return res.end('{"err":"비밀번호가 틀립니다"}')
                break;
            case reasons.MAX_ATTEMPTS:
                return res.end('{"err":"로그인 요청 횟수를 초과하였습니다."}')
                break;
        }
    });
});
router.get("/logout", function (req, res) {
    logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
    logger.log("info",req.session.username + " is logged out");
    req.session.destroy();  // 세션 삭제
    res.clearCookie('sid'); // 세션 쿠키 삭제
    return res.end()
})
//User 회원가입
router.post("/sign_up", function (req, res) {
    logger.log("info","sign_up attempt");
    var testUser = new User({
        username: req.body.username,
        password: req.body.password,
        realname: req.body.realname,
        address: req.body.address
    });
    // save user to database 회원가입 부분 최초저장부분
    return testUser.save(function (err) {
        if (err) {
          logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
            logger.log("info",req.body.username + "sign_up failed"+err);
            if (err.code == 11000) return res.end('{"msg":"' + testUser.username + '은 이미 사용중입니다"}')
            return res.end(JSON.stringify(err))
        } else {
          logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
            logger.log("info",req.body + "sign_up success");
            return res.end('{"msg":"' + testUser.username + ' 가입완료"}')
        }
    })
})
router.post("/nonusersign_up", function (req, res) {
    //NONUser 회원가입
    User.find({}, function (err, documents) {
        global.username = "" + documents.length + Math.floor(Math.random() * 10) + Math.floor(Math.random() * 10)
        var testUser = new User({
            username: global.username,
            password: req.body.password
        });
        // save user to database
        return testUser.save(function (err) {
            if (err) {
              logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
                logger.log("info",req.body.username + "sign_up failed"+err);
                if (err.code == 11000) return res.end('{"err":"' + testUser.username + '은 이미 사용중입니다"}')
                return res.end(JSON.stringify(err))
            } else {
              logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
                logger.log("info",req.body + "sign_up success");
                return res.end('{"err":"id값이 ' + testUser.username + '로 비회원 가입되었습니다!"}')
            }
        })
    })
})
//회원 탈퇴
router.post("/sign_out", function (req, res) {

    logger.log("info",req.session.username + " sign out attempt");
    User.find({username: req.session.username}).exec(function (err, documents) {

        req.session.destroy();  // 세션 삭제
        res.clearCookie('sid'); // 세션 쿠키 삭제
        logger.log("info",req.session.username + " sign out success");
        logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
        documents[0].remove();
        return res.redirect("/cafe/main.html/")
    });
})


//회원 수정
router.post("/user_modify", function (req, res) {

    logger.log("info","user_modify attempt" + req.session.username);
    User.findOne(
            {username: req.session.username},function(err, doc){
              //doc.username= req.session.username
              doc.password= req.body.password
              doc.realname= req.body.realname
              doc.address= req.body.address
              doc.save()
              logger.log("info","user_modify success" + req.session.username);
              logger.log("info",req.headers['x-real-ip'] || req.connection.remoteAddress)
              return res.end()
            })
    // save user to database 회원가입 부분 최초저장부분
})
module.exports = router;


function needtologin(res, req, redirect_url) {
    if (!req.session.username) {
        res.redirect("/cafe/main.html/" + redirect_url)
    }
}
function isAdmin(res, req, redirect_url) {
    if (req.session.username != "admin") {
        res.redirect("/cafe/main.html/" + redirect_url)
    }
}
function escape(str){
  return str.replace(/\//g,"%2F")
}
function unescape(str){
  return str.replace(/%2F/g,"/")
}
