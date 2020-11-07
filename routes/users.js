const express = require("express");
const router = express.Router();
const config = require("../config.json");

/* GET users listing. */
router.get("/", function (req, res, next) {
	if (!req.user) return res.redirect("/");
	res.render("user/index", { title: config.name , user: req.user});
});

module.exports = router;
