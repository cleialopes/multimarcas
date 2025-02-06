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

// Verificar si la carpeta de uploads existe
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configurar almacenamiento de imágenes
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes en formato JPEG, JPG, PNG o GIF.'));
  }
});

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

          res.json({ message: 'Inicio de sesión exitoso', token, username: user.username });
      } catch (error) { 
          res.status(500).send("Error en el servidor");
      }
  });
});

// Obtener datos de ropa desde un archivo JSON
app.get('/ropa', (req, res) => {
  fs.readFile('data/ropa.json', 'utf8', (err, data) => {
    if (err) return res.status(500).send('Error al leer el archivo');
    res.send(JSON.parse(data));
  });
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});

