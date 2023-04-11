"use strict";

const Router = require("express").Router;
const router = new Router();

const { BadRequestError, UnauthorizedError } = require("../expressError");
const { SECRET_KEY } = require("../config.js");
const User = require("../models/user.js");
const { authenticateJWT,
        ensureLoggedIn,
        ensureCorrectUser, } = require("../middleware/auth.js");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Makes sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next){
  const { id, from_user, to_user, body, sent_at, read_at } = req.params;
  const message = await Message.get(id);


})


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/


/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Makes sure that the only the intended recipient can mark as read.
 *
 **/


module.exports = router;