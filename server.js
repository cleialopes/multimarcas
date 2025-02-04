const express = require('express');
const cors = require('cors');

const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); //carpeta con los archivos estáticos

// Subir imagenes
const multer = require('multer');
const path = require('path');
const db = require('./database');
// Define la ruta completa a la carpeta 'uploads'
const uploadDir = path.join(__dirname, 'uploads');
// Verifica si la carpeta existe y créala si no está presente
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configurar carpeta de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Asegúrate de que esta ruta sea válida, ruta donde se guardan las imagenes
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Nombre único
  }
});

  // Middleware de Multer
  const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Límite de 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname =
    filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
    return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes en formato JPEG, JPG, PNG o GIF.'));
  }
});

app.post('/api/register', async(req,res) => {
  try {
    const { name, telefono, email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
      if (err) throw err;{
        // return res.status(500).send('Error en la base de datos');
      }

      // Verificar si el correo electrónico ya está registrado
      if (row) {
        return res.status(400).send('El correo electrónico ya está registrado');
      }
      
      // hash de la contraseña
      const passwordHash = bcrypt.hash(password, saltrounds);
      // Insertar un nuevo usuario
      db.run(
        'INSERT INTO users (name, telefono, email, password) VALUES (?, ?, ?, ?)',
        [name, telefono, email, password],
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
})

app.get('/ropa', (req, res) => {
    fs.readFile('data/ropa.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el archivo');
        res.send(JSON.parse(data));
    }); 
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
