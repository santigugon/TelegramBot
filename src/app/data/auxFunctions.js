export const getFromAPI = async (endpoint) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FRONT_END_URL}/${endpoint}`,
      {
        method: "GET",
        headers: {
          "ngrok-skip-browser-warning": "true", // Add this header to skip the warning page
        },
      }
    );

    const result = await response.json();
    console.log("API response:", result);
    return result;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
