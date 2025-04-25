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

// Bar Chart Component for Time Comparison
const TimeComparisonChart = ({ estimatedTime, actualTime, moduleName }) => {
  const maxTime = Math.max(estimatedTime, actualTime);
  const estimatedWidth = (estimatedTime / maxTime) * 100;
  const actualWidth = (actualTime / maxTime) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-black">{moduleName}</span>
        <span className="text-sm text-gray-500">
          {actualTime}/{estimatedTime} hrs
        </span>
      </div>
      <div className="space-y-3">
        <div className="w-full bg-gray-200 rounded-full h-3 relative">
          <div
            className="bg-blue-600 h-3 rounded-full"
            style={{ width: `${estimatedWidth}%` }}
          ></div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 relative">
          <div
            className="bg-green-600 h-3 rounded-full"
            style={{ width: `${actualWidth}%` }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between mt-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-600 rounded-full mr-2"></div>
          <span className="text-blue-600">Estimated</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-600 rounded-full mr-2"></div>
          <span className="text-green-600">Actual</span>
        </div>
      </div>
    </div>
  );
};

// Other KPIs Modal Component
const OtherKPIsModal = ({ modules, tasks, onClose }) => {
  // Filter urgent tasks (7+ story points)
  const urgentTasks = tasks.filter((task) => task.story_Points >= 7);

  // Group urgent tasks by module
  const urgentTasksByModule = {};
  modules.forEach((module) => {
    urgentTasksByModule[module.id] = urgentTasks.filter(
      (task) => task.moduleId === module.id
    );
  });

  // Calculate time comparison data
  const timeComparisonData = modules.map((module) => {
    const moduleTasks = tasks.filter((task) => task.moduleId === module.id);
    const totalEstimatedTime = moduleTasks.reduce(
      (sum, task) => sum + (task.estimatedTime || 0),
      0
    );
    const totalActualTime = moduleTasks.reduce(
      (sum, task) => sum + (task.actualTime || 0),
      0
    );

    return {
      moduleId: module.id,
      moduleName: module.title,
      estimatedTime: totalEstimatedTime,
      actualTime: totalActualTime,
    };
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold text-black">Other KPIs</h3>
          <button
            className="text-gray-500 hover:text-gray-700 p-2"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex-1">
          <div className="mb-8">
            <h4 className="font-semibold mb-4 text-lg text-black">
              Urgent Tasks by Module (7+ Story Points)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modules.map((module) => {
                const urgentModuleTasks = urgentTasksByModule[module.id] || [];
                return (
                  <div
                    key={module.id}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-semibold text-black">
                        {module.title}
                      </h5>
                      <span className="text-sm bg-red-500 text-white px-3 py-1 rounded-full">
                        {urgentModuleTasks.length} urgent tasks
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm text-gray-600">
                        Total Story Points:{" "}
                        {urgentModuleTasks.reduce(
                          (sum, task) => sum + task.story_Points,
                          0
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        Completion Rate:{" "}
                        {urgentModuleTasks.length > 0
                          ? Math.round(
                              (urgentModuleTasks.filter((task) => task.done)
                                .length /
                                urgentModuleTasks.length) *
                                100
                            )
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-lg text-black">
              Estimated vs. Actual Time by Module
            </h4>
            <div className="space-y-4">
              {timeComparisonData.map((data) => (
                <TimeComparisonChart
                  key={data.moduleId}
                  moduleName={data.moduleName}
                  estimatedTime={data.estimatedTime}
                  actualTime={data.actualTime}
                />
              ))}
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
        <div className="flex justify-between items-center p-6 border-b">
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

        <div className="overflow-y-auto p-6 flex-1">
          <div className="flex flex-col items-center justify-center mb-10">
            <div className="relative">
              <ProgressPieChart progress={progressPercentage} size={180} />
            </div>
            <div className="mt-4 text-center">
              <span className="text-lg font-medium text-black">
                {progressPercentage}% Complete
              </span>
            </div>
          </div>

          <div className="w-full mb-8">
            <h4 className="font-semibold mb-6 text-lg text-black">
              Module Breakdown
            </h4>
            <div className="space-y-8">
              {Object.keys(tasksByModule).map((moduleId) => {
                const moduleTasks = tasksByModule[moduleId];
                const module = modules.find(
                  (m) => m.id === parseInt(moduleId)
                ) || { title: `Module ${moduleId}` };

                if (moduleTasks.length === 0) return null;

                return (
                  <div
                    key={moduleId}
                    className="bg-gray-50 p-6 rounded-lg border border-gray-200"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-semibold text-lg text-black">
                        {module.title}
                      </h5>
                      <span className="text-sm bg-primary text-white px-4 py-1.5 rounded-full">
                        {moduleTasks.length} tasks
                      </span>
                    </div>

                    <div className="space-y-4 mt-6">
                      {moduleTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white p-5 rounded-md shadow-sm border border-gray-100"
                        >
                          <div className="font-medium text-base text-black">
                            {task.description}
                          </div>
                          <div className="flex justify-between text-sm mt-3 text-gray-600">
                            <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded">
                              Story Points: {task.story_Points}
                            </span>
                            <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded">
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

          <div className="w-full">
            <h4 className="font-semibold mb-6 text-lg text-black">
              Time Comparison
            </h4>
            <div className="space-y-6">
              {Object.keys(tasksByModule).map((moduleId) => {
                const moduleTasks = tasksByModule[moduleId];
                const module = modules.find(
                  (m) => m.id === parseInt(moduleId)
                ) || { title: `Module ${moduleId}` };

                if (moduleTasks.length === 0) return null;

                const totalEstimatedTime = moduleTasks.reduce(
                  (sum, task) => sum + task.estimatedTime,
                  0
                );
                const totalActualTime = moduleTasks.reduce(
                  (sum, task) => sum + task.actualTime,
                  0
                );

                return (
                  <TimeComparisonChart
                    key={moduleId}
                    moduleName={module.title}
                    estimatedTime={totalEstimatedTime}
                    actualTime={totalActualTime}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6 border-t">
          <button
            className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
      className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onShowDetails(member)}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg text-black">
            {member.user.username}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{member.role}</p>
        </div>
        <div className="relative">
          <ProgressPieChart progress={completionPercentage} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Tasks Completed</div>
          <div className="text-xl font-semibold text-black">
            {member.numberTasksCompleted}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="text-sm text-gray-500 mb-1">Hours Worked</div>
          <div className="text-xl font-semibold text-black">
            {member.hoursWorked}
          </div>
        </div>
      </div>

      <button
        className="mt-6 w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        onClick={(e) => {
          e.stopPropagation();
          onShowDetails(member);
        }}
      >
        <span className="text-xl">👤</span>
        <span className="font-medium text-black">View Employee Details</span>
      </button>
    </div>
  );
};

// Define the KPI component as a proper React component
function KPIView() {
  const [employees, setEmployees] = useState([]);
  const [modules, setModules] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showOtherKPIs, setShowOtherKPIs] = useState(false);

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

        // Fetch tasks data
        const tasksData = await getFromAPI("todolist");
        setTasks(tasksData);

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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-black">Team Performance</h1>
          <button
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            onClick={() => setShowOtherKPIs(true)}
          >
            <span className="text-xl">📊</span>
            <span className="font-medium text-black">View Other KPIs</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {employees.map((employee) => (
            <TeamMemberCard
              key={employee.id}
              member={employee}
              modules={modules}
              onShowDetails={handleShowEmployeeDetails}
            />
          ))}
        </div>
      </div>

      {selectedEmployee && (
        <EmployeeTaskModal
          employee={selectedEmployee}
          modules={modules}
          onClose={() => setSelectedEmployee(null)}
        />
      )}

      {showOtherKPIs && (
        <OtherKPIsModal
          modules={modules}
          tasks={tasks}
          onClose={() => setShowOtherKPIs(false)}
        />
      )}
    </div>
  );
}

// Export the component
export default KPIView;
