var express 		= require('express');
var app 			= express();
var bodyParser 		= require('body-parser');
var morgan 			= require('morgan');
var mongoose 		= require('mongoose');

var jwt 			= require('jsonwebtoken');
var config 			= require('./config');
var User 			= require('./app/models/user');

var port 			= process.env.PORT || 8090;
mongoose.connect(config.url);
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

var apiRouter = express.Router();

apiRouter.use(function(req, res, next){
	var token = req.body.token || req.query.token || req.headers['x-access-token'];
	if (token){
		jwt.verify(token, app.get('superSecret'), function(err, decoded){
			if(err)
				return res.json({success:false, message:'Failed to authenticate token'});
			else{
				req.decoded = decoded;
				next();
			}
		});
	}
	else {
		return res.status(403).send({
			success: false,
			message: 'No token Provided'
		});
	}
});

apiRouter.get('/', function(req, res){
	res.send('API is at localhost:'+port);
});

apiRouter.get('/users', function(req, res){
	User.find({}, function(err, users){
		res.json(users);
	});
});


// No required of token-----------------this will generate it
apiRouter.post('/authenticate', function(req, res){
	User.findOne({
		name: req.body.name	
	}, function(err, user){
		if(err) throw err;
		if (!user) 
			res.send({success: false, message:'Authentication failed'});
		else if(user){
			if (user.password != req.body.password) {
				res.json({success: false, message: "Wrong password"});
			}
			else {
				var token = jwt.sign(user, app.get('superSecret'), {
					expiresInMinute : 1440
				});

				res.json({
					success: true,
					message: 'Enjoy your token',
					token: token
				});
			}
		}
	});
});

app.use('/api', apiRouter);


app.get('/setup', function(req, res){
	var user = new User({
		name: 'rapido',
		password: '123',
		admin: true
	});

	user.save(function(err){
		if (err) throw err;
		console.log("User saved Successfully");
		res.send({success: true});
	});
});


app.listen(port);
console.log("server running at port no "+ port);
