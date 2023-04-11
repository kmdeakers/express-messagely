"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db");
const bcrypt = require("bcrypt");
const { BCRYPT_WORK_FACTOR } = require("../config");


/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const result = await db.query(

      `INSERT INTO users (username,
                              password,
                              first_name,
                              last_name,
                              phone,
                              join_at,
                              last_login_at)
              VALUES
                ($1, $2, $3, $4, $5, current_timestamp, current_timestamp)
              RETURNING username, password, first_name, last_name, phone, join_at`,
      [username, hashedPassword, first_name, last_name, phone]);



    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    //do need a query in here
    const result = await db.query(
      `SELECT password FROM users
              WHERE username = $1`,
      [username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`User can't be found`);
    if (user) {
      if (await bcrypt.compare(password, user.password) === true) {

        return true;
      }
    }
    return false;
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const result = await db.query(
      `UPDATE users
          SET last_login_at = current_timestamp
            WHERE username = $1
            RETURNING username, last_login_at`,
      [username]);
  }

  /** All: basic info on all users:
   * Get all basic info on all users
   * Returns this: [{username, first_name, last_name}, ...] */

  static async all() {
    const results = await db.query(
      `SELECT username,
              first_name,
              last_name,
              phone,
              join_at,
              last_login_at
        FROM users`
    );
    const users = results.rows;
    return users.map(u => ({
      username: u.username,
      first_name: u.first_name,
      last_name: u.last_name
    }));
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(
      `SELECT username,
                first_name,
                last_name,
                phone,
                join_at,
                last_login_at
          FROM users
          WHERE username = $1 `,
      [username]
    );
    const user = results.rows[0];

    if (!user) throw new NotFoundError(`User can't be found`);
    return user;
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT id,
              m.from_username,
              m.to_username,
              m.body,
              m.sent_at,
              m.read_at,
              f.username,
              t.first_name,
              t.last_name,
              t.phone
          FROM messages AS m
              JOIN users AS f ON m.from_username = f.username
              JOIN users AS t ON m.to_username = t.username
          WHERE f.username = $1`,
      [username]);
    const messagesFromUser = results.rows;
    // if (!messagesFromUser.length) throw new NotFoundError('No messages found');

    //[{id, to_username, body, sent_at, read_at}]
    // return messagesFromUser.map(m => ({
    //   id: m.id,
    //   to_user: {
    //     username: m.to_username,
    //     first_name: m.first_name,
    //     last_name: m.last_name,
    //     phone: m.phone,
    //   },
    //   body: m.body,
    //   sent_at: m.sent_at,
    //   read_at: m.read_at
    // }));
    const messages = [];
    for (let m of messagesFromUser) {
      m = {
        id: m.id,
        to_user: {
          username: m.to_username,
          first_name: m.first_name,
          last_name: m.last_name,
          phone: m.phone,
        },
        body: m.body,
        sent_at: m.sent_at,
        read_at: m.read_at
      }
      messages.push(m);
    }
    return messages;
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
          `SELECT id,
          m.from_username,
          m.to_username,
          m.body,
          m.sent_at,
          m.read_at,
          t.username,
          f.first_name,
          f.last_name,
          f.phone
      FROM messages AS m
          JOIN users AS f ON m.from_username = f.username
          JOIN users AS t ON m.to_username = t.username
      WHERE t.username = $1`,
      [username]);
    const messagesToUser = results.rows;
    if (!messagesToUser.length) throw new NotFoundError('No messages found');

    //[{id, to_username, body, sent_at, read_at}]
    return messagesToUser.map(m => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone,
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
  }
}

module.exports = User;
