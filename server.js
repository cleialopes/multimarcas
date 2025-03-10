const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const db = require('./database');

const app = express();
const saltRounds = 10;
const secretKey = "mi_clave_secreta"; // Cambia esto por una clave más segura

app.use(cors());
app.use(express.json());
app.use(express.static('public')); //carpeta con los archivos estáticos

// Configuración de sesiones
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

app.use(session({
  store: new SQLiteStore({ db: 'sessions.db' }), // Almacena sesiones en SQLite
  secret: 'XASDWERTY', // Poner una clave segura
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Cambia a true si usas HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 1 día de duración    // 3600000 // 1 hora
  }
}));

// Registro de usuarios con contraseña encriptada
app.post('/api/register', async (req, res) => {
  try {
    const { name, username, telefono, email, password } = req.body;

    // Verificar si el usuario ya existe
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).send('Error en la base de datos');
      }
      if (row) {
        return res.status(400).send('El correo electrónico ya está registrado');
      }

      // Hash de la contraseña
      const passwordHash = await bcrypt.hash(password, saltRounds);
       // Insertar nuevo usuario
       db.run(
        'INSERT INTO users (name, username, telefono, email, password) VALUES (?, ?, ?, ?, ?)',
        [name, username, telefono, email, passwordHash],
        (err) => {
          if (err) {
            return res.status(500).send('Error en la base de datos');
          }
          res.send('Usuario registrado correctamente');
        }
      );
    });
  } catch (err) {
    res.status(500).send('Error en el servidor');
  }
});

// Inicio de sesión
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
          return res.status(500).send('Error en la base de datos');
      }
      if (!user) {
          return res.status(401).send('Usuario no encontrado');
      }

      try {
        // Comparar la contraseña con la almacenada
          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) {
              return res.status(401).send('Contraseña incorrecta');
          }
          // Generar un token JWT
          const token = jwt.sign({ id: user.id, email: user.email, username: user.username }, secretKey, { expiresIn: '1h' });
          // Guardar el usuario en la sesión
          req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
          };
          res.json({ message: 'Inicio de sesión exitoso', token, username: user.username });
      } catch (error) { 
          res.status(500).send("Error en el servidor");
      }
  });
});

// Obtener datos de ropa desde un archivo JSON
app.get('/ropa', (req, res) => {
  fs.readFile('data/ropa.json', 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error al leer el archivo');
    } 
    res.json(JSON.parse(data));
  });
});

app.post('/api/favorites', (req, res) => {
  const { producto_id } = req.body;
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  if (!producto_id) {
    return res.status(400).json({ error: 'Falta producto_id' });
  }

  db.get('SELECT * FROM favoritos WHERE user_id = ? AND producto_id = ?', [user.id, producto_id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }

    if (row) {
       // Si ya está en favoritos, eliminarlo
      db.run('DELETE FROM favoritos WHERE user_id = ? AND producto_id = ?', [user.id, producto_id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json({ message: 'Producto eliminado de favoritos' });
      });
    } else {
      db.run('INSERT INTO favoritos (user_id, producto_id) VALUES (?, ?)', [user.id, producto_id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.json({ message: 'Producto agregado a favoritos' });
      });
    }
  });
});

// Ruta para obtener favoritos del usuario logueado
app.get('/api/favorites', (req, res) => {
  const user = req.session.user;

  if (!user) {
    return res.status(401).json({ error: 'Usuario no autenticado' });
  }

  db.all('SELECT producto_id FROM favoritos WHERE user_id = ?', [user.id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error en la base de datos' });
    }
    res.json(rows.map(row => row.producto_id));
  });
});

// Ruta para inicio de sesión de administrador
app.post('/api/loginAdmin', (req, res) => {
  const { username, password } = req.body;

  db.get('SELECT * FROM users WHERE username = ? AND isadmin = 1', [username], async (err, user) => {
    if (err) {
      return res.status(500).json({ message: 'Error en la base de datos' });
    }
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado o no autorizado' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    req.session.user = { id: user.id, username: user.username, email: user.email, isadmin: true };
    res.json({ message: 'Inicio de sesión exitoso', redirect: '/dashboardAdmin' });
  });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});


// Verificar si la carpeta de uploads existe
// const uploadDir = path.join(__dirname, 'uploads');
// if (!fs.existsSync(uploadDir)) {
//   fs.mkdirSync(uploadDir);
// }

// // Configurar almacenamiento de imágenes
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   }
// });

// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 2 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const filetypes = /jpeg|jpg|png|gif/;
//     const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//     const mimetype = filetypes.test(file.mimetype);
//     if (mimetype && extname) {
//       return cb(null, true);
//     }
//     cb(new Error('Solo se permiten imágenes en formato JPEG, JPG, PNG o GIF.'));
//   }
// });