import React, { useState, useEffect } from "react";
import { getFromAPI } from "@/app/data/auxFunctions";
import { getModules } from "@/app/data/modules";

// Progress Pie Chart Component
const ProgressPieChart = ({ progress, size = 150, strokeWidth = 15 }) => {
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
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#1F7B4D"
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
        <span className="text-2xl font-bold">{normalizedProgress}%</span>
        <span className="text-xs text-gray-500">Complete</span>
      </div>
    </div>
  );
};

// Module Breakdown Component
const ModuleBreakdown = ({ tasks, modules }) => {
  // Group tasks by module
  const tasksByModule = {};
  modules.forEach((module) => {
    tasksByModule[module.id] = tasks.filter(
      (task) => task.moduleId === module.id
    );
  });

  // Calculate module stats
  const moduleStats = Object.keys(tasksByModule).map((moduleId) => {
    const moduleTasks = tasksByModule[moduleId];
    const module = modules.find((m) => m.id === parseInt(moduleId)) || {
      title: `Module ${moduleId}`,
    };

    return {
      id: moduleId,
      title: module.title,
      taskCount: moduleTasks.length,
      hoursSpent: moduleTasks.reduce(
        (total, task) => total + (task.actualTime || 0),
        0
      ),
      storyPoints: moduleTasks.reduce(
        (total, task) => total + (task.story_Points || 0),
        0
      ),
    };
  });

  return (
    <div className="mt-4">
      <h4 className="font-semibold mb-3">Module Breakdown</h4>
      <div className="space-y-3">
        {moduleStats.map((stat) => (
          <div key={stat.id} className="bg-white p-3 rounded-lg shadow-sm">
            <div className="flex justify-between items-center">
              <span className="font-medium">{stat.title}</span>
              <span className="text-sm text-gray-500">
                {stat.taskCount} tasks
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span>Hours: {stat.hoursSpent}</span>
              <span>Story Points: {stat.storyPoints}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ member, modules }) => {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate completion percentage (if there are tasks)
  const completionPercentage =
    member.numberTasksCompleted > 0
      ? Math.round(
          (member.numberTasksCompleted / (member.numberTasksCompleted + 5)) *
            100
        )
      : 0;

  return (
    <div className="bg-white p-5 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">{member.user.username}</h3>
          <p className="text-sm text-gray-500">{member.role}</p>
        </div>
        <div className="relative">
          <ProgressPieChart progress={completionPercentage} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Tasks Completed</div>
          <div className="text-xl font-semibold">
            {member.numberTasksCompleted}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Hours Worked</div>
          <div className="text-xl font-semibold">
            {member.numberHoursWorked}
          </div>
        </div>
      </div>

      <button
        className="mt-4 w-full py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors"
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Hide Details" : "Show Details"}
      </button>

      {showDetails && (
        <ModuleBreakdown tasks={member.tasksCompleted} modules={modules} />
      )}
    </div>
  );
};

// Define the KPI component as a proper React component
function KPIView() {
  const [employees, setEmployees] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch employees data
        const employeesData = await getFromAPI("employees/1/employees");
        setEmployees(employeesData);

        // Fetch modules data
        const modulesData = await getModules();
        setModules(modulesData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching KPI data:", err);
        setError("Failed to load KPI data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Performance KPIs</h1>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employees.map((employee) => (
          <TeamMemberCard
            key={employee.id}
            member={employee}
            modules={modules}
          />
        ))}
      </div>

      <div className="mt-6 bg-white p-5 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Team Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Total Team Members</div>
            <div className="text-2xl font-semibold">{employees.length}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Total Tasks Completed</div>
            <div className="text-2xl font-semibold">
              {employees.reduce(
                (total, emp) => total + emp.numberTasksCompleted,
                0
              )}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-500">Total Hours Worked</div>
            <div className="text-2xl font-semibold">
              {employees.reduce(
                (total, emp) => total + emp.numberHoursWorked,
                0
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Export the component
export default KPIView;
