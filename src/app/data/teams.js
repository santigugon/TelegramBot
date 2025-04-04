import { getFromAPI } from "@/app/data/auxFunctions";

export const getTeams = async () => {
  try {
    const res = await getFromAPI("teams ");
    const colors = {
      primary: "#FF5733", // Example color for primary
      secondary: "#3A4A63", // Example color for secondary
      accent: "#3357FF", // Example color for accent
    };

    const colorMapping = {
      team24: colors.accent,
      Backend: colors.secondary,
      DevOps: colors.accent,
      QA: "#7D3C98", // Purple
      Design: "#2E86C1", // Blue
    };

    const teamsMapped = res.map((team) => ({
      ...team,
      color: colorMapping[team.name] || "#3A4A63", // Default to black if no mapping exists
    }));
    return teamsMapped;
  } catch (err) {
    console.error(err);
    return [];
  }
};
