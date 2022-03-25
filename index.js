const mysql = require('mysql2');
const promMysql = require ('mysql2/promise');
const cTable = require('console.table');
const inquirer = require('inquirer');

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

function showAllDepartments () {
  db.query('SELECT * FROM department', function (err, results) {
    if (err) {console.log(err)} else {
    let showResults = results;
    console.log("  \nAll Departments are Shown Below:");
    console.log(cTable.getTable(showResults));
    topPrompt();
    }
  });
};

function showAllRoles () {
  db.query('SELECT * FROM role', function (err, results) {
    if (err) {console.log(err)} else {
    let showResults = results;
    console.log("  \nAll Roles are Shown Below:");
    console.log(cTable.getTable(showResults));
    topPrompt();
    }
  });
};

function showAllEmployees () {
  db.query('SELECT * FROM employee', function (err, results) {
    if (err) {console.log(err)} else {
    let showResults = results;
    console.log("  \nAll Employees are Shown Below:");
    console.log(cTable.getTable(showResults));
    topPrompt();
    }
  });
};

function refreshLists() {
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
    updatedManagers = res.map(managers => ({ name: `${managers.first_name} ${managers.last_name}`, value: managers.id }));
    // console.log(cTable.getTable(updatedManagers));
  });

  db.query("SELECT title, salary, role.id FROM role LEFT JOIN employee ON role.id = employee.role_id WHERE employee.role_id IS NULL;", function (error, res) {
    updatedEmptyRoles = res.map(emptyRoles => ({ name: `${emptyRoles.title} with salary of ${emptyRoles.salary}`, value: emptyRoles.role.id }));
    // console.log(cTable.getTable(updatedEmptyRoles));
  })

  return
};


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
          showAllDepartments();
          break;
        case "Show All Roles":
          showAllRoles();
          break;
        case "Show All Employees":
          showAllEmployees();
          break;
        case "Show All Empty Roles":
          showAllEmptyRoles();
          break;
        case "Add an Employee":
          addEmployee();
          break;
        case "Delete an Employee":
          deleteEmployee();
          break;
      }
    });
};


/* async function addDepartment() {

}


async function addRole() {

} */


function showAllEmptyRoles() {
  db.query('SELECT role.id, title, salary FROM role LEFT JOIN employee ON role.id = employee.role_id WHERE employee.role_id IS NULL;', function (err, results) {
    if (err) {console.log(err)} else {
    updatedEmptyRoles = results;
    
    if (updatedEmptyRoles.length == 0) {
      console.log("There are no empty roles.  \nReturning you back to the top-menu.");
      return topPrompt();
    } else {
    
    console.log("  \nAll EMPTY Roles are Shown Below:");
    console.log(cTable.getTable(updatedEmptyRoles));
    topPrompt();
    }}
  });
};


async function addEmployee() {
  
  console.log("addEmployee chosen")
  console.log("next will be to run refreshEmptyRolesArray")
  await refreshEmptyRolesArray();

  console.log("right before add employee prompts, updatedEmptyRoles array is: ")
  console.log(updatedEmptyRoles);
  console.log(cTable.getTable(updatedEmptyRoles));

  await inquirer
    .prompt([
      {
        type: "list",
        message: "What is the new employee's TITLE?",
        name: "roleID",
        choices: updatedEmptyRoles
      },
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
        message: "Who is the employee's MANAGER?",
        name: "empManagerID",
        choices: updatedManagers
      }
    ]).then(function (response) {
      // console.log(response)
      console.log(response);
      // let roleID = 

      db.query("INSERT INTO employee SET ?",
        {
          first_name: response.empFirstName,
          last_name: response.empLastName,
          role_id: response.roleID,
          manager_id: response.empManagerID
        });
      
      topPrompt();
    })
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
};


/* function updateEmployeeRole () {

} */



function runApp(){
  refreshLists();
  topPrompt();
};

runApp();
