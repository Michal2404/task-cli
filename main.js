#!/usr/bin/env node
// Pull in Node's standard libraries for file access and path manipulation
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import os from "os";

// Construct DB_PATH to point to our tasks.json
function dataDir() {
  const base = process.env.XDG_DATA_HOME || join(os.homedir(), ".local", "share");
  const dir = join(base, "task-cli");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
}
const DB_PATH = join(dataDir(), "tasks.json");

// Allowed values for a task's status.
const STATUSES = new Set(["todo", "in-progress", "done"]);

// Produces stable ISO timestamps for createdAT / updatedAT
function now() { return new Date().toISOString(); }

// Ensures tasks.json exists (creates [] if missing)
// Reads & parses it, and hard-fails with a helpful message if corrupt
function loadDB() {
  if (!existsSync(DB_PATH)) writeFileSync(DB_PATH, "[]", "utf8");
  const raw = readFileSync(DB_PATH, "utf8");
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) throw new Error("DB not an array");
    return data;
  } catch {
    console.error("Error reading tasks.json. Is it valid JSON?");
    process.exit(1);
  }
}

// Saves the array to DB
function saveDB(tasks) {
  writeFileSync(DB_PATH, JSON.stringify(tasks, null, 2) + "\n", "utf8");
}

function nextId(tasks) {
  return tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
}

// Pretty prints
function printTasks(tasks) {
  if (!tasks.length) return console.log("No tasks found.");
  console.log("ID  | Status       | Description");
  console.log("----+--------------+----------------------------");
  for (const t of tasks) {
    const status = t.status.padEnd(12, " ");
    console.log(String(t.id).padEnd(3, " ") + " | " + status + " | " + t.description);
  }
}

// Addind task
function addTask(desc) {
  if (!desc) { console.error("Usage: add 'description'"); process.exit(1); }
  const tasks = loadDB();
  const task = {
    id: nextId(tasks),
    description: desc,
    status: "todo",
    createdAt: now(),
    updatedAt: now(),
  }
  tasks.push(task);
  saveDB(tasks);
  console.log(`Task added successfully (ID: ${task.id})`);
}

function updateTask(id, desc) {
  const tasks = loadDB();
  const task = tasks.find(t => t.id == id);
  if (!task) { console.error(`Task ${id} not found.`); process.exit(1); }
  if (!desc) { console.error("Usage: update <id> \"new description\""); process.exit(1); }
  task.description = desc;
  task.updatedAt = now();
  saveDB(tasks);
  console.log(`Updated task ${id}`);
}

function deleteTask(id) {
  const tasks = loadDB();
  const idx = tasks.findIndex(t => t.id == id);
  if (idx === -1) { console.error(`Task ${id} not found.`); process.exit(1); }
  tasks.splice(idx, 1);
  saveDB(tasks);
  console.log(`Deleted task ${id}`);
}

function setStatus(id, status) {
  const tasks = loadDB();
  const task = tasks.find(t => t.id == id);
  if (!task) { cosole.error(`Task ${id} not found.`); process.exit(1); }
  if (!STATUSES.has(status)) { console.error(`Invalid status: ${status}`); process.exit(1); }
  task.status = status;
  task.updatedAt = now();
  saveDB(tasks);
  console.log(`Marked task ${id} as ${status}.`);
}

function listTasks(filter) {
  const tasks = loadDB();
  let filtered = tasks;
  if (filter) {
    if (!STATUSES.has(filter)) {
      console.error("Unkown list filter: " + filter + ". Use: todo | in-progress | done");
      process.exit(1);
    }
    filtered = tasks.filter(t => t.status === filter);
  }
  printTasks(filtered);
}

function parseId(str) {
  const id = Number(str);
  if (!Number.isSafeInteger(id) || id <= 0) {
    console.error("ID must be a positive integer.");
    process.exit(1);
  }
  return id;
}

const [, , cmd, ...rest] = process.argv;
// Routing the CLI controller
switch (cmd) {
  case "add": {
    const desc = rest.join(" ").trim().replace(/^"|"$/g, "");
    addTask(desc);
    break;
  }
  case "update": {
    const id = parseId(rest[0]);
    const desc = rest.slice(1).join(" ").trim().replace(/^"|"$/g, "");
    updateTask(id, desc);
    break;
  }
  case "delete": {
    const id = parseId(rest[0]);
    deleteTask(id);
    break;
  }
  case "mark-todo": {
    const id = parseId(rest[0]);
    setStatus(id, "todo");
    break;
  }
  case "mark-in-progress": {
    const id = parseId(rest[0]);
    setStatus(id, "in-progress");
    break;
  }
  case "mark-done": {
    const id = parseId(rest[0]);
    setStatus(id, "done");
    break;
  }
  case "list": {
    const filter = (rest[0] || "").toLowerCase();
    listTasks(filter || undefined);
    break;
  }
  case undefined:
  case "help":
  default: {
    console.log(`Task Tracker CLI
Usage:
  node main.js add "description"
  node main.js update <id> "new description"
  node main.js delete <id>
  node main.js mark-in-progress <id>
  node main.js mark-done <id>
  node main.js list [todo|in-progress|done]
`);
  }
}


