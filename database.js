
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('suscriptores.db'); // Crea un archivo de base de datos

db.serialize(() => {
  
  // Crear tabla de usuarios
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      telefono TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
});

module.exports = db;