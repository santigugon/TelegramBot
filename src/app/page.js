"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";

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
  { id: 5, name: "Design", color: "#2E86C1" }, // Blue
];

// Module definitions (sprints/features)
const modules = [
  { id: 1, name: "Sprint 1: Core API" },
  { id: 2, name: "Sprint 2: User Authentication" },
  { id: 3, name: "Feature: Cloud Integration" },
  { id: 4, name: "Feature: Performance Optimization" },
];

// Initial dummy tasks
const initialTasks = [
  {
    id: 1,
    title: "Setup API endpoints",
    moduleId: 1,
    teamId: 2,
    status: "In Progress",
    priority: "High",
  },
  {
    id: 2,
    title: "Design login screen",
    moduleId: 2,
    teamId: 5,
    status: "To Do",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Configure CI/CD pipeline",
    moduleId: 1,
    teamId: 3,
    status: "Done",
    priority: "High",
  },
  {
    id: 4,
    title: "Implement JWT auth",
    moduleId: 2,
    teamId: 2,
    status: "To Do",
    priority: "High",
  },
];

const OracleTaskManager = () => {
  const [tele, setTele] = useState(null);
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState(initialTasks);
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
      teams.find((team) => team.id === id) || {
        name: "Unknown",
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
        matches = matches && task.teamId === activeTeamId;
      }

      if (activeModuleId !== null) {
        matches = matches && task.moduleId === activeModuleId;
      }

      return matches;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return colors.primary;
      case "Medium":
        return colors.warning;
      case "Low":
        return colors.accent;
      default:
        return colors.gray;
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "To Do":
        return { backgroundColor: colors.lightGray, color: colors.dark };
      case "In Progress":
        return { backgroundColor: colors.warning, color: colors.dark };
      case "Done":
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
                {module.name}
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
                  {module.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="tasks-header">
          <h2>
            {activeTeamId !== null && `${getTeamById(activeTeamId).name} `}
            {activeModuleId !== null &&
              `${getModuleById(activeModuleId).name} `}
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
                <h3>{task.title}</h3>
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
                  <span>{getModuleById(task.moduleId).name}</span>
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
                    style={getStatusBadgeStyle(task.status)}
                  >
                    {task.status}
                  </span>

                  <span
                    className="priority-badge"
                    style={{
                      backgroundColor: "transparent",
                      color: getPriorityColor(task.priority),
                      border: `1px solid ${getPriorityColor(task.priority)}`,
                    }}
                  >
                    {task.priority} Priority
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
      tasksByModule[module.id] = tasks.filter(
        (task) => task.moduleId === module.id
      );
    });

    return (
      <div className="module-view">
        <h2>Modules Overview</h2>

        {modules.map((module) => (
          <div key={module.id} className="module-card">
            <h3>{module.name}</h3>
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
                    tasksByModule[module.id].filter((t) => t.status === "Done")
                      .length
                  }
                </span>
                <span className="stat-label">Completed</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {Math.round(
                    (tasksByModule[module.id].filter((t) => t.status === "Done")
                      .length /
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
      <div className="oracle-task-manager">
        <header className="app-header">
          <div className="logo">
            <svg viewBox="0 0 100 20" width="120">
              <text
                x="0"
                y="15"
                fill={colors.primary}
                fontSize="16"
                fontWeight="bold"
              >
                ORACLE
              </text>
            </svg>
            <span>Task Manager</span>
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

        <style jsx global>{`
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: "Oracle Sans", -apple-system, BlinkMacSystemFont,
              "Segoe UI", Roboto, sans-serif;
            font-size: 16px;
            line-height: 1.5;
            color: ${colors.dark};
            background-color: ${colors.light};
          }

          body.dark-theme {
            color: ${colors.light};
            background-color: ${colors.dark};
          }

          .dark-theme .task-card,
          .dark-theme .module-card,
          .dark-theme .task-form,
          .dark-theme input,
          .dark-theme select {
            background-color: #2a3042;
            color: ${colors.light};
            border-color: #3a4a63;
          }

          .oracle-task-manager {
            display: flex;
            flex-direction: column;
            min-height: 100vh;
            max-width: 800px;
            margin: 0 auto;
          }

          .app-header {
            padding: 16px;
            background-color: white;
            border-bottom: 1px solid ${colors.lightGray};
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .dark-theme .app-header {
            background-color: #1a1f36;
            border-bottom-color: #3a4a63;
          }

          .logo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 600;
          }

          .app-content {
            flex: 1;
            padding: 16px;
            overflow-y: auto;
          }

          .app-nav {
            display: flex;
            justify-content: space-around;
            padding: 12px;
            background-color: white;
            border-top: 1px solid ${colors.lightGray};
          }

          .dark-theme .app-nav {
            background-color: #1a1f36;
            border-top-color: #3a4a63;
          }

          .nav-button {
            background: none;
            border: none;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 500;
            color: ${colors.gray};
            cursor: pointer;
            border-radius: 4px;
          }

          .nav-button.active {
            color: ${colors.primary};
            background-color: rgba(199, 70, 52, 0.1);
          }

          .dark-theme .nav-button.active {
            background-color: rgba(199, 70, 52, 0.2);
          }

          .button {
            padding: 8px 16px;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            border: none;
            font-size: 14px;
          }

          .button.primary {
            background-color: ${colors.primary};
            color: white;
          }

          .button.secondary {
            background-color: transparent;
            border: 1px solid ${colors.secondary};
            color: ${colors.secondary};
          }

          .button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .icon-button {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            padding: 4px;
          }

          .task-card {
            background-color: white;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            border: 1px solid ${colors.lightGray};
          }

          .task-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 12px;
          }

          .task-actions {
            display: flex;
            gap: 8px;
          }

          .task-details {
            font-size: 14px;
          }

          .task-module {
            margin-bottom: 12px;
          }

          .label {
            font-weight: 500;
            margin-right: 4px;
            color: ${colors.gray};
          }

          .task-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .team-badge,
          .status-badge,
          .priority-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
          }

          .team-badge {
            color: white;
          }

          .filters {
            margin-bottom: 24px;
          }

          .filter-section {
            margin-bottom: 16px;
          }

          .filter-section h3 {
            font-size: 14px;
            margin-bottom: 8px;
            color: ${colors.gray};
          }

          .team-filters,
          .module-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }

          .team-filter,
          .module-filter {
            background: none;
            border: 1px solid ${colors.lightGray};
            border-radius: 16px;
            padding: 4px 12px;
            font-size: 12px;
            cursor: pointer;
          }

          .team-filter.active,
          .module-filter.active {
            background-color: ${colors.secondary};
            color: white;
            border-color: ${colors.secondary};
          }

          .tasks-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }

          .empty-state {
            text-align: center;
            padding: 24px;
            color: ${colors.gray};
          }

          .task-form,
          .module-view {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .form-title {
            margin-bottom: 20px;
            color: ${colors.secondary};
          }

          .form-group {
            margin-bottom: 16px;
          }

          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            font-size: 14px;
            color: ${colors.secondary};
          }

          input,
          select {
            width: 100%;
            padding: 10px;
            border: 1px solid ${colors.lightGray};
            border-radius: 4px;
            font-size: 14px;
          }

          input:focus,
          select:focus {
            outline: none;
            border-color: ${colors.accent};
          }

          .form-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            margin-top: 24px;
          }

          .module-card {
            background-color: white;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 16px;
            border: 1px solid ${colors.lightGray};
          }

          .module-stats {
            display: flex;
            justify-content: space-between;
            margin: 16px 0;
          }

          .stat {
            text-align: center;
          }

          .stat-value {
            display: block;
            font-size: 20px;
            font-weight: 600;
            color: ${colors.secondary};
          }

          .stat-label {
            font-size: 12px;
            color: ${colors.gray};
          }
        `}</style>
      </div>
    </>
  );
};

export default OracleTaskManager;
