"use strict";

const { NotFoundError } = require("../expressError");
const db = require("../db");

/** User of the site. */

class User {

  /** Register new user. Returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({ username, password, first_name, last_name, phone }) {
    const result = await db.query(

      `INSERT INTO users (username,
                              password,
                              first_name,
                              last_name,
                              phone
              VALUES
                ($1, $2, $3, $4, $5)
              RETURNING username, password, first_name, last_name, phone`,
      [username, password, first_name, last_name, phone]);

    return result.rows[0];
  }

  /** Authenticate: is username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    //do need a query in here

    if (username) {
      if (await bcrypt.compare(password, user.password) === true) {
        return true;
      }
      return false;
    }
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
    return users;
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
          WHERE username = $1`,
      [username]
    );
    const user = results.row[0];

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
      `SELECT m.id
              m.to_username
              m.body
              m.sent_at
              m.read_at
              u.username
              u.first_name
              u.last_name
              u.phone
          FROM messages AS m
              JOIN users AS u ON u.username = m.to_username
          WHERE u.username = $1`,
      [username]);
    const messagesFromUser = results.rows;
    if (!messagesFromUser.length) throw new NotFoundError('No messages found');

    //[{id, to_username, body, sent_at, read_at}]
    return messagesFromUser.map(m => ({
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
    }));
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
      `SELECT m.id
              m.to_username
              m.body
              m.sent_at
              m.read_at
              u.username
              u.first_name
              u.last_name
              u.phone
          FROM messages AS m
              JOIN users AS u ON u.username = m.from_username
          WHERE u.username = $1`,
      [username]);
    const messagesToUser = results.rows;
    if (!messagesToUser.length) throw new NotFoundError('No messages found');

    //[{id, to_username, body, sent_at, read_at}]
    return messagesToUser.map(m => ({
      id: m.id,
      from_user: {
        username: m.to_username,
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
