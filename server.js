const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json()); 

const db = mysql.createConnection({
  host: "localhost",
  user: "root",        
  password: "",         
  database: "login"     
});

app.post('/users', (req, res) => {
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  
  db.query(sql, [req.body.email, req.body.password], (err, data) => {
    if (err) return res.json("Error");

    if (data.length > 0) {
      const logSql = "INSERT INTO login_logs (email) VALUES (?)";
      db.query(logSql, [req.body.email], (logErr) => {
        if (logErr) {
          console.log("Failed to log login:", logErr);
        }
      });

      return res.json("Success");
    } else {
      return res.json("Failed");
    }
  });
});