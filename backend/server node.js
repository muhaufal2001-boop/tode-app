const app = express();
app.use(cors());
app.use(bodyParser.json());

/// Koneksi ke Database MySQL
const db = mysql.createConnection({
    host: 'Localhost',
    port: '3306',
    user: 'root',
    password: 'root',
    database: 'praktikum_web',
})

db.connect((err) => {
    if (err) {
        console.error('error connecting to mysql:', err);
    } else {
        console.log('connected to mysql');
    }
});

// routes
app.get('/students', (req, res) => {
    db.query('SELECT * FROM students', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results)
    });
});

app.post('/students', (req, res) => {
    console.log("request body:", req.body);
    const { nim, name } = req.body;

    if (!nim || !name) {
        console.error('missing fields in request body');
        return res.status(400).json({ error: 'NIM and Name are required' });
    
    }

    db.query('INSERT INTO students (nim, name) VALUES (?, ?)', [nim, name], (err, results) => {
        if (err) {
            console.error('error inserting student:', err);
            return res.status(500).json({ error: "database error", details: err.message });

        }

        res.status(201).json({ message: 'Student added successfully', studentId: results.insertId });
    });
});

app.put('/students/:id', (req, res) => {
    const { id } = req.params;
    const { name, age, major } = req.body;
    if (!nim || !name) {
        return res.status(400).json({ error: 'NIM and Name are required' });
    }
    db.query('UPDATE students SET nim = ?, name = ? WHERE id = ?', [nim, name, id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id , nim, name });
    });
});

app.delete('/students/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM students WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Student deleted successfully' });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
