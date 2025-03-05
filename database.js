//database.js
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  isadmin BOOLEAN DEFAULT 0
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

  db.get('SELECT * FROM users WHERE email = ?', ['cleialopes530@gmail.com'], (err, row) => {
    if (err) {
      console.error("Error verificando el usuario admin:", err);
      return;
    }
    
    if (row) {
      console.log("✅ Usuario administrador ya existe en la base de datos.");
    } else {
      console.log("⚠️ Usuario administrador no encontrado. Creando nuevo usuario...");
      db.run(`
        INSERT INTO users (name, username, telefono, email, password, isadmin)
        VALUES (?, ?, ?, ?, ?, ?)`,
        ['jozicleia', 'cleia', '0000000000', 'cleialopes530@gmail.com', '$2b$10$Q.WjvVp3K/fNpklJ7KY6TuLJH7F3G6N4hT1j.oHQGSAwIH7v3MX5K', 1],
        (err) => {
          if (err) console.error("Error insertando usuario admin:", err);
          else console.log("✅ Usuario administrador creado exitosamente.");
        }
      );
    }
  });
});

module.exports = db;