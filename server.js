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

app.post("/upload", upload.single('photo'), (req, res) => {
  const { name, fecha, gender, email, password, terms } = req.body;

  if (!req.file) {
    return res.status(400).send('No se ha subido ninguna foto.');
  }

  // Crea un nuevo usuario
  const newUser = {
    id: Date.now(),
    photo: `/uploads/${req.file.filename}`,
    name,
    fecha,
    gender,
    email,
    password,
    terms
  };

  // Guarda la información en un archivo JSON
  const filePath = './data/suscripcion.json';
  const usuarios = fs.existsSync(filePath)
    ? JSON.parse(fs.readFileSync(filePath))
    : [];
  usuarios.push(newUser);
  fs.writeFileSync(filePath, JSON.stringify(usuarios, null, 2));

  res.status(200).send('Alumno añadido correctamente.');

});

app.get('/ropa', (req, res) => {
    fs.readFile('data/ropa.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el archivo');
        res.send(JSON.parse(data));
    }); 
});

app.get('/suscriptores', (req, res) => {
    fs.readFile('data/suscripcion.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el archivo');
        res.send(JSON.parse(data));
    }); 
});

// Añadir un nuevo usuario suscrito
app.post('/api/new', (req, res) => {
    const newUsuario = req.body;
    
    fs.readFile('data/suscripcion.json', 'utf-8', (err, data) => {
      if (err) return res.status(500).send('Error leyendo el archivo');
      const usuarios = JSON.parse(data);
      usuarios.push(newUsuario);
      
      fs.writeFile('data/suscripcion.json', JSON.stringify(usuarios, null, 2), (err) => {
        if (err) return res.status(500).send('Error escribiendo el archivo');
        res.send({ message: 'Usuario añadido' });
      });
    });
  });

  app.listen(3000, () => {
    console.log('Server started on http://localhost:3000');
});