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

// Employee Task Modal Component
const EmployeeTaskModal = ({ employee, modules, onClose }) => {
  // Group tasks by module
  const tasksByModule = {};
  modules.forEach((module) => {
    tasksByModule[module.id] = employee.tasksCompleted.filter(
      (task) => task.moduleId === module.id
    );
  });

  // Calculate overall progress
  const totalTasks = employee.tasksCompleted.length;
  const completedTasks = employee.tasksCompleted.filter(
    (task) => task.done
  ).length;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-black">
            {employee.user.username} - Task Details
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700 p-2"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex-1">
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="relative">
              <ProgressPieChart progress={progressPercentage} size={180} />
            </div>
            <div className="mt-3 text-center">
              <span className="text-lg font-medium text-black">
                {progressPercentage}% Complete
              </span>
            </div>
          </div>

          <div className="w-full">
            <h4 className="font-semibold mb-4 text-lg text-black">
              Module Breakdown
            </h4>
            <div className="space-y-5">
              {Object.keys(tasksByModule).map((moduleId) => {
                const moduleTasks = tasksByModule[moduleId];
                const module = modules.find(
                  (m) => m.id === parseInt(moduleId)
                ) || { title: `Module ${moduleId}` };

                if (moduleTasks.length === 0) return null;

                return (
                  <div
                    key={moduleId}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200 my-10"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="font-semibold text-lg text-black">
                        {module.title}
                      </h5>
                      <span className="text-sm bg-primary text-white px-3 py-1 rounded-full">
                        {moduleTasks.length} tasks
                      </span>
                    </div>

                    <div className="space-y-3 mt-4">
                      {moduleTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white p-4 rounded-md shadow-sm border border-gray-100"
                        >
                          <div className="font-medium text-base text-black">
                            {task.description}
                          </div>
                          <div className="flex justify-between text-sm mt-2 text-gray-600">
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">
                              Story Points: {task.story_Points}
                            </span>
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded">
                              Hours: {task.actualTime}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 border-t">
          <button
            className="w-full py-3 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors font-medium"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Team Member Card Component
const TeamMemberCard = ({ member, modules, onShowDetails }) => {
  // Calculate completion percentage (if there are tasks)
  const completionPercentage =
    member.numberTasksCompleted > 0
      ? Math.round(
          (member.numberTasksCompleted / (member.numberTasksCompleted + 5)) *
            100
        )
      : 0;

  return (
    <div
      className="bg-white p-5 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onShowDetails(member)}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-black">
            {member.user.username}
          </h3>
          <p className="text-sm text-gray-500">{member.role}</p>
        </div>
        <div className="relative">
          <ProgressPieChart progress={completionPercentage} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Tasks Completed</div>
          <div className="text-xl font-semibold text-black">
            {member.numberTasksCompleted}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm text-gray-500">Hours Worked</div>
          <div className="text-xl font-semibold text-black">
            {member.numberHoursWorked}
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-center">
        <button
          className="py-3 px-6 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors flex items-center shadow-md"
          onClick={(e) => {
            e.stopPropagation(); // Prevent triggering the card click
            onShowDetails(member);
          }}
        >
          <span className="mr-2 text-xl">👤</span>
          <span className="font-medium text-black">View Details</span>
        </button>
      </div>
    </div>
  );
};

// Define the KPI component as a proper React component
function KPIView() {
  const [employees, setEmployees] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

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

  const handleShowEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
  };

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
            onShowDetails={handleShowEmployeeDetails}
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

      {/* Employee Task Modal */}
      {selectedEmployee && (
        <EmployeeTaskModal
          employee={selectedEmployee}
          modules={modules}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}

// Export the component
export default KPIView;
