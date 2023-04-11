"use strict";

const Router = require("express").Router;
const router = new Router();
const jwt = require("jsonwebtoken");
const { BadRequestError, UnauthorizedError } = require("../expressError");
const { SECRET_KEY } = require("../config.js");
const User = require("../models/user.js");

/** POST /login: {username, password} => {token} */
router.post("/login", async function (req, res){
  if(req.body === undefined || !req.body) throw new BadRequestError();

  const { username, password }  = req.body;
  if(await User.authenticate(username, password) === true){
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  } else {
    throw new UnauthorizedError('Invalid user/password');
  }
});

/** POST /register: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 */
router.post("/register", async function(req, res){
  if(req.body === undefined || !req.body) throw new BadRequestError();

  const { username, password , first_name, last_name, phone }  = req.body;
  const user = await User.register({
                              username,
                              password,
                              first_name,
                              last_name,
                              phone
                      });

  if(await User.authenticate(username, password)){
    console.log("we got in ")
    const token = jwt.sign({ username }, SECRET_KEY);
    return res.json({ token });
  } else {
    throw new UnauthorizedError('Invalid user/password');
  }
});

module.exports = router;