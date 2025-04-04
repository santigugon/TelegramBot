const OracleLoader = ({
  size = 60,
  color = "#C74634",
  secondaryColor = "#3A7CA5",
  text = "Loading...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Primary Circle */}
        <div className="absolute inset-0 border-4 rounded-full border-gray-200 opacity-25"></div>

        {/* Animated Primary Arc */}
        <div className="absolute inset-0">
          <svg className="w-full h-full animate-spin" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="150 300"
            />
          </svg>
        </div>

        {/* Secondary Orbit */}
        <div className="absolute inset-0 rotate-45">
          <svg
            className="w-full h-full animate-spin"
            style={{ animationDuration: "3s" }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke={secondaryColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="50 300"
            />
          </svg>
        </div>

        {/* Oracle "O" in the center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-1/3 h-1/3 bg-white rounded-full border-2"
            style={{ borderColor: color }}
          ></div>
        </div>
      </div>

      {text && (
        <div className="mt-4 text-gray-700 font-medium text-sm">{text}</div>
      )}
    </div>
  );
};
export default OracleLoader;
