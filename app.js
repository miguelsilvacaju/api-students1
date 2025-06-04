const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 8001;

// Middleware para parsear application/x-www-form-urlencoded y JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Función para conectarse a la base de datos
function dbConnection() {
  return new sqlite3.Database('students.sqlite', (err) => {
    if (err) {
      console.error('Error connecting to the database:', err.message);
    }
  });
}

// GET y POST en /students
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
    if (!req.body || !req.body.firstname || !req.body.lastname || !req.body.gender || !req.body.age) {
      return res.status(400).send("Bad Request: Missing student data.");
    }

    const { firstname, lastname, gender, age } = req.body;
    const db = dbConnection();
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

// GET, PUT, DELETE en /student/:id
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
    if (!req.body || !req.body.firstname || !req.body.lastname || !req.body.gender || !req.body.age) {
      return res.status(400).send("Bad Request: Missing student data.");
    }

    const { firstname, lastname, gender, age } = req.body;
    const id = req.params.id;
    const db = dbConnection();
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

// Inicia el servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
