const express = require("express");
const router = express.Router();
const config = require("../config.json");
const passport = require("passport");

/* GET home page. */
router.get("/", function (req, res, next) {
  if (req.user) {
    return res.redirect("/u")
  }
	res.render("public/index", { title: config.name });
});

router.get("/login", passport.authenticate("discord"));

router.get(
	"/auth/discord/callback",
	passport.authenticate("discord", {
		failureRedirect: "/",
	}),
	(req, res) => {
		res.redirect("/u"); // Successful auth from Discord
	},
);

module.exports = router;
