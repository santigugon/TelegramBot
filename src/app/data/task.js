import {
  getFromAPI,
  postFromAPI,
  deleteFromAPI,
  putFromAPI,
} from "@/app/data/auxFunctions";

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

export const postTask = async (task) => {
  try {
    const res = await postFromAPI("todolist", task);
    console.log("Task posted:", res);
    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const deleteTask = async (taskId) => {
  try {
    const res = await deleteFromAPI(`todolist/${taskId}`, taskId);
    console.log("Task deleted:", res);
    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const putTask = async (taskId, task) => {
  try {
    const res = await putFromAPI(`todolist/${taskId}`, task);
    console.log("Task updated:", res);
    return res;
  } catch (err) {
    console.error(err);
    return [];
  }
};
