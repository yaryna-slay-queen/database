import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: `${process.env.DB_URL}`,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function initDatabase() {
  console.log("Initializing database...");

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS animatronics(
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    age INT NOT NULL,
    type TEXT DEFAULT 'Animatronic with indefined referance',       
    role TEXT DEFAULT 'Musician animatronic',                
    generation TEXT, 
    night_of_activation INT NOT NULL,                
    level_of_danger TEXT,
    special_notes VARCHAR(50)
);
    `;
  try {
    const res = await pool.query(createTableQuery);
    console.log("the animatronics' table is checked");
  } catch (err) {
    console.error("Error initializing database:", err.message);
    console.error("Full error:", err);
    throw err;
  }
}

async function addAnimatronic(
  name,
  age,
  type,
  role,
  generation,
  night,
  danger,
  notes,
) {
  const query = `
        INSERT INTO animatronics (
            name, age, type, role, generation, 
            night_of_activation, level_of_danger, special_notes
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`;

  const values = [name, age, type, role, generation, night, danger, notes];
  try {
    const res = await pool.query(query, values);
    console.log("The animatronic is added! Check the table!");
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function showAll() {
  const res = await pool.query("SELECT * FROM animatronics ORDER BY id ASC");
  console.log("the whole list of animatronics:");
  console.table(res.rows);
}

async function deleteAnimatronic(id) {
  await pool.query("DELETE FROM animatronics WHERE id = $1", [id]);
  console.log(`The animatronic with ID ${id} is deleted from the database.`);
}

// async function run() {
//   try {
//     await initDatabase();
//     console.log("Animatronics are running...");

//     console.log("Adding new ones...");
//     await addAnimatronic();

//     await deleteAnimatronic();

//     await showAll();

//     const res = await pool.query("SELECT NOW()");
//   } catch (err) {
//     console.error("Failed to start application:", err);
//   }
// }
// run();

function getArgv() {
  const args = {};
  for (let i = 3; i < process.argv.length; i += 2) {
    const key = process.argv[i];
    const value = process.argv[i + 1];
    if (key && value) {
      args[key] = value;
    }
  }
  return args;
}

const command = process.argv[2];

async function run() {
  try {
    await initDatabase();

    switch (command) {
      case "list":
        await showAll();
        break;

      case "add":
        const argv = getArgv();
        await addAnimatronic(
          argv.name,
          parseInt(argv.age),
          argv.type,
          argv.role,
          argv.gen,
          parseInt(argv.night),
          argv.danger,
          argv.notes,
        );
        break;

      case "delete":
        const id = process.argv[3];
        if (id !== null || id !== indefined) {
          await deleteAnimatronic(id);
        } else {
          console.log("Please provide a valid ID: node filename.js delete 1");
        }
        break;

      default:
        console.log("Available commands: node filename.js list");
        console.log("node filename.js delete [id]");
        console.log(
          'node filename.js node dbfnfgp.js add name ["value"] age [value] type [value] role [value] gen [value] night [value] danger [value] notes ["value"]',
        );
    }
  } catch (err) {
    console.error("Failed to start application:", err);
  } finally {
    await pool.end();
  }
}

run();
