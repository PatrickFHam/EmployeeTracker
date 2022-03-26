// DEPENDENCIES
const mysql = require('mysql2/promise');
const cTable = require('console.table');
const inquirer = require('inquirer');

// READY-TO-GO GOLBAL VARIABLES, will be adjusted throughout.
let choice;
let updatedDepartments;
let updatedRoles;
let updatedEmployees;
let updatedManagers;
let updatedEmptyRoles;



// FUNCTIONS WITH BASIC QUERIES, TO SHOW ALL OF SOMETHING
async function showAllDepartments () {
  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT * FROM department');
  updatedDepartments = rows;
  console.log("\nAll Departments:");
  console.log(cTable.getTable(updatedDepartments));
  topPrompt();
};

async function showAllRoles () {
  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT * FROM role');
  updatedRoles = rows;
  console.log("\nAll Roles:");
  console.log(cTable.getTable(updatedRoles));
  topPrompt();
};

async function showAllEmployees () {
  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT * FROM employee');
  updatedEmployees = rows;
  console.log("\nAll Employees:");
  console.log(cTable.getTable(updatedEmployees));
  topPrompt();
};

// FUNCTION TO SHOW ROLES THAT DON'T HAVE EMPLOYEES ASSIGNED TO THEM
async function showAllEmptyRoles() {
  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT role.id, title, salary FROM role LEFT JOIN employee ON role.id = employee.role_id WHERE employee.role_id IS NULL;');
  let emptyRoles = rows.map(rows => ({emptyRolesID: rows.id, emptyRolesTitle: rows.title, emptyRolesSalary: rows.salary}));

  if (emptyRoles.length == 0 ) {
    console.log("-----\nThere are no empty roles.\nYou'll be taken to the top menu now.\n-----");
    topPrompt();
  } else {
    console.log("All Empty Roles:");
    // console.log(emptyRoles);
    console.log(cTable.getTable(emptyRoles));
    topPrompt();
  };
  
};


// FUNCTIONS TO ADD TO THE DATABASE TABLES
async function addDepartment() {
  await refreshLists();

  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT * FROM department');
  updatedDepartments = rows;

  console.log("These are the current deparment IDs and names:");
  console.log(cTable.getTable(updatedDepartments));

  await inquirer
    .prompt([
      {
        type: 'input',
        message: "What will be the ID number of the new department (2 digits)?",
        name: "newDeptID",
        validate: function(newDeptID) {
          if (newDeptID == !NaN && Number.isInteger(newDeptID) && newDeptID < 99) {
            return true;
          } else {
            console.log("DepartmentID can only be an integer, 1-99.  Back to the top menu we go!");
            topPrompt();
          }
        }
      },
      {
        type: "input",
        message: "What is the name of the new department?",
        name: "newDeptName",
        validate: function(newDeptName) {
          if (typeof newDeptName == 'string' && newDeptName.length <30 ) {
            return true;
          } else {
            console.log("Department name can only be, at most, 30 characters.  Back to the top we go!");
            topPrompt();
          }
        }
      }
    ])
    .then(function(response){

      let objectToInsert = {
        id: response.newDeptID,
        dept_name: response.newDeptName
      };

      db.query("INSERT INTO department SET ?", objectToInsert);
      console.log("-----\nDepartment successfully added!\nBelow is the updated list of departments.\n-----");
      showAllDepartments();
    }
    )
  
};

async function addRole() {
  await refreshLists();

  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT * FROM role');
  updatedRoles = rows;

  console.log("These are the current role IDs, titles, salary, and department ID:");
  console.log(cTable.getTable(updatedRoles));

  await inquirer
    .prompt([
      {
        type: 'input',
        message: "What will be the ID number of the new role? (4 digits)",
        name: "newRoleID",
        validate: function(newRoleID) {
          if (newRoleID == !NaN && Number.isInteger(newRoleID) && newRoleID < 9999) {
            return true;
          } else {
            console.log("Role ID can only be an integer, 1-9999.  Back to the top menu we go!");
            topPrompt();
          }
        }
      },
      {
        type: 'input',
        message: "What will be the TITLE of the new department?",
        name: "newRoleTitle",
        validate: function(newRoleTitle) {
          if (typeof newRoleTitle == 'string' && newRoleTitle.length <30 ) {
            return true;
          } else {
            console.log("Role Title can only be, at most, 30 characters.  Back to the top we go!");
            topPrompt();
          }
        }
      },
      {
        type: 'input',
        message: "What will be the SALARY of the new role? (no commas or $ sign, 5-digit integer, or 7-digit 2-decimal)",
        name: "newRoleSalary",
        validate: function(newRoleSalary) {
          if (newRoleSalary == !NaN && newRoleSalary > 0 && newRoleSalary <= 99999.99) {
            return true;
          } else {
            console.log("Salary can only be an number, 0 - 99999.99.    Back to the top menu we go!");
            topPrompt();
          }
        }
      },
      {
        type: "input",
        message: "What is the new role's DEPARTMENT ID NUMBER? (2 digits)",
        name: "newRoleDeptID",
        validate: function(newRoleDeptID) {
          if (newRoleDeptID == !NaN && Number.isInteger(newRoleDeptID) && newRoleDeptID < 99) {
            return true;
          } else {
            console.log("Department ID can only be an integer, 1-99.  Back to the top menu we go!");
            topPrompt();
          }
        }
      }
    ])
    .then(function(response){

      let objectToInsert = {
        id: response.newRoleID,
        title: response.newRoleTitle,
        salary: response.newRoleSalary,
        dept_id: response.newRoleDeptID
      };

      db.query("INSERT INTO role SET ?", objectToInsert);
      console.log("-----\nRole successfully added!\nBelow is the updated list of roles.\n-----");
      showAllRoles();
    }
    )
  
};

async function addEmployee() {
  await refreshLists();

  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT role.id, title, salary FROM role LEFT JOIN employee ON role.id = employee.role_id WHERE employee.role_id IS NULL;');
  let arrayOfPositionsToHireFor = rows.map(rows => ({name: `${rows.title}, with a salary of $${rows.salary}`, value: rows.id}));

  if (arrayOfPositionsToHireFor.length == 0 ) {
    console.log("\n-----\nAll Positions are filled.\nYou'll need to fire (aka, 'delete') somebody, to make room for a new employee.\nThe budget isn't unlimited, you know!\nBack to the top menu you go!\n-----\n");
    topPrompt();
  };

  const [managersRows, managersFields] = await db.query('SELECT first_name, last_name, role_id FROM employee WHERE (role_id IN (SELECT manager_id FROM employee));');
  let managersRoleIDToAssignNewHire = managersRows.map(managersRows => ({name: `${managersRows.first_name} ${managersRows.last_name}`, value: managersRows.role_id}));

  await inquirer
    .prompt([
      {
        type: "list",
        message: "What is the new employee's TITLE?",
        name: "roleID",
        choices: arrayOfPositionsToHireFor
      },
      {
        type: 'input',
        message: "What is the new employee's FIRST NAME?",
        name: "empFirstName",
        validate: function(empFirstName) {
          if (typeof empFirstName == 'string' && empFirstName.length <30 ) {
            return true;
          } else {
            console.log("Names can only be, at most, 30 characters.  Back to the top we go!");
            topPrompt();
          }
        }
      },
      {
        type: "input",
        message: "What is the new employee's LAST NAME?",
        name: "empLastName",
        validate: function(empLastName) {
          if (typeof empLastName == 'string' && empLastName.length <30 ) {
            return true;
          } else {
            console.log("Names can only be, at most, 30 characters.  Back to the top we go!");
            topPrompt();
          }
        }
      },
      {
        type: "list",
        message: "Who is the employee's MANAGER?",
        name: "empManagerRoleID",
        choices: managersRoleIDToAssignNewHire
      }
    ]).then(function (response) {
      
      let objectToInsert = {
        first_name: `${response.empFirstName}`,
        last_name: `${response.empLastName}`,
        role_id: `${response.roleID}`,
        manager_id: `${response.empManagerRoleID}`};
      
      db.query("INSERT INTO employee SET ?", objectToInsert);
      console.log("-----\nEmployee successfully added!\nBelow is the updated list of employees.\n-----");
      showAllEmployees();
      })
};


// FUNCTION TO REMOVE EMPLOYEE FROM THAT TABLE
async function deleteEmployee() {
  await refreshLists();

  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});

  const [rows, fields] = await db.query('SELECT * FROM employee');
  let arrayOfEmployeesToDelete = rows.map(rows => ({empID: rows.id, name:`${rows.first_name} ${rows.last_name}`, value: rows.id}));

  await inquirer
    .prompt([
      {
        type: "list",
        message: "Which employee would you like to DELETE?",
        name: "deletedEmployee",
        choices: arrayOfEmployeesToDelete
      }
    ]).then(function (response) {
      console.log(response)

      let deletedEmployeeChosenID = response.deletedEmployee;

      db.query("DELETE FROM employee WHERE employee.id = ?", deletedEmployeeChosenID);
      console.log("-----\nEmployee successfully deleted!\nBelow is the updated list of employees.\n-----");
      showAllEmployees();
    })
};




// KEEPS THESE LISTS WITH UPDATED DATA
async function refreshLists() {
  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  
  // Updated Departments
  const [deptRows, deptFields] = await db.query('SELECT * FROM department');
  updatedDepartments = deptRows.map(deptRows => ({deptID: deptRows.id, deptName: deptRows.dept_name}));

  // Updated Roles
  const [rolesRows, rolesFields] = await db.query('SELECT * FROM role');
  updatedRoles = rolesRows.map(rolesRows => ({roleID: rolesRows.id, roleTitle: rolesRows.title, roleSalary: rolesRows.salary, roleDeptID: rolesRows.dept_id}));
  
  // Updated Employees
  const [empRows, empFields] = await db.query('SELECT * FROM employee');
  updatedEmployees = empRows.map(empRows => ({empID: empRows.id, empFirstName: empRows.first_name, empLastName: empRows.last_name, empRoleID: empRows.role_id, empManagerID: empRows.manager_id}));

// Updated Managers
  const [managersRows, managersFields] = await db.query('SELECT first_name, last_name, id FROM employee WHERE (role_id IN (SELECT manager_id FROM employee));');
  updatedManagers = managersRows.map(managersRows => ({managersID: managersRows.id, managersFirstName: managersRows.first_name, managersLastName: managersRows.last_name}));
  
  // Updated Empty Roles
  const [emptyRolesRows, emptyRolesFields] = await db.query('SELECT title, salary, role.id FROM role LEFT JOIN employee ON role.id = employee.role_id WHERE employee.role_id IS NULL;');
  updatedEmptyRoles = emptyRolesRows.map(emptyRolesRows => ({emptyRolesID: emptyRolesRows.id, emptyRolesTitle: emptyRolesRows.title, emptyRolesSalary: emptyRolesRows.salary}));

  return
};



// MAIN USER PROMPT
function topPrompt() {
  inquirer
    .prompt([
      {
        type: 'list',
        message: 'Which would you like to do?',
        name: 'showWhichGroup',
        choices: ['Show All Departments', 'Show All Roles', 'Show All Employees', 'Show All Empty Roles', 'Add an Employee', "Delete an Employee", "Add a Department", "Add a Role"]
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
        case "Add a Department":
          addDepartment();
          break;
        case "Add a Role":
          addRole();
          break;
      }
    });
};

// UPDATES THE LISTS BEFORE RUNNING THE INITIAL USER PROMPT
async function runApp(){
  await refreshLists();
  topPrompt();
};

// FUNCTION TO RUN UPON FILE LOAD
runApp();
