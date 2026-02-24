let todos = [];
let currentFilter = 'all';

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js')
    .then(() => {
      updateStatus('Online (PWA ready)');
    })
    .catch(() => {
      updateStatus('Service Worker not available');
    });
}

// Listen for online/offline
window.addEventListener('online', () => {
  updateStatus('Back online');
});

window.addEventListener('offline', () => {
  updateStatus('Offline mode');
});

// Load todos from localStorage on page load
function initApp() {
  const saved = localStorage.getItem('todos');
  if (saved) {
    todos = JSON.parse(saved);
  }
  render();
  updateStatus('Ready');
}

// Add a new todo
function addTodo() {
  const input = document.getElementById('todoInput');
  const text = input.value.trim();

  if (!text) return;

  const todo = {
    id: Date.now(),
    text: text,
    completed: false
  };

  todos.unshift(todo);
  saveTodos();
  render();
  input.value = '';
  input.focus();
}

// Toggle todo completion
function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    render();
  }
}

// Delete a todo
function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id);
  saveTodos();
  render();
}

// Filter todos
function filterTodos(filter) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  event.target.classList.add('active');
  render();
}

// Clear all completed todos
function clearCompleted() {
  todos = todos.filter(t => !t.completed);
  saveTodos();
  render();
}

// Get filtered todos based on current filter
function getFilteredTodos() {
  if (currentFilter === 'active') {
    return todos.filter(t => !t.completed);
  }
  if (currentFilter === 'completed') {
    return todos.filter(t => t.completed);
  }
  return todos;
}

// Render the todo list
function render() {
  const list = document.getElementById('todoList');
  const filtered = getFilteredTodos();

  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state">No todos here. Add one to get started!</div>';
  } else {
    list.innerHTML = filtered.map(todo => `
      <li class="todo-item ${todo.completed ? 'completed' : ''}">
        <input 
          type="checkbox" 
          class="todo-checkbox" 
          ${todo.completed ? 'checked' : ''}
          onchange="toggleTodo(${todo.id})"
        >
        <span class="todo-text">${escapeHtml(todo.text)}</span>
        <button class="todo-delete" onclick="deleteTodo(${todo.id})">Delete</button>
      </li>
    `).join('');
  }

  updateCount();
}

// Update the count of active todos
function updateCount() {
  const active = todos.filter(t => !t.completed).length;
  const completed = todos.filter(t => t.completed).length;
  const total = todos.length;
  document.getElementById('todoCount').textContent =
    active === 1 ? '1 item left' : `${active} items left`;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statActive').textContent = active;
  document.getElementById('statDone').textContent = completed;
}

// Update status message
function updateStatus(message) {
  document.getElementById('status').textContent = message;
}

// Save todos to localStorage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Allow Enter key to add todo
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  document.getElementById('todoInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      addTodo();
    }
  });
});
