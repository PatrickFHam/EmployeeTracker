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
/* db.query('SELECT * FROM department', function (err, results) {
  if (err) {console.log(err)} else {
  const showResults = results;
  console.log("  \nAll Departments are Shown Below:");
  console.log(cTable.getTable(showResults));
  }
}); */

async function showAllDepartments () {
  db.query('SELECT * FROM department', function (err, results) {
    if (err) {console.log(err)} else {
    let showResults = results;
    console.log("  \nAll Departments are Shown Below:");
    console.log(cTable.getTable(showResults));
    return cTable.getTable(showResults);
    }
  });
}

async function showAllRoles () {
  db.query('SELECT * FROM role', function (err, results) {
    if (err) {console.log(err)} else {
    let showResults = results;
    console.log("  \nAll Roles are Shown Below:");
    console.log(cTable.getTable(showResults));
    return showResults;
    }
  });
}

async function showAllEmployees () {
  db.query('SELECT * FROM employee', function (err, results) {
    if (err) {console.log(err)} else {
    let showResults = results;
    console.log("  \nAll Employees are Shown Below:");
    console.log(cTable.getTable(showResults));
    return showResults;
    }
  });
}



inquirer
  .prompt([
    /* {
      type: 'input',
      name: 'name',
      message: 'What is your name?',
    },
    {
      type: 'checkbox',
      message: 'What languages do you know?',
      name: 'stack',
      choices: ['HTML', 'CSS', 'JavaScript', 'MySQL'],
    }, */
    {
      type: 'list',
      message: 'Which would you like to do?',
      name: 'showWhichGroup',
      choices: ['Show All Departments', 'Show All Roles', 'Show All Employees'],
    },
  ])
  .then((data) => {
    console.log(data);
    let choice = data.showWhichGroup;
    switch (choice) {
      case "Show All Departments":
        return showAllDepartments();
      case "Show All Roles":
        return showAllRoles();
      case "Show All Employees":
        return showAllEmployees();
    }
  });



// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
