
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('suscriptores.db'); // Crea un archivo de base de datos

db.serialize(() => {
  // Crear tabla de usuarios si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL, 
  telefono TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  // Crea tablaba de favoritos si no existe
  db.run(`
  CREATE TABLE IF NOT EXISTS favoritos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
  `);
});

module.exports = db;