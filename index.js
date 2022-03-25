const mysql = require('mysql2/promise');
const cTable = require('console.table');
const inquirer = require('inquirer');

let choice;
let updatedDepartments;
let updatedRoles;
let updatedEmployees;
let updatedManagers;
let updatedEmptyRoles;

async function showAllDepartments () {
  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT * FROM department');
  updatedDepartments = rows;
  console.log("All Departments:");
  console.log(cTable.getTable(updatedDepartments));
  topPrompt();
}

async function showAllRoles () {
  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT * FROM role');
  updatedRoles = rows;
  console.log("All Roles:");
  console.log(cTable.getTable(updatedRoles));
  topPrompt();
};

async function showAllEmployees () {
  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT * FROM employee');
  updatedEmployees = rows;
  console.log("All Employees:");
  console.log(cTable.getTable(updatedEmployees));
  topPrompt();
};

async function showAllEmptyRoles() {
  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT role.id, title, salary FROM role LEFT JOIN employee ON role.id = employee.role_id WHERE employee.role_id IS NULL;');
  let emptyRoles = rows.map(rows => ({emptyRolesID: rows.id, emptyRolesTitle: rows.title, emptyRolesSalary: rows.salary}));

  if (emptyRoles.length == 0 ) {
    console.log("There are no empty roles.  You'll be taken to the top menu now.");
    topPrompt();
  } else {
    console.log("All Empty Roles:");
    // console.log(emptyRoles);
    console.log(cTable.getTable(emptyRoles));
    topPrompt();
  };
  
};



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


async function addDepartment() {
  await refreshLists();

  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT * FROM department');
  updatedDepartments = rows;

  

  console.log("All Departments:");
  console.log(cTable.getTable(updatedDepartments));
  topPrompt();
}


async function addRole() {

}





async function addEmployee() {
  await refreshLists();

  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT role.id, title, salary FROM role LEFT JOIN employee ON role.id = employee.role_id WHERE employee.role_id IS NULL;');
  let arrayOfPositionsToHireFor = rows.map(rows => ({name: `${rows.title}, with a salary of $${rows.salary}`, value: rows.id}));

  if (arrayOfPositionsToHireFor.length == 0 ) {
    console.log("All Positions are filled.  Fire somebody, if you need to make room for a new employee. Back to the Top!");
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

      topPrompt();

      })
};

async function deleteEmployee() {
  await refreshLists();
  
  console.log("Updated Employees list is:");
  console.log(updatedEmployees);
  console.log(cTable.getTable(updatedEmployees));

  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});

  const [rows, fields] = await db.query('SELECT * FROM employee');
  let arrayOfEmployeesToDelete = rows.map(rows => ({empID: rows.id, name:`${rows.first_name} ${rows.last_name}`, value: rows.id}));
  console.log("array from which to delete:");
  console.log(arrayOfEmployeesToDelete);
  console.log(cTable.getTable(arrayOfEmployeesToDelete));


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
      console.log(`Employee ID number ${deletedEmployeeChosenID} was deleted.  Back to the top!`);

      topPrompt();
    })
};



async function runApp(){
  await refreshLists();
  topPrompt();
};

runApp();
