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

let choice;
let updatedDepartments;
let updatedRoles;
let updatedEmployees;
let updatedManagers;
let updatedEmptyRoles;

/* db.connect(function (err) {
  if (err) {
    console.error(err);
    return;
  }
  
  db.query("SELECT * from department", function (error, res) {
    updatedDepartments = res.map(departments => ({ name: departments.name, value: departments.id }))
  })

  db.query("SELECT * from role", function (error, res) {
    updatedRoles = res.map(roles => ({ name: roles.title, value: roles.id }))
  })

  db.query("SELECT * from employee", function (error, res) {
    // console.log(error, res);
    updatedEmployees = res.map(employees => ({ name: `${employees.first_name} ${employees.last_name}`, value: employees.id }))
  })
  
  initialPrompt();
}) */


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

function showAllDepartments () {
  db.query('SELECT * FROM department', function (err, results) {
    if (err) {console.log(err)} else {
    let showResults = results;
    console.log("  \nAll Departments are Shown Below:");
    console.log(cTable.getTable(showResults));
    topPrompt();
    }
  });
}

function showAllRoles () {
  db.query('SELECT * FROM role', function (err, results) {
    if (err) {console.log(err)} else {
    let showResults = results;
    console.log("  \nAll Roles are Shown Below:");
    console.log(cTable.getTable(showResults));
    topPrompt();
    }
  });
}

function showAllEmployees () {
  db.query('SELECT * FROM employee', function (err, results) {
    if (err) {console.log(err)} else {
    let showResults = results;
    console.log("  \nAll Employees are Shown Below:");
    console.log(cTable.getTable(showResults));
    topPrompt();
    }
  });
}

async function refreshLists() {
  db.query("SELECT * from department", function (error, res) {
    updatedDepartments = res.map(departments => ({ name: departments.name, value: departments.id }))
  });

  db.query("SELECT * from role", function (error, res) {
    updatedRoles = res.map(roles => ({ name: roles.title, value: roles.id }));
    // console.log(cTable.getTable(updatedRoles));
  });

  db.query("SELECT * from employee", function (error, res) {
    // console.log(error, res);
    updatedEmployees = res.map(employees => ({ name: `${employees.first_name} ${employees.last_name}`, value: employees.id }))
    // console.log(cTable.getTable(updatedEmployees));
  });

  db.query("SELECT first_name, last_name, id FROM employee WHERE (role_id IN (SELECT manager_id FROM employee));", function (error, res) {
    updatedManagers = res.map(managers => ({ name: `${managers.first_name} ${managers.last_name}`, value: managers.id}));
    // console.log(cTable.getTable(updatedManagers));
  });

  db.query("SELECT role.id, title, salary FROM role LEFT JOIN employee ON role.id = employee.role_id WHERE employee.role_id IS NULL;", function (error, res) {
    updatedEmptyRoles = res.map(emptyRoles => ({ id: `${emptyRoles.id}`, title: `${emptyRoles.title}`, salary: `${emptyRoles.salary}`, value: emptyRoles.role.id}));
    console.log(cTable.getTable(updatedEmptyRoles));
  })
  return
}


function topPrompt() {
  inquirer
    .prompt([
      {
        type: 'list',
        message: 'Which would you like to do?',
        name: 'showWhichGroup',
        choices: ['Show All Departments', 'Show All Roles', 'Show All Employees', 'Show All Empty Roles', 'Add an Employee', "Delete an Employee"]
      },
    ])
    .then((data) => {
      choice = data.showWhichGroup;
      switch (choice) {
        case "Show All Departments":
          return showAllDepartments();
        case "Show All Roles":
          return showAllRoles();
        case "Show All Employees":
          return showAllEmployees();
        case "Show All Empty Roles":
          return showAllEmptyRoles();
        case "Add an Employee":
          return addEmployee();
        case "Delete an Employee":
          return deleteEmployee();
      }
    });
}


/* async function addDepartment() {

}


async function addRole() {

} */


function showAllEmptyRoles() {
  db.query('SELECT role.id, title, salary FROM role LEFT JOIN employee ON role.id = employee.role_id WHERE employee.role_id IS NULL;', function (err, results) {
    if (err) {console.log(err)} else {
    updatedEmptyRoles = results;
    console.log("  \nAll EMPTY Roles are Shown Below:");
    console.log(cTable.getTable(updatedEmptyRoles));
    topPrompt();
    }
  });
};


function addEmployee() {
  inquirer
    .prompt([
      {
        type: 'input',
        message: "What is the new employee's FIRST NAME?",
        name: "empFirstName"
      },
      {
        type: "input",
        message: "What is the new employee's LAST NAME?",
        name: "empLastName"
      },
      {
        type: "list",
        message: "What is the new employee's TITLE?",
        name: "roleTitle",
        choices: updatedEmptyRoles
      },
      {
        type: "list",
        message: "Who is the employee's MANAGER?",
        name: "empManager",
        choices: updatedManagers
      }
    ]).then(function (response) {
      // console.log(response)
      console.log(response);
      // let roleID = 

      /* db.query("INSERT INTO employee SET ?",
        {
          first_name: response.empFirstName,
          last_name: response.empLastName,
          role_id: response.roleTitle,
          manager_id: response.empManager
        }) */
    });
    topPrompt();
  };


function deleteEmployee() {
  inquirer
    .prompt([
      {
        type: "list",
        message: "Which employee would you like to DELETE?",
        name: "deletedEmployee",
        choices: updatedEmployees
      }
    ]).then(function (response) {
      // console.log(response)

      deletedEmployeeChosenID = response.deletedEmployee;

      db.query("DELETE FROM employee WHERE employee.id = ?", deletedEmployeeChosenID);

      db.query("SELECT * from employee", function (error, res) {
        // console.log(error, res);
        updatedEmployees = res.map(employees => ({ name: `${employees.first_name} ${employees.last_name}`, value: employees.id }))
        // console.log(cTable.getTable(updatedEmployees));
      });

      topPrompt();
    })
}


/* async function updateEmployeeRole () {

} */



function runApp(){
  refreshLists();
  topPrompt();
};

runApp();

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
