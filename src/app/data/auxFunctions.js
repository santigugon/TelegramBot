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

export const postFromAPI = async (endpoint, data) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FRONT_END_URL}/${endpoint}`,
      {
        method: "POST",
        headers: {
          "ngrok-skip-browser-warning": "true", // Add this header to skip the warning page
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    console.log("API response:", result);
    return result;
  } catch (error) {
    console.error("Error posting data:", error);
    throw error;
  }
};

export const deleteFromAPI = async (endpoint) => {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FRONT_END_URL}/${endpoint}`,
      {
        method: "DELETE",
        headers: {
          "ngrok-skip-browser-warning": "true", // Add this header to skip the warning page
        },
      }
    );

    const result = await response.json();
    console.log("API response:", result);
    return result;
  } catch (error) {
    console.error("Error deleting data:", error);
    throw error;
  }
};

export const putFromAPI = async (endpoint, data) => {
  try {
    console.log("PUT request endpoint:", endpoint);
    console.log("PUT request data:", data);
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_FRONT_END_URL}/${endpoint}`,
      {
        method: "PUT",
        headers: {
          "ngrok-skip-browser-warning": "true", // Add this header to skip the warning page
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    const result = await response.json();
    console.log("API response:", result);
    return result;
  } catch (error) {
    console.error("Error putting data:", error);
    throw error;
  }
};
