var express = require('express');
var bodyParser = require('body-parser');
var router = express.Router();
var app = require('../app');
var pwd = require('pwd');
var knexConfig = require('../knexfile.js')
var knex = require('knex')(knexConfig);
var database = app.get('database');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : false}));
app.use(express.static('public'));

/* GET home page. */
router.get('/', function (req, res, next) {
  
  if (req.cookies.preferences) {
    res.render('results', { title: "I'm Bored!" })  
  } else {
    res.render('login', { title: "I'm Bored!" });
  };  
});

//Login 
router.post('/', function (req, res) {
  
  knex('authtable')
  .where({'username': req.body.username})
  .then(function(records) {
    var user = records[0];
    if (records.length === 0) {
      res.render('login', {
        title: 'Im Bored',
        user: null,
        error: 'No Such User'
      });
      
    } else {
      pwd.hash(req.body.password, user.salt, function(err,hash) {
        if (err) {
          console.log(err);
        }
        if (user.hash === hash) {
          
          //Get user ID from DB
          knex('authtable').where({'username': req.body.username}).select('userid')
          .then(function(results) {
            //Get user preferences from DB 
            knex('userpreftable')
            .where({'userid': results[0].userid}).select('preferenceid')
            .then(function(result){
              var prefs= []
              //Store user preferences in array
              for (var prop in result) {
                if  (prop !== 'userid') {
                  console.log("RESULT")
                  prefs.push(result[prop].preferenceid)
                  console.log(result[prop].preferenceid)
                }
              }
              //Put user preferences in cookie and render results page (NEEDS FIX 8-20-15)
              knex('userpreftable')
              .where({'preferenceid': user.userid})
              .then(function(){
              console.log('Beforeprefs')
              console.log(prefs)
              console.log('iamhere')
              res.cookie('preferences', prefs)
              res.redirect('/results');
              })    
            })
          })
        
        } else {
          res.render('login', {
            title: 'Im Bored',
            user: null,
            error: 'Incorrect Password '
          });
        }
      });
    }
  });
});

//Render Results Page
router.get('/results', function(req, res, next) {
  
  res.render('results', { title: "I'm Bored!" });
});

//Logout and clear cookie 
router.get('/logout', function(req, res, next) {
  
  res.clearCookie('preferences');
  
  res.render('logout', { title: "I'm Bored!"});
});

//Render Register Page
router.get('/register', function (req, res, next) {
  
  res.render('regis',{ title: "I'm Bored!" })
});

router.post('/register', function (req, res) {
  var prefArr= [];
  var prefs= [];
  // Selects all of the usernames stored in the user name column that match the requested username
  knex('authtable').where('username', req.body.username)
  .then(function(result){
    
    //Hash and salt   
    pwd.hash(req.body.password, function(err, salt, hash) {
      var stored = {username:req.body.username, salt:salt, hash:hash};
      
      knex('authtable')
      .returning('userid')
      .insert(stored)
      .then(function(userid) {

        for (var prop in req.body) {
          if (prop !== 'username' && prop !== 'password' && prop !== 'password_confirm') {
            prefs.push(prop);
            console.log("PREF")
            console.log(prefs)
            knex('preftable')
            .insert({happyname: prop.replace('_', ' '), apiname: prop}).then();                
          }
        }
//Hello
        res.cookie('preferences', prefs.join(","))
        
        knex('authtable')
        .where('username',req.body.username).select('userid')
        .then(function(results) {
          
          if(results.length!==0) {
            
            for(var i=0;i<20;i++) {
              var k= parseInt(i)
              if(req.body[k]) {
                console.log("PREFARR")
                console.log(prefArr)
                prefArr.push(k)
              }
            }
            for(var j=0; j<prefArr.length; j++) {
              knex('userpreftable')
              .insert([{preferenceid:prefArr[j],userid:results[0].userid }])
              .then()
            }  
            knex('userpreftable')
            .then(function() {  
              res.redirect('/results')
            })
          }
        })
      })
    })
  })
})

module.exports = router;