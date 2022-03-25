const cTable = require('console.table');
const mysql = require('mysql2/promise');


async function main() {
  const db = await mysql.createConnection({host:'localhost', user: 'root', password: 'password', database: 'company_db'});
  const [rows, fields] = await db.query('SELECT * FROM department');
  let allDepartments = rows;

  console.log(cTable.getTable(allDepartments));

  
}

main();
