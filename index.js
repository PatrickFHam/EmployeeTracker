const express = require('express');
const mysql = require('mysql2');
const cTable = require('console.table');
const inquirer = require('inquirer');
const fs = require('fs');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'company_db'
  },
  console.log(`Connected to the company_db database.`)
);

/* 
let deletedRow = 2;

db.query('DELETE FROM favorite_books WHERE id = ?', deletedRow, (err, result) => {
  if (err) {
    console.log(err);
  }
  console.log(result);
}); */

// query to VIEW ALL DEPARTMENTS
db.query('SELECT * FROM department', function (err, results) {
  if (err) {console.log(err)} else {
  const showResults = results;
  console.log("  \nAll Departments are Shown Below:");
  console.log(cTable.getTable(showResults));
  }
});

/* inquirer
  .prompt([
    {
      type: 'input',
      name: 'name',
      message: 'What is your name?',
    },
    {
      type: 'checkbox',
      message: 'What languages do you know?',
      name: 'stack',
      choices: ['HTML', 'CSS', 'JavaScript', 'MySQL'],
    },
    {
      type: 'list',
      message: 'What is your preferred method of communication?',
      name: 'contact',
      choices: ['email', 'phone', 'telekinesis'],
    },
  ])
  .then((data) => {
    console.log(data.name);
    console.log(data.stack);
    console.log(data.contact);
  });
 */


// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
