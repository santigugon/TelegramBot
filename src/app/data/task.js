import { getFromAPI } from "@/app/data/auxFunctions";

export const getTasks = async () => {
  try {
    const res = await getFromAPI("todolist");
    console.log("Tasks:", res);

    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
};
