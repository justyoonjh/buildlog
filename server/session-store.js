const EventEmitter = require('events');
const path = require('path');
const fs = require('fs');

/**
 * Custom Session Store using better-sqlite3
 * Replaces connect-sqlite3 to fix Render deployment issues (SQLITE_CANTOPEN)
 */
class BetterSqliteStore extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.dbPath = options.dbPath || path.join(__dirname, '../data/sessions.db');
    this.table = options.table || 'sessions';

    // Ensure directory exists (redundant safety check)
    const dir = path.dirname(this.dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    try {
      this.db = require('better-sqlite3')(this.dbPath, {});
      this.prepareDb();
    } catch (err) {
      console.error('Failed to initialize session database:', err);
      throw err;
    }
  }

  prepareDb() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS ${this.table} (
        sid TEXT PRIMARY KEY,
        sess JSON NOT NULL,
        expired INTEGER NOT NULL
      )
    `);

    // Clean up expired sessions periodically (every 1 hour)
    setInterval(() => this.clearExpired(), 1000 * 60 * 60).unref();
  }

  get(sid, cb) {
    try {
      const stmt = this.db.prepare(`SELECT sess, expired FROM ${this.table} WHERE sid = ?`);
      const row = stmt.get(sid);

      if (!row) return cb(null, null);

      if (Date.now() > row.expired) {
        this.destroy(sid, (err) => cb(err, null));
      } else {
        const sess = JSON.parse(row.sess);
        cb(null, sess);
      }
    } catch (err) {
      cb(err);
    }
  }

  set(sid, sess, cb) {
    try {
      // Calculate expiration
      let expired;
      if (sess && sess.cookie && sess.cookie.expires) {
        expired = new Date(sess.cookie.expires).getTime();
      } else {
        // Default 1 day if not set
        expired = Date.now() + 86400000;
      }

      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO ${this.table} (sid, sess, expired)
        VALUES (?, ?, ?)
      `);

      stmt.run(sid, JSON.stringify(sess), expired);
      cb(null);
    } catch (err) {
      cb(err);
    }
  }

  destroy(sid, cb) {
    try {
      this.db.prepare(`DELETE FROM ${this.table} WHERE sid = ?`).run(sid);
      if (cb) cb(null);
    } catch (err) {
      if (cb) cb(err);
    }
  }

  clearExpired() {
    try {
      this.db.prepare(`DELETE FROM ${this.table} WHERE expired < ?`).run(Date.now());
    } catch (err) {
      console.error('Failed to clear expired sessions:', err);
    }
  }
}

module.exports = function (session) {
  // Inherit from express-session Store
  BetterSqliteStore.prototype.__proto__ = session.Store.prototype;
  return BetterSqliteStore;
};
