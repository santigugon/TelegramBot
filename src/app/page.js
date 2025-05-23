"use client";
import React, { useState, useEffect } from "react";
import Script from "next/script";
import "./globals.css";
import { getModules } from "@/app/data/modules";
import { getTasks, postTask, deleteTask, putTask } from "@/app/data/task";
import { getTeams } from "@/app/data/teams";
import OracleLoader from "@/app/loader";
import KPIView from "./view/Kpi";
import Recommendation from "./view/Recommendation";
// Oracle color palette

// Progress Pie Chart Component
const ProgressPieChart = ({ progress, size = 200, strokeWidth = 20 }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  // Calculate the SVG parameters
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedProgress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.lightGray}
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.success}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div
        className="absolute flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <span className="text-3xl font-bold">{normalizedProgress}%</span>
        <span className="text-sm text-gray-500">Complete</span>
      </div>
    </div>
  );
};

const users = [
  {
    id: 1,
    userId: 1,
    teamId: 1,
    role: "Manager",
    createdAt: "2025-02-27T16:00:00.000+00:00",
    user: {
      id: 1,
      username: "Julián Enrique Espinoza Valenzuela",
      email: "A01254679@tec.mx",
    },
  },
  {
    id: 2,
    userId: 2,
    teamId: 1,
    role: "Developer",
    createdAt: "2025-02-27T16:05:00.000+00:00",
    user: {
      id: 2,
      username: "Santiago Gutiérrez González",
      email: "A00572499@tec.mx",
    },
  },
  {
    id: 3,
    userId: 3,
    teamId: 1,
    role: "Developer",
    createdAt: "2025-02-27T16:10:00.000+00:00",
    user: {
      id: 3,
      username: "Alejandro Moncada Espinosa",
      email: "A01638343@tec.mx",
    },
  },
  {
    id: 4,
    userId: 4,
    teamId: 1,
    role: "Developer",
    createdAt: "2025-02-27T16:15:00.000+00:00",
    user: {
      id: 4,
      username: "Ana Camila Jimenez Mendoza",
      email: "A01174422@tec.mx",
    },
  },
  {
    id: 5,
    userId: 5,
    teamId: 1,
    role: "Developer",
    createdAt: "2025-02-27T16:20:00.000+00:00",
    user: {
      id: 5,
      username: "Jorge Ivan Sanchez Gonzalez",
      email: "A01761414@tec.mx",
    },
  },
];

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
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [tele, setTele] = useState(null);

  const [showTimeModal, setShowTimeModal] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);
  const [selectedModuleForGraph, setSelectedModuleForGraph] = useState(null);

  const [completingTaskId, setCompletingTaskId] = useState(1);
  const [actualTime, setActualTime] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState(0);

  const [tasks, setTasks] = useState([]);
  const [activeTeamId, setActiveTeamId] = useState(null);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [activeEmployeeId, setActiveEmployeeId] = useState(null);
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

      //Get the phone number
      const urlParams = new URLSearchParams(window.location.search);
      const phone = urlParams.get("phone");
      if (phone) {
        setPhoneNumber(phone);
      }

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

    postTask(newTask);

    // To do
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
    // if (tele) {
    //   tele.showPopup({
    //     title: "Task Created",
    //     message: `Task "${taskToAdd.title}" has been created successfully.`,
    //     buttons: [{ type: "ok" }],
    //   });
    // }
  };

  const handleUpdateTask = async () => {
    if (!editingTask) return;

    const updatedTasks = tasks.map((task) =>
      task.id === editingTask.id ? editingTask : task
    );
    let result = await putTask(editingTask.id, editingTask);
    console.log("result", result);
    if (result) {
      setTasks(updatedTasks);
      setEditingTask(null);
      setView("tasks");
    }
    // Show success message
    if (tele) {
      tele.showPopup({
        title: "Task Updated",
        message: `Task "${editingTask.title}" has been updated successfully.`,
        buttons: [{ type: "ok" }],
      });
    }
  };

  const handleDeleteTask = async (taskId) => {
    const taskToDelete = tasks.find((task) => task.id === taskId);

    if (
      window.confirm(`Are you sure you want to delete "${taskToDelete.title}"?`)
    ) {
      let deletedTask = await deleteTask(taskId);
      console.log("deletedTask", deletedTask);
      if (deletedTask) {
        const filteredTasks = tasks.filter((task) => task.id !== taskId);
        setTasks(filteredTasks);
      }
    }
  };

  const handleTaskCompletion = async (taskId, actualTimeSpent) => {
    const taskToUpdate = tasks.find((task) => task.id === taskId);
    const updatedTask = {
      ...taskToUpdate,
      done: !taskToUpdate.done,
    };

    // Only update actual time if provided (when marking as complete)
    if (actualTimeSpent !== null) {
      updatedTask.actualTime = actualTimeSpent;
    }

    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? updatedTask : task
    );

    const result = await putTask(taskId, updatedTask);
    console.log("result of completing task", result);
    if (result) {
      setTasks(updatedTasks);

      // Show success message with time info when marking as complete
      if (updatedTask.done && tele) {
        tele.showPopup({
          title: "Task Marked as Complete",
          message: `Task completion recorded. Actual time: ${updatedTask.actualTime} hours.`,
          buttons: [{ type: "ok" }],
        });
      }
    }
    setEditingTask(null);
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

  const handleTaskCheckboxClick = (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    // Only show time modal when marking a task as complete
    if (!task.done) {
      setCompletingTaskId(taskId);
      setActualTime(task.estimatedTime || 0); // Default to estimated time
      setShowTimeModal(true);
    } else {
      // If unchecking, just update without asking for time
      handleTaskCompletion(taskId, null);
    }
  };

  const handleTimeModalSubmit = () => {
    handleTaskCompletion(completingTaskId, actualTime);
    setShowTimeModal(false);
    setCompletingTaskId(null);
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

      if (activeEmployeeId !== null) {
        matches = matches && task.responsible === activeEmployeeId;
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

  const findUserById = (id) => {
    return (
      users.find((user) => user.id === id) || {
        username: "Unknown User",
      }
    );
  };

  const renderTaskForm = (isEditing = false) => {
    const formTask = isEditing ? editingTask : newTask;
    const setFormTask = isEditing ? setEditingTask : setNewTask;

    return (
      <div className="bg-white p-20 rounded-lg  padding-20 border-rad-10 gap-5 flex flex-col">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {isEditing ? "Edit Task" : "Create New Task"}
        </h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={formTask.title || ""}
            onChange={(e) =>
              setFormTask({ ...formTask, title: e.target.value })
            }
            placeholder="Task title"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formTask.description || ""}
            onChange={(e) =>
              setFormTask({ ...formTask, description: e.target.value })
            }
            placeholder="Task description"
            className="w-full p-10 border border-gray-300 rounded-md"
            rows="3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module
            </label>
            <select
              value={formTask.moduleId || ""}
              onChange={(e) =>
                setFormTask({ ...formTask, moduleId: Number(e.target.value) })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Module</option>
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsible
            </label>
            <select
              value={formTask.responsible || ""}
              onChange={(e) =>
                setFormTask({
                  ...formTask,
                  responsible: Number(e.target.value),
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Responsible</option>
              {users &&
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.user.username || user.user.email}
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Limit
            </label>
            <input
              type="date"
              value={formTask.dateLimit || ""}
              onChange={(e) =>
                setFormTask({ ...formTask, dateLimit: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Time (hours)
            </label>
            <input
              type="number"
              min="0"
              max="4"
              step="0.5"
              value={formTask.estimatedTime || 0}
              onChange={(e) =>
                setFormTask({
                  ...formTask,
                  estimatedTime: Number(e.target.value),
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            />
            <small className="text-gray-500">Maximum: 4 hours</small>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Story Points
            </label>
            <select
              value={formTask.story_Points} // Use a single value here, not an array
              onChange={(e) =>
                setFormTask({
                  ...formTask,
                  story_Points: Number(e.target.value), // Set the selected value
                })
              }
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((point) => (
                <option key={point} value={point}>
                  {point}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4 flex flex-col justify-around">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Done?
            </label>
            <div className="flex items-center justify-start mt-2">
              <input
                type="checkbox"
                checked={formTask.done || false}
                onChange={(e) =>
                  setFormTask({ ...formTask, done: e.target.checked })
                }
                className="fitted-checkbox"
              />

              <span className="ml-2 text-sm text-gray-700">
                Mark as completed
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-around space-x-4 mt-6">
          <button
            className="button primary"
            onClick={isEditing ? handleUpdateTask : handleCreateTask}
            disabled={!formTask.description}
          >
            {isEditing ? "Update Task" : "Create Task"}
          </button>
          <button
            className="px-10 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 button"
            onClick={() => setView("tasks")}
          >
            Cancel
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

          <div className="filter-section">
            <h3>Filter by Employee</h3>
            <div className="employee-filters">
              <button
                className={`employee-filter ${
                  activeEmployeeId === null ? "active" : ""
                }`}
                onClick={() => setActiveEmployeeId(null)}
              >
                All Employees
              </button>
              {users.map((user) => (
                <button
                  key={user.id}
                  className={`employee-filter ${
                    activeEmployeeId === user.id ? "active" : ""
                  }`}
                  onClick={() =>
                    setActiveEmployeeId(
                      user.id === activeEmployeeId ? null : user.id
                    )
                  }
                >
                  {user.user.username}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendation Component */}
        <Recommendation />

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
                      console.log("Editing task:", task);
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

              <div className="flex justify-between items-center">
                <div className="task-details">
                  <div className="task-module">
                    <span className="label">Module:</span>
                    <span>{getModuleById(task.moduleId).title}</span>
                  </div>

                  <div className="task-meta">
                    <span
                      className="team-badge"
                      style={{
                        backgroundColor: getTeamById(task.teamId).color,
                      }}
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

                    <span className="status-badge" style={{ color: "purple" }}>
                      Responsible:{" "}
                      {findUserById(task.responsible).user.username}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end">
                  <input
                    type="checkbox"
                    className="fitted-checkbox"
                    checked={task.done}
                    onChange={() => {
                      handleTaskCheckboxClick(task.id);
                    }}
                  ></input>
                  {task.actualTime && (
                    <label className="checkbox-label">
                      Time taken: {task.actualTime || 0} hours
                    </label>
                  )}
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
                  {tasksByModule[module.id].length > 0
                    ? Math.round(
                        tasksByModule[module.id].reduce((total, task) => {
                          const timeSpent = task.done ? task.actualTime : 0;

                          return total + timeSpent;
                        }, 0)
                      )
                    : 0}
                </span>
                <span className="stat-label">Hours spent</span>
              </div>
              <div className="stat">
                <span className="stat-value">
                  {tasksByModule[module.id].length > 0
                    ? Math.round(
                        (tasksByModule[module.id].filter((t) => t.done).length /
                          tasksByModule[module.id].length) *
                          100
                      )
                    : 0}
                  %
                </span>
                <span className="stat-label">Progress</span>
              </div>
            </div>
            <div className="module-actions">
              <button
                className="button secondary"
                onClick={() => {
                  setActiveModuleId(module.id);
                  setView("tasks");
                }}
              >
                View Tasks
              </button>
              <button
                className="button primary"
                onClick={() => {
                  setSelectedModuleForGraph(module);
                  setShowGraphModal(true);
                }}
              >
                View Graph
              </button>
            </div>
          </div>
        ))}

        {/* Graph Modal */}
        {showGraphModal && selectedModuleForGraph && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowGraphModal(false);
              }
            }}
          >
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  Progress: {selectedModuleForGraph.title}
                </h3>
                <button
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowGraphModal(false)}
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col items-center justify-center p-6">
                {(() => {
                  const progress =
                    tasksByModule[selectedModuleForGraph.id].length > 0
                      ? Math.round(
                          (tasksByModule[selectedModuleForGraph.id].filter(
                            (t) => t.done
                          ).length /
                            tasksByModule[selectedModuleForGraph.id].length) *
                            100
                        )
                      : 0;

                  return (
                    <div className="relative">
                      <ProgressPieChart progress={progress} size={250} />
                    </div>
                  );
                })()}

                <div className="mt-10 grid grid-cols-2 gap-6 w-full">
                  <div className="bg-light p-5 rounded-lg flex-col">
                    <h4 className="font-semibold mb-3">Task Breakdown</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Total Tasks:</span>
                        <span className="font-medium">
                          {tasksByModule[selectedModuleForGraph.id].length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed:</span>
                        <span className="font-medium text-success">
                          {
                            tasksByModule[selectedModuleForGraph.id].filter(
                              (t) => t.done
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending:</span>
                        <span className="font-medium text-warning">
                          {
                            tasksByModule[selectedModuleForGraph.id].filter(
                              (t) => !t.done
                            ).length
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-light p-5 rounded-lg">
                    <h4 className="font-semibold mb-3">Time Statistics</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Hours Spent:</span>
                        <span className="font-medium">
                          {tasksByModule[selectedModuleForGraph.id].length > 0
                            ? Math.round(
                                tasksByModule[selectedModuleForGraph.id].reduce(
                                  (total, task) => {
                                    const timeSpent = task.done
                                      ? task.actualTime
                                      : 0;
                                    return total + timeSpent;
                                  },
                                  0
                                )
                              )
                            : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Avg. Time/Task:</span>
                        <span className="font-medium">
                          {tasksByModule[selectedModuleForGraph.id].length > 0
                            ? (
                                tasksByModule[selectedModuleForGraph.id].reduce(
                                  (total, task) => {
                                    const timeSpent = task.done
                                      ? task.actualTime
                                      : 0;
                                    return total + timeSpent;
                                  },
                                  0
                                ) /
                                tasksByModule[selectedModuleForGraph.id].length
                              ).toFixed(1)
                            : 0}{" "}
                          hrs
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
      case "kpi":
        return <KPIView />;
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

          <main className="app-content">
            {/* Time tracking modal */}
            {/* MODAL  */}
            {showTimeModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 padding-20">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full padding-20">
                  <h3 className="text-xl font-semibold mb-4">
                    Task Completion Time
                  </h3>
                  <p className="mb-4">
                    How many hours did it take to complete this task?
                  </p>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Actual Time (hours)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={actualTime}
                      onChange={(e) => setActualTime(Number(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    />
                    <div className="text-sm text-gray-500 mt-1">
                      Estimated time was:{" "}
                      {tasks.find((t) => t.id === completingTaskId)
                        ?.estimatedTime || 0}{" "}
                      hours
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 button"
                      onClick={() => {
                        setShowTimeModal(false);
                        setCompletingTaskId(null);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary primary button"
                      style={{ backgroundColor: colors.primary }}
                      onClick={handleTimeModalSubmit}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MAIN CONTENT */}
            <div className="flex flex-col">
              <div className="user-info">
                <h2>Welcome: {phoneNumber}</h2>
              </div>
              {renderContent()}
            </div>
          </main>
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
            <button
              className={`nav-button ${view === "kpi" ? "active" : ""}`}
              onClick={() => setView("kpi")}
            >
              KPI's
            </button>
          </nav>
        </div>
      )}
    </>
  );
};

// CallDb();

export default OracleTaskManager;
