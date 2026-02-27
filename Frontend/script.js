const API_BASE = "http://localhost:5000/api";
let token = localStorage.getItem("token");
const loginNavBtn = document.getElementById("loginNavBtn");
const authContainer = document.getElementById("authContainer");
const todoContainer = document.getElementById("todoContainer");
const authBtn = document.getElementById("authBtn");
const logoutBtn = document.getElementById("logoutBtn");
const toggleAuth = document.getElementById("toggleAuth");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const welcomeMsg = document.getElementById("welcomeMsg");

const taskInput = document.getElementById("taskInput");
const addBtn = document.getElementById("addBtn");
const taskList = document.getElementById("taskList");

let currentUser = localStorage.getItem("username") || null;
let isLoginMode = true;
let tasks = [];


async function handleAuth() {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        alert("Please fill all fields");
        return;
    }

    if (isLoginMode) {
        await login(username, password);
    } else {
        await signup(username, password);
    }
}

async function signup(username, password) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
        alert("User already exists");
        return;
    }

    alert("Account created! Please login.");
    toggleMode();
}

async function login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
        alert("Invalid credentials");
        return;
    }

    const data = await res.json();
    token = data.token;
    currentUser = data.username;

    localStorage.setItem("token", token);
    localStorage.setItem("username", currentUser);

    showApp();
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.clear();

    document.getElementById("logoutBtn").style.display = "none";

    authContainer.style.display = "block";
    todoContainer.style.display = "none";
}

function toggleMode() {
    isLoginMode = !isLoginMode;
    document.getElementById("authTitle").textContent =
        isLoginMode ? "Login" : "Sign Up";
    authBtn.textContent = isLoginMode ? "Login" : "Sign Up";
    toggleAuth.innerHTML = isLoginMode
        ? "Don't have an account? <span>Sign Up</span>"
        : "Already have an account? <span>Login</span>";
}

function showApp() {
    authContainer.style.display = "none";
    todoContainer.style.display = "block";

    document.getElementById("logoutBtn").style.display = "block";

    welcomeMsg.textContent = `Hello, ${currentUser}!`;
    loadTasks();
}


async function loadTasks() {
    const res = await fetch(`${API_BASE}/tasks`, {
        headers: { Authorization: token }
    });

    tasks = await res.json();
    renderTasks();
}

async function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    await fetch(`${API_BASE}/tasks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: token
        },
        body: JSON.stringify({ title: text })
    });

    taskInput.value = "";
    loadTasks();
}

async function updateTaskTitle(id, newTitle) {
    if (!newTitle) return;

    await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: token
        },
        body: JSON.stringify({ title: newTitle })
    });

    loadTasks();
}


async function toggleTask(id, completed) {
    await fetch(`${API_BASE}/tasks/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: token
        },
        body: JSON.stringify({ completed: !completed })
    });

    loadTasks();
}

async function deleteTask(id) {
    await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
        headers: { Authorization: token }
    });

    loadTasks();
}


function renderTasks() {
    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");
        if (task.completed) li.classList.add("completed");

        let content;

        if (task.isEditing) {
            content = document.createElement("input");
            content.value = task.title;
            content.className = "edit-input";
        } 
        else {
            content = document.createElement("span");
            content.textContent = task.title;
        }

        const actions = document.createElement("div");
        actions.className = "actions";

        const doneBtn = document.createElement("button");
        doneBtn.textContent = "✓";
        doneBtn.className = "done";
        doneBtn.onclick = () => toggleTask(task._id, task.completed);

        const editBtn = document.createElement("button");
        editBtn.textContent = task.isEditing ? "💾" : "✎";
        editBtn.className = "edit";

        editBtn.onclick = () => {
            if (task.isEditing) {
                const newTitle = content.value.trim();
                updateTaskTitle(task._id, newTitle);
            } else {
                task.isEditing = true;
                renderTasks();
            }
        };

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "✕";
        deleteBtn.className = "delete";
        deleteBtn.onclick = () => deleteTask(task._id);

        actions.append(doneBtn, editBtn, deleteBtn);
        li.append(content, actions);
        taskList.appendChild(li);
    });
}



authBtn.addEventListener("click", handleAuth);
logoutBtn.addEventListener("click", logout);
toggleAuth.addEventListener("click", toggleMode);
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keypress", e => {
    if (e.key === "Enter") addTask();
});


if (token && currentUser) {
    showApp();
}

if(loginNavBtn){
loginNavBtn.addEventListener("click",()=>{
    authContainer.style.display="block";
    todoContainer.style.display="none";
});
}
