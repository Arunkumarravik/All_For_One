function addTask() {
  const list = document.getElementById("todoList");

  const item = document.createElement("div");
  item.className = "todo-item";

  item.innerHTML = `
    <input type="checkbox" onchange="toggleComplete(this)">
    <input type="text" placeholder="Task..." />
    <input type="text" placeholder="30 min" />
    <button class="submit-btn" onclick="submitTask(this)">Submit</button>
  `;

  list.appendChild(item);
}

function toggleComplete(cb) {
  cb.parentElement.classList.toggle("completed");
}

function submitTask(btn) {
  btn.textContent = "Done";
  btn.disabled = true;
}
