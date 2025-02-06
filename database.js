
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('suscriptores.db'); // Crea un archivo de base de datos

db.serialize(() => {
  // Crear tabla de usuarios si no existe
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL, -- Nuevo campo
  telefono TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;