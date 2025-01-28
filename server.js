const express = require('express');
const cors = require('cors');

const fs = require('fs');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public')); //carpeta con los archivos estáticos

app.get('/ropa', (req, res) => {
    fs.readFile('data/ropa.json', 'utf8', (err, data) => {
        if (err) return res.status(500).send('Error al leer el archivo');
        res.send(JSON.parse(data));
    }); 
});

app.get('/suscriptores', (req, res) => {
    fs.readFile('data/suscriptores.json', 'utf8', (err, data) => {
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