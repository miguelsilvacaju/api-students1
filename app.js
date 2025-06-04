const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = 8001;

// Middleware para parsear application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Middleware para parsear JSON si lo necesitas
app.use(bodyParser.json());

// Conexión a SQLite
function dbConnection() {
  return new sqlite3.Database('students.sqlite', (err) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    }
  });
}

// Ruta para manejar GET y POST /students
app.route('/students')
  .get((req, res) => {
    const db = dbConnection();
    const sql = "SELECT * FROM students";
    db.all(sql, [], (err, rows) => {
      if (err) {
        res.status(500).send(err.message);
      } else {
        const students = rows.map(row => ({
          id: row.id,
          firstname: row.firstname,
          lastname: row.lastname,
          gender: row.gender,
          age: row.age
        }));
        res.json(students);
      }
      db.close();
    });
  })
  .post((req, res) => {
    const db = dbConnection();
    const { firstname, lastname, gender, age } = req.body;
    const sql = `INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)`;
    db.run(sql, [firstname, lastname, gender, age], function(err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.send(`Student with id: ${this.lastID} created successfully`);
      }
      db.close();
    });
  });

// Ruta para manejar GET, PUT, DELETE de un estudiante por ID
app.route('/student/:id')
  .get((req, res) => {
    const db = dbConnection();
    const id = req.params.id;
    const sql = `SELECT * FROM students WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
      if (err) {
        res.status(500).send(err.message);
      } else if (!row) {
        res.status(404).send('Student not found');
      } else {
        res.json(row);
      }
      db.close();
    });
  })
  .put((req, res) => {
    const db = dbConnection();
    const id = req.params.id;
    const { firstname, lastname, gender, age } = req.body;
    const sql = `UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?`;

    db.run(sql, [firstname, lastname, gender, age, id], function(err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.json({ id, firstname, lastname, gender, age });
      }
      db.close();
    });
  })
  .delete((req, res) => {
    const db = dbConnection();
    const id = req.params.id;
    const sql = `DELETE FROM students WHERE id = ?`;

    db.run(sql, [id], function(err) {
      if (err) {
        res.status(500).send(err.message);
      } else {
        res.send(`The Student with id: ${id} has been deleted.`);
      }
      db.close();
    });
  });

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
