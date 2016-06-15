var Firebase = require('firebase');
var express = require('express');
var _ = require('lodash');
var $q = require('q');
var request = require('request');

var NUM_FEED_PROPS = 2;

var app = express();

// confirms token sent with req is a valid token 
// if token not valid -> 401 
// if token valid, attaches user to req
function validateTokenMiddleware (req, res, next) {
  var fbRef = new Firebase("https://ixchommies.firebaseio.com/");
  if(!("token" in req.query) || req.query.token.trim() === "") {
    res.status(403).json({ message: "You need to include a token" });
    return;
  }
  
  fbRef.child("brus").once("value", function(snapshot) {
    var brus = snapshot.val();
    var meBru = _.findKey(brus, {"token": req.query.token});
    
    if(meBru.length > 0) {
      req.user = brus[meBru];
      req.user.id = meBru;
      delete req.user.token;
      next();
    } else {
      res.status(403).json({ message: "Invalid token" });
    }
  });
}

// enforce token on every request
app.use(validateTokenMiddleware);

app.get('/', function(req,res) {
  res.send("");
});

// returns list of brus
app.get('/brus', function(req,res) {
  var fbRef = new Firebase("https://ixchommies.firebaseio.com/");
  var filterBru = function(bru, id) {
    bru.id = id;
    return _.omit(bru, ['token']);
  };
  
  fbRef.child("brus").once("value", function(snapshot) {
    var brus = snapshot.val();
    brus = _.map(brus, filterBru);
    
    res.send(brus);
  });
});

// returns list of latest props
app.get('/props', function(req, res) {
  var fbRef = new Firebase("https://ixchommies.firebaseio.com/props");
  fbRef.once("value", function(snapshot) {
    // sort the props
    var props = _.orderBy(_.values(snapshot.val()), ["created_at"], ["desc"]);
    // limit to most recent, remove the sender
    props = _.map(props.slice(0, NUM_FEED_PROPS),
                  function(o) { 
                    return _.omit(o,"sender")
                  });
    res.send(props);
  });
});

// returns list of latest props
app.get('/props/me', function(req, res) {
  var fbRef = new Firebase("https://ixchommies.firebaseio.com/props");
  fbRef.once("value", function(snapshot) {
    var props = _.values(snapshot.val());
    props = _.filter(props, {'receiver': {'id': req.user.id}});
    props = _.orderBy(props, ["created_at"], ["desc"]);
    props = _.map(props, function(o) { 
                    return _.omit(o,"sender")
                  });
    res.send(props);
  });
});

app.post('/props', function(req, res) {
  var fbRef = new Firebase("https://ixchommies.firebaseio.com/");
  var validateProps = function(props) {
    var deferred = $q.defer();
    
    if(!props) {
      deferred.reject("You gotta pass some props");
      return deferred.promise;
    } 
    
    // check that props are positive
    request({
      url: 'https://twinword-sentiment-analysis.p.mashape.com/analyze/?text='+props,
      headers: {
        "X-Mashape-Key": process.env.MASHAPE_KEY
      }
    }, function(error, callback, body) {
      body = JSON.parse(body);
      if(body.type === "negative") {
        deferred.reject("Positive props only!");
      } else {
        deferred.resolve(body.score);
      }
    });
    
    return deferred.promise;
  };
  
  var validateUser = function(user) {
    var deferred = $q.defer();
    
    // ensure user was passed
    if(!user) {
      deferred.reject("You need to pass a user to props");
      return deferred.promise;
    }
    
    // ensure user is not the token'd user
    if(user == req.user.id) {
      deferred.reject("You can't props yourself! Ego score: 100%");
      return deferred.promise;
    }
    
    // ensure user is a valid user 
    fbRef.child("brus").once("value", function(snapshot) {
      var brus = snapshot.val();
      if(user in brus) {
        brus[user].id = user;
        delete brus[user].token;
        deferred.resolve(brus[user]);
      }
      else {
        deferred.reject("No user exists with id '" + user + "'");
      }
    });
    
    return deferred.promise;
  };
  
  var doValidation = function(forUser, props) {
    return $q.all([validateUser(forUser), validateProps(props)]).then(function(results) {
      return results;
    }, function(results) {
      res.status(400).send({"message": results});
      return results;
    });
  };
  
  var props = req.query.props;
  var forUser = req.query.for;
  var forUserObj = {};
  
  // validate all inputs
  doValidation(forUser, props).then(function(results) {
    var obj = {
      text: props,
      sender: req.user,
      receiver: results[0],
      created_at: Date.now(),
      positivity_score: results[1]
    }
    
    fbRef.child('props').push(obj);
    res.send(obj);
  });
});

app.listen(3000,function() {
  console.log('app listening on port 3000');
});