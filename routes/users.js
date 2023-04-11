"use strict";

const Router = require("express").Router;
const router = new Router();
const jwt = require("jsonwebtoken");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const { SECRET_KEY } = require("../config.js");
const User = require("../models/user.js");
const { authenticateJWT,
    ensureLoggedIn,
    ensureCorrectUser, } = require("../middleware/auth.js")


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name}, ...]}
 *
 **/

router.get("/", ensureLoggedIn, async function (req, res, next) {

    const users = await User.all();
    // console.log("users: ", users)
    return res.json({ users });
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get("/:username", 
    ensureLoggedIn, 
    ensureCorrectUser,
    async function (req, res, next) {
        const { username } = req.params;
        const user = await User.get(username);

        return res.json({ user });
    })



/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/to",
    ensureLoggedIn,
    ensureCorrectUser,
    async function (req, res, next) {

        const { username } = req.params;
        const messages = await User.messagesTo(username);

        return res.json({ messages });
    });

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get("/:username/from",
    ensureLoggedIn,
    ensureCorrectUser,
    async function (req, res, next) {

        const { username } = req.params;
        const messages = await User.messagesFrom(username);

        return res.json({ messages });
    });

module.exports = router;