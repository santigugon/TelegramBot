"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";
import "./globals.css";
import { getModules } from "@/app/data/modules";
import { getTasks } from "@/app/data/task";
import { getTeams } from "@/app/data/teams";
import OracleLoader from "@/app/loader";

// Oracle color palette

const colors = {
  primary: "#C74634", // Oracle Red
  secondary: "#3A4A63", // Dark Blue
  accent: "#00758F", // Oracle Teal
  light: "#F7F9FB",
  dark: "#1A1F36",
  success: "#1F7B4D", // Green
  warning: "#F7A700", // Amber
  gray: "#6B7280",
  lightGray: "#E5E7EB",
};

// Team definitions with their respective colors
const teams = [
  { id: 1, name: "Frontend", color: colors.primary },
  { id: 2, name: "Backend", color: colors.secondary },
  { id: 3, name: "DevOps", color: colors.accent },
  { id: 4, name: "QA", color: "#7D3C98" }, // Purple
  { id: 24, name: "Design", color: "#2E86C1" }, // Blue
];

const OracleTaskManager = () => {
  // GENERAL DATA
  const [modules, setModules] = useState([]);
  const [initialTasks, setInitialTasks] = useState([]);

  const [loading, setLoading] = useState(true);

  const [tele, setTele] = useState(null);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [view, setView] = useState("tasks"); // "tasks", "newTask", "editTask", "deleteTask", "moduleView"
  const [editingTask, setEditingTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    moduleId: 1,
    teamId: 1,
    status: "To Do",
    priority: "Medium",
  });
  const [teams, setTeams] = useState([]);

  const [data, setData] = useState(null);

  const fetchData = async () => {
    const fetchedModules = await getModules();
    setModules(fetchedModules);
    console.log("Fetched modules:", modules);

    const fetchedTasks = await getTasks();
    setTasks(fetchedTasks);

    const fetchedTeams = await getTeams();
    setTeams(fetchedTeams);

    console.log("loading of");
    setLoading(false);
  };

  useEffect(() => {
    // Initialize Telegram WebApp
    if (
      typeof window !== "undefined" &&
      window.Telegram &&
      window.Telegram.WebApp
    ) {
      const webApp = window.Telegram.WebApp;
      setTele(webApp);
      webApp.ready();

      // Set theme based on Telegram color scheme
      if (webApp.colorScheme === "dark") {
        document.body.classList.add("dark-theme");
      }

      // Set Telegram header color to match Oracle branding
      webApp.setHeaderColor(colors.primary);
      webApp.setBackgroundColor(colors.light);

      // Get user data
      if (webApp.initDataUnsafe?.user) {
        setUser(webApp.initDataUnsafe.user);
      }

      // Load saved tasks from localStorage if available
      const savedTasks = localStorage.getItem("oracleTasks");
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      fetchData();
    }
  }, []);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("oracleTasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  const getNextId = () => {
    return Math.max(...tasks.map((task) => task.id), 0) + 1;
  };

  const handleCreateTask = () => {
    if (!newTask.title) return;

    const taskToAdd = {
      ...newTask,
      id: getNextId(),
    };

    setTasks([...tasks, taskToAdd]);
    setNewTask({
      title: "",
      moduleId: 1,
      teamId: 1,
      status: "To Do",
      priority: "Medium",
    });
    setView("tasks");

    // Show success message via Telegram's native UI
    if (tele) {
      tele.showPopup({
        title: "Task Created",
        message: `Task "${taskToAdd.title}" has been created successfully.`,
        buttons: [{ type: "ok" }],
      });
    }
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;

    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id ? editingTask : task
    );

    setTasks(updatedTasks);
    setEditingTask(null);
    setView("tasks");

    // Show success message
    if (tele) {
      tele.showPopup({
        title: "Task Updated",
        message: `Task "${editingTask.title}" has been updated successfully.`,
        buttons: [{ type: "ok" }],
      });
    }
  };

  const handleDeleteTask = (taskId) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);

    if (tele) {
      tele.showConfirm(
        `Are you sure you want to delete "${taskToDelete.title}"?`,
        (confirmed) => {
          if (confirmed) {
            const filteredTasks = tasks.filter((task) => task.id !== taskId);
            setTasks(filteredTasks);

            tele.showPopup({
              title: "Task Deleted",
              message: `Task "${taskToDelete.title}" has been deleted.`,
              buttons: [{ type: "ok" }],
            });
          }
        }
      );
    } else {
      if (
        window.confirm(
          `Are you sure you want to delete "${taskToDelete.title}"?`
        )
      ) {
        const filteredTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(filteredTasks);
      }
    }
  };

  const getTeamById = (id) => {
    return (
      // To do
      teams.find((team) => team.id === 1) || {
        title: "Unknown",
        color: colors.gray,
      }
    );
  };

  const getModuleById = (id) => {
    return (
      modules.find((module) => module.id === id) || { name: "Unknown Module" }
    );
  };

  const getFilteredTasks = () => {
    return tasks.filter((task) => {
      let matches = true;

      if (activeTeamId !== null) {
        matches = matches; //&& task.teamId === activeTeamId; TO DO
      }

      if (activeModuleId !== null) {
        matches = matches && task.moduleId === activeModuleId;
      }

      return matches;
    });
  };

  const getPriorityColor = (priority) => {
    if (priority >= 7) {
      return colors.primary;
    } else if (priority >= 4 && priority < 7) {
      return colors.warning;
    } else if (priority < 3) {
      return colors.accent;
    } else {
      return colors.gray;
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "To Do":
        return { backgroundColor: colors.lightGray, color: colors.dark };
      case "In Progress":
        return { backgroundColor: colors.warning, color: colors.dark };
      case true:
        return { backgroundColor: colors.success, color: colors.light };
      default:
        return { backgroundColor: colors.lightGray, color: colors.dark };
    }
  };

  const renderTaskForm = (isEditing = false) => {
    const formTask = isEditing ? editingTask : newTask;
    const setFormTask = isEditing ? setEditingTask : setNewTask;

    return (
      <div className="task-form">
        <h2 className="form-title">
          {isEditing ? "Edit Task" : "Create New Task"}
        </h2>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={formTask.title}
            onChange={(e) =>
              setFormTask({ ...formTask, title: e.target.value })
            }
            placeholder="Task title"
          />
        </div>

        <div className="form-group">
          <label>Module</label>
          <select
            value={formTask.moduleId}
            onChange={(e) =>
              setFormTask({ ...formTask, moduleId: Number(e.target.value) })
            }
          >
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Team</label>
          <select
            value={formTask.teamId}
            onChange={(e) =>
              setFormTask({ ...formTask, teamId: Number(e.target.value) })
            }
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={formTask.status}
            onChange={(e) =>
              setFormTask({ ...formTask, status: e.target.value })
            }
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select
            value={formTask.priority}
            onChange={(e) =>
              setFormTask({ ...formTask, priority: e.target.value })
            }
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <div className="form-actions">
          <button className="button secondary" onClick={() => setView("tasks")}>
            Cancel
          </button>
          <button
            className="button primary"
            onClick={isEditing ? handleUpdateTask : handleCreateTask}
            disabled={!formTask.title}
          >
            {isEditing ? "Update Task" : "Create Task"}
          </button>
        </div>
      </div>
    );
  };

  const renderTaskList = () => {
    const filteredTasks = getFilteredTasks();

    return (
      <div className="task-list">
        <div className="filters">
          <div className="filter-section">
            <h3>Filter by Team</h3>
            <div className="team-filters">
              <button
                className={`team-filter ${
                  activeTeamId === null ? "active" : ""
                }`}
                onClick={() => setActiveTeamId(null)}
              >
                All Teams
              </button>
              {teams.map((team) => (
                <button
                  key={team.id}
                  className={`team-filter ${
                    activeTeamId === team.id ? "active" : ""
                  }`}
                  style={{
                    borderColor: team.color,
                    backgroundColor:
                      activeTeamId === team.id ? team.color : "transparent",
                    color: activeTeamId === team.id ? "#FFF" : team.color,
                  }}
                  onClick={() =>
                    setActiveTeamId(team.id === activeTeamId ? null : team.id)
                  }
                >
                  {team.name}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3>Filter by Module</h3>
            <div className="module-filters">
              <button
                className={`module-filter ${
                  activeModuleId === null ? "active" : ""
                }`}
                onClick={() => setActiveModuleId(null)}
              >
                All Modules
              </button>
              {modules.map((module) => (
                <button
                  key={module.id}
                  className={`module-filter ${
                    activeModuleId === module.id ? "active" : ""
                  }`}
                  onClick={() =>
                    setActiveModuleId(
                      module.id === activeModuleId ? null : module.id
                    )
                  }
                >
                  {module.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="tasks-header">
          <h2>
            {activeTeamId !== null && `${getTeamById(activeTeamId).name} `}
            {activeModuleId !== null &&
              `${getModuleById(activeModuleId).title} `}
            Tasks ({filteredTasks.length})
          </h2>
          <button className="button primary" onClick={() => setView("newTask")}>
            Add Task
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <p>No tasks found. Create a new task to get started.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-header">
                {/* TO DO */}
                <h3>{task.description}</h3>
                <div className="task-actions">
                  <button
                    className="icon-button edit"
                    onClick={() => {
                      setEditingTask(task);
                      setView("editTask");
                    }}
                  >
                    ✏️
                  </button>
                  <button
                    className="icon-button delete"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="task-details">
                <div className="task-module">
                  <span className="label">Module:</span>
                  <span>{getModuleById(task.moduleId).title}</span>
                </div>

                <div className="task-meta">
                  <span
                    className="team-badge"
                    style={{ backgroundColor: getTeamById(task.teamId).color }}
                  >
                    {getTeamById(task.teamId).name}
                  </span>

                  <span
                    className="status-badge"
                    style={getStatusBadgeStyle(task.done)}
                  >
                    {task.done ? "Done" : "To do"}
                  </span>

                  <span
                    className="priority-badge"
                    style={{
                      backgroundColor: "transparent",
                      color: getPriorityColor(task.story_Points),
                      border: `1px solid ${getPriorityColor(
                        task.story_Points
                      )}`,
                    }}
                  >
                    {task.story_Points} Story points
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderModuleView = () => {
    // Group tasks by module
    const tasksByModule = {};
    modules.forEach((module) => {
      console.log("Module:", module);
      tasksByModule[module.id] = tasks.filter(
        (task) => task.moduleId === module.id
      );
    });

    return (
      <div className="module-view">
        <h2>Modules Overview</h2>

        {modules.map((module) => (
          <div key={module.id} className="module-card">
            <h3>{module.title}</h3>
            <div className="module-stats">
              <div className="stat">
                <span className="stat-value">
                  {tasksByModule[module.id].length}
                </span>
                <span className="stat-label">Total Tasks</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {
                    // TO DO
                    tasksByModule[module.id].filter((t) => t.done).length
                  }
                </span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {Math.round(
                    // TO DO
                    (tasksByModule[module.id].filter((t) => t.done).length /
                      (tasksByModule[module.id].length || 1)) *
                      100
                  )}
                  %
                </span>
                <span className="stat-label">Progress</span>
              </div>
            </div>
            <button
              className="button secondary"
              onClick={() => {
                setActiveModuleId(module.id);
                setView("tasks");
              }}
            >
              View Tasks
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    switch (view) {
      case "newTask":
        return renderTaskForm(false);
      case "editTask":
        return renderTaskForm(true);
      case "moduleView":
        return renderModuleView();
      case "tasks":
      default:
        return renderTaskList();
    }
  };

  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      {loading ? (
        <OracleLoader />
      ) : (
        <div className="oracle-task-manager">
          <header className="app-header">
            <div className="logo">
              <img
                src="https://1000logos.net/wp-content/uploads/2017/04/Oracle-Logo-1.png"
                alt="Oracle Logo"
                className="logo-image"
              />
            </div>
          </header>

          <main className="app-content">{renderContent()}</main>
          <nav className="app-nav">
            <button
              className={`nav-button ${view === "tasks" ? "active" : ""}`}
              onClick={() => setView("tasks")}
            >
              Tasks
            </button>
            <button
              className={`nav-button ${view === "moduleView" ? "active" : ""}`}
              onClick={() => setView("moduleView")}
            >
              Modules
            </button>
            <button
              className={`nav-button ${view === "newTask" ? "active" : ""}`}
              onClick={() => setView("newTask")}
            >
              Add Task
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

// CallDb();

export default OracleTaskManager;
