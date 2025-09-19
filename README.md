# task-cli 📝

A simple command-line task tracker written in Node.js.  
Manage your tasks directly from the terminal — add, list, update, mark as done, and delete them.

---

## Features

- Add new tasks  
- List all tasks with IDs, status, and descriptions  
- Mark tasks as **done** or move them **in-progress**  
- Delete tasks  
- Stores everything in a local `tasks.json` file  
- Runs globally as `task-cli` once installed  

---

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Michal2404/task-cli.git
   cd task-cli
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Make the CLI globally available:**
   ```bash
   npm install -g .
   ```

4. **Verify installation:**
   ```bash
   task-cli --help
   ```

---

## Usage

```bash
task-cli add "Buy groceries"       # Add a new task
task-cli list                      # List all tasks
task-cli mark-in-progress 1        # Mark task 1 as in-progress
task-cli mark-done 1               # Mark task 1 as done
task-cli delete 1                  # Delete task 1
```

---

## Example

```bash
$ task-cli add "Write documentation"
Task added successfully (ID: 1)

$ task-cli list
ID  | Status       | Description
----+--------------+-------------------------
1   | todo         | Write documentation

$ task-cli mark-done 1
Marked task 1 as done

$ task-cli list
ID  | Status       | Description
----+--------------+-------------------------
1   | done         | Write documentation
```

---

## Uninstall

```bash
npm uninstall -g task-cli
```
