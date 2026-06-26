// Todo App State
const todoApp = {
    todos: [],
    stats: {
        total: 0,
        completed: 0,
        active: 0,
        completionRate: 0
    },
    currentFilter: 'all',
    currentSort: 'date-newest'
};

// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortBtn = document.querySelector('.sort-btn');
const clearBtn = document.querySelector('.clear-btn');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notificationText');

// Priority and Category
const priorityRadios = document.querySelectorAll('input[name="priority"]');
const categorySelect = document.getElementById('categorySelect');

// Stats Elements
const totalTasksEl = document.getElementById('totalTasks');
const completedTasksEl = document.getElementById('completedTasks');
const activeTasksEl = document.getElementById('activeTasks');
const completionRateEl = document.getElementById('completionRate');
const progressFill = document.getElementById('progressFill');
const categoryStatsEl = document.getElementById('categoryStats');

// Settings
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');
const darkModeToggle = document.getElementById('darkModeToggle');
const storageInfo = document.getElementById('storageInfo');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    setupEventListeners();
    updateStats();
    updateStorageInfo();
    applyTheme();
});

// Setup Event Listeners
function setupEventListeners() {
    addBtn.addEventListener('click', addTodo);
    todoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTodo();
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            todoApp.currentFilter = btn.textContent.toLowerCase().includes('all') ? 'all' :
                                   btn.textContent.toLowerCase().includes('active') ? 'active' :
                                   btn.textContent.toLowerCase().includes('completed') ? 'completed' : 'high';
            renderTodos();
        });
    });

    sortBtn.addEventListener('click', () => {
        const sortOptions = ['date-newest', 'date-oldest', 'priority-high', 'name-az'];
        const currentIndex = sortOptions.indexOf(todoApp.currentSort);
        todoApp.currentSort = sortOptions[(currentIndex + 1) % sortOptions.length];
        renderTodos();
    });

    clearBtn.addEventListener('click', clearCompleted);
    exportBtn.addEventListener('click', exportTodos);
    importBtn.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', importTodosFromFile);
    resetBtn.addEventListener('click', resetAllTodos);
    darkModeToggle.addEventListener('change', toggleTheme);
}

// Add Todo
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) {
        showNotification('Please enter a task!');
        return;
    }

    const priority = document.querySelector('input[name="priority"]:checked').value;
    const category = categorySelect.value;

    const todo = {
        id: Date.now(),
        text,
        priority,
        category,
        completed: false,
        createdAt: new Date().toISOString(),
        dueDate: null
    };

    todoApp.todos.unshift(todo);
    saveTodos();
    renderTodos();
    todoInput.value = '';
    showNotification('Task added successfully!');
    updateStats();
}

// Render Todos
function renderTodos() {
    const filtered = filterTodos();
    const sorted = sortTodos(filtered);

    todoList.innerHTML = '';

    if (sorted.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    sorted.forEach(todo => {
        const todoEl = createTodoElement(todo);
        todoList.appendChild(todoEl);
    });
}

// Create Todo Element
function createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    div.dataset.id = todo.id;

    const date = new Date(todo.createdAt);
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    div.innerHTML = `
        <div class="todo-header">
            <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
            <div class="todo-badges">
                <span class="badge-priority ${todo.priority}">${todo.priority.toUpperCase()}</span>
                <span class="badge-category">${todo.category.toUpperCase()}</span>
            </div>
            <button class="icon-btn delete" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        <div class="todo-content">
            <p class="todo-text">${escapeHtml(todo.text)}</p>
            <p class="todo-date">Created: ${dateStr}</p>
        </div>
    `;

    // Toggle Complete
    div.querySelector('.todo-checkbox').addEventListener('change', () => {
        toggleTodo(todo.id);
    });

    // Delete
    div.querySelector('.delete').addEventListener('click', () => {
        deleteTodo(todo.id);
    });

    return div;
}

// Filter Todos
function filterTodos() {
    switch(todoApp.currentFilter) {
        case 'active':
            return todoApp.todos.filter(t => !t.completed);
        case 'completed':
            return todoApp.todos.filter(t => t.completed);
        case 'high':
            return todoApp.todos.filter(t => t.priority === 'high');
        default:
            return todoApp.todos;
    }
}

// Sort Todos
function sortTodos(todos) {
    const sorted = [...todos];
    switch(todoApp.currentSort) {
        case 'date-oldest':
            return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'priority-high':
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        case 'name-az':
            return sorted.sort((a, b) => a.text.localeCompare(b.text));
        default: // date-newest
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
}

// Toggle Todo
function toggleTodo(id) {
    const todo = todoApp.todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        renderTodos();
        updateStats();
        showNotification(todo.completed ? 'Task completed! 🎉' : 'Task marked as active');
    }
}

// Delete Todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        todoApp.todos = todoApp.todos.filter(t => t.id !== id);
        saveTodos();
        renderTodos();
        updateStats();
        showNotification('Task deleted');
    }
}

// Clear Completed
function clearCompleted() {
    const completed = todoApp.todos.filter(t => t.completed).length;
    if (completed > 0 && confirm(`Delete ${completed} completed task(s)?`)) {
        todoApp.todos = todoApp.todos.filter(t => !t.completed);
        saveTodos();
        renderTodos();
        updateStats();
        showNotification('Completed tasks cleared');
    }
}

// Update Stats
function updateStats() {
    const total = todoApp.todos.length;
    const completed = todoApp.todos.filter(t => t.completed).length;
    const active = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    todoApp.stats = { total, completed, active, completionRate: rate };

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    activeTasksEl.textContent = active;
    completionRateEl.textContent = rate + '%';
    
    progressFill.style.width = rate + '%';
    progressFill.textContent = rate > 10 ? rate + '%' : '';

    updateCategoryStats();
}

// Update Category Stats
function updateCategoryStats() {
    const categories = {};
    todoApp.todos.forEach(todo => {
        categories[todo.category] = (categories[todo.category] || 0) + 1;
    });

    categoryStatsEl.innerHTML = '';
    Object.entries(categories).forEach(([category, count]) => {
        const stat = document.createElement('div');
        stat.className = 'category-stat';
        stat.innerHTML = `
            <div class="category-stat-count">${count}</div>
            <div class="category-stat-name">${category.charAt(0).toUpperCase() + category.slice(1)}</div>
        `;
        categoryStatsEl.appendChild(stat);
    });
}

// Local Storage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todoApp.todos));
    updateStorageInfo();
}

function loadTodos() {
    const saved = localStorage.getItem('todos');
    if (saved) {
        todoApp.todos = JSON.parse(saved);
        renderTodos();
    }
}

function updateStorageInfo() {
    const todos = localStorage.getItem('todos') || '[]';
    const size = (new Blob([todos]).size / 1024).toFixed(2);
    storageInfo.textContent = `Used: ${size} KB | Total tasks: ${todoApp.todos.length}`;
}

// Export Todos
function exportTodos() {
    const dataStr = JSON.stringify(todoApp.todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showNotification('Tasks exported successfully!');
}

// Import Todos
function importTodosFromFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported)) {
                todoApp.todos = imported;
                saveTodos();
                renderTodos();
                updateStats();
                showNotification('Tasks imported successfully!');
            } else {
                showNotification('Invalid file format');
            }
        } catch (err) {
            showNotification('Error importing file');
        }
    };
    reader.readAsText(file);
    importFile.value = '';
}

// Reset All Todos
function resetAllTodos() {
    if (confirm('Are you sure? This will delete ALL tasks permanently!')) {
        todoApp.todos = [];
        saveTodos();
        renderTodos();
        updateStats();
        showNotification('All tasks deleted');
    }
}

// Theme Toggle
function toggleTheme() {
    document.body.style.filter = darkModeToggle.checked ? 'invert(1)' : 'invert(0)';
    localStorage.setItem('darkMode', darkModeToggle.checked);
}

function applyTheme() {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    darkModeToggle.checked = darkMode;
    if (darkMode) {
        document.body.style.filter = 'invert(1)';
    }
}

// Notification
function showNotification(message) {
    notificationText.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Utility
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Smooth scroll for navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});