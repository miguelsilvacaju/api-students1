const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const port = 8001;

// Middleware para soportar JSON y form-data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Función para conectar a la base de datos
function db_connection() {
  const db = new sqlite3.Database("students.sqlite", (err) => {
    if (err) {
      console.error("Database connection error:", err.message);
    }
  });
  return db;
}

// Ruta para GET y POST de todos los estudiantes
app.route("/students")
  .get((req, res) => {
    const conn = db_connection();
    conn.all("SELECT * FROM students", [], (err, rows) => {
      if (err) {
        res.status(500).send("Database error");
        return;
      }
      const students = rows.map(row => ({
        id: row.id,
        firstname: row.firstname,
        lastname: row.lastname,
        gender: row.gender,
        age: row.age
      }));
      res.json(students);
    });
  })
  .post((req, res) => {
    const { firstname, lastname, gender, age } = req.body;

    if (!firstname || !lastname || !gender || !age) {
      return res.status(400).send("Bad Request: Missing student data.");
    }

    const conn = db_connection();
    const sql = "INSERT INTO students (firstname, lastname, gender, age) VALUES (?, ?, ?, ?)";
    conn.run(sql, [firstname, lastname, gender, age], function (err) {
      if (err) {
        return res.status(500).send("Error inserting student.");
      }
      res.send(`Student with id: ${this.lastID} created successfully`);
    });
  });

// Ruta para operaciones sobre un estudiante individual
app.route("/student/:id")
  .get((req, res) => {
    const conn = db_connection();
    const id = req.params.id;
    conn.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {
      if (err) {
        return res.status(500).send("Database error.");
      }
      if (!row) {
        return res.status(404).send("Student not found.");
      }
      res.json(row);
    });
  })
  .put((req, res) => {
    const { firstname, lastname, gender, age } = req.body;
    const id = req.params.id;

    if (!firstname || !lastname || !gender || !age) {
      return res.status(400).send("Bad Request: Missing student data.");
    }

    const conn = db_connection();
    const sql = "UPDATE students SET firstname = ?, lastname = ?, gender = ?, age = ? WHERE id = ?";
    conn.run(sql, [firstname, lastname, gender, age, id], function (err) {
      if (err) {
        return res.status(500).send("Error updating student.");
      }
      res.json({ id, firstname, lastname, gender, age });
    });
  })
  .delete((req, res) => {
    const id = req.params.id;
    const conn = db_connection();
    const sql = "DELETE FROM students WHERE id = ?";
    conn.run(sql, [id], function (err) {
      if (err) {
        return res.status(500).send("Error deleting student.");
      }
      res.send(`The Student with id: ${id} has been deleted.`);
    });
  });

// Iniciar el servidor
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});
