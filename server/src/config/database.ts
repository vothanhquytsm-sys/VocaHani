import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Resolve database storage path (mounts to Fly Volume /data/ in production)
let dbPath = './voca_users.db';
if (fs.existsSync('/data')) {
  dbPath = '/data/voca_users.db';
}

console.log(`Initializing SQLite database at: ${dbPath}`);
const db = new Database(dbPath);

// Create database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_custom_words (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    word TEXT NOT NULL,
    ipa TEXT NOT NULL,
    vietnamese_meaning TEXT NOT NULL,
    example_english TEXT,
    example_vietnamese TEXT,
    topic TEXT,
    level TEXT,
    symbol_name TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    user_id TEXT PRIMARY KEY,
    learned_word_ids TEXT,
    favorite_word_ids TEXT,
    favorite_phrase_ids TEXT,
    passed_lessons TEXT,
    completed_readings TEXT,
    srs_map TEXT,
    albums TEXT,
    ielts_progress TEXT DEFAULT '{}',
    updated_at TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

// Safe column migration for existing deployments
try {
  db.exec("ALTER TABLE user_progress ADD COLUMN albums TEXT;");
  console.log("Successfully migrated database: added albums column to user_progress.");
} catch (e) {
  // Column already exists, ignore
}

try {
  db.exec("ALTER TABLE user_progress ADD COLUMN ielts_progress TEXT DEFAULT '{}';");
  console.log("Successfully migrated database: added ielts_progress column to user_progress.");
} catch (e) {
  // Column already exists, ignore
}

// Auto-seed default user "voquy" if users table is empty
try {
  const checkUser = db.prepare('SELECT count(*) as count FROM users');
  const result = checkUser.get() as { count: number } | undefined;
  const count = result ? result.count : 0;

  if (count === 0) {
    console.log('Seeding default user account: voquy');
    const userId = 'user_voquy_' + Math.random().toString(36).substring(2, 10);
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('12345678', salt);
    const createdAt = new Date().toISOString();

    const insertUser = db.prepare(`
      INSERT INTO users (id, username, password_hash, created_at)
      VALUES (?, ?, ?, ?)
    `);
    insertUser.run(userId, 'voquy', hash, createdAt);
    
    // Pre-seed an empty progress row for the user
    const insertProgress = db.prepare(`
      INSERT INTO user_progress (user_id, learned_word_ids, favorite_word_ids, favorite_phrase_ids, passed_lessons, completed_readings, srs_map, updated_at)
      VALUES (?, '[]', '[]', '[]', '[]', '{}', '{}', ?)
    `);
    insertProgress.run(userId, createdAt);
    console.log('Default user seeded successfully.');
  }
} catch (e) {
  console.error('Error seeding default user:', e);
}

export default db;
