
const Database = require("better-sqlite3");
const path = require("path");

// Create or connect to the SQLite database
const dbPath = path.join(__dirname, "../database/studyspot.db");
const db = new Database(dbPath);

// Enable foreign key relationships
db.pragma("foreign_keys = ON");

// Create the required tables
db.exec(`
    CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS carrels (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        zone TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        carrel_id INTEGER NOT NULL,
        booking_date TEXT NOT NULL,

        FOREIGN KEY (student_id) REFERENCES students(id),
        FOREIGN KEY (carrel_id) REFERENCES carrels(id)
    );
`);

console.log("StudySpot database connected successfully!");
console.log("Students, Carrels and Bookings tables are ready.");

module.exports = db;
