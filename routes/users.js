const express = require("express");
const router = express.Router();
const config = require("../config.json");
const Class = require("../models/Class");
const User = require("../models/User");

/* GET users listing. */
router.get("/", function (req, res, next) {
	if (!req.user) return res.redirect("/");
	res.render("user/index", { title: config.name , user: req.user});
});

router.get("/new", (req, res, next) => {
	if (!req.user) return res.redirect("/");
	res.render("user/newClass", {title: config.name, user: req.user })
});

router.get("/create", (req, res, next) => {
	if (!req.user) return res.redirect("/");
	res.render("user/createClass", { title: config.name, user: req.user });
});

router.post("/create", (req, res, next) => {
	if (!req.user) return res.redirect("/");
	Class.create(req.body, (err, newClass) => {
		if (err) console.log(err);
		var newClassObject = {
			classId: newClass._id,
			name: newClass.name,
			permission: "admin",
		};
		User.findById(req.user._id, (err, user) => {
			if (err) console.log(err);
			user.classes.push(newClassObject);
			user.save();
		});
		res.redirect(`/u/class/${newClass._id}`);
	});
});

router.get("/join", (req, res, next) => {
	if (!req.user) return res.redirect("/");
	var classCode = req.query.classCode;
	Class.findById(classCode, (err, currentClass) => {
		if (err) {
			console.log(err);
			return res.send("Class does not exist");
		}
		User.findById(req.user._id, (err, user) => {
			if (err) console.log(err);
			if (user.classes.some((item) => item.classId === classCode)) {
				return;
			} else {
				var newClassObject = {
					classId: classCode,
					name: currentClass.name,
					permission: "student",
				};
				user.classes.push(newClassObject);
				user.save();
				req.user = user;
			}
		});
		res.redirect(`/u/class/${classCode}`);
	});
});

router.get("/class/:classCode", async (req, res, next) => {
	if (!req.user) return res.redirect("/");
	var requestedClass = await Class.findById(req.params.classCode).exec();
	res.render("user/class", {
		title: config.name,
		user: req.user,
		class: requestedClass,
	});
});

module.exports = router;
