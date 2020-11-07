require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;

const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const app = express();

mongoose.Promise = global.Promise;
mongoose
	.connect(process.env.MONGO_URL, {
		dbName: process.env.MONGO_DBNAME,
		useNewUrlParser: true,
		useUnifiedTopology: true,
		useFindAndModify: false,
	})
	.then(() => {
		console.log("MongoDB successfully connected");
	})
	.catch((err) => {
		console.log(err);
	});

//Session Controller
app.use(
	require("express-session")({
		secret: process.env.EXPRESS_SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
	}),
);

//OAuth Handler setup
app.use(passport.initialize());
app.use(passport.session());

const User = require("./models/User");

passport.use(
	new DiscordStrategy(
		{
			clientID: process.env.DISCORD_CLIENT_ID,
			clientSecret: process.env.DISCORD_CLIENT_SECRET,
			callbackURL: "/auth/discord/callback",
			scope: ["identify", "email", "guilds", "guilds.join"],
		},
		function (accessToken, refreshToken, profile, cb) {
			console.log(
				`${profile.username}#${profile.discriminator} has logged in.`,
			);
			console.log(profile);
			User.findOrCreate(
				{
					discordId: profile.id,
					username: profile.username,
					discriminator: profile.discriminator,
					email: profile.email,
					accessToken: profile.accessToken,
					guilds: profile.guilds,
				},
				function (err, user) {
					return cb(err, user);
				},
			);
		},
	),
);

passport.serializeUser(function (user, cb) {
	cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
	cb(null, obj);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use("/u", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
