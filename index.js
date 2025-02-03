const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('informacion.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS alumnos (id INTEGER PRIMARY KEY, name TEXT, age INTEGER,  email TEXT, photo TEXT)");
    db.run("INSERT INTO alumnos (name,age,email) VALUES (?,?,?)", ["Juan",23,"email@mail.com"]);
    
    db.each("SELECT * FROM alumnos", (err, row) => {
        console.log(row.id + ": " + row.name + ": " + row.age + ": " + row.email + ": " + row.photo);
    });
});

db.close();