import { getFromAPI } from "@/app/data/auxFunctions";

export const getModules = async () => {
  try {
    const res = await getFromAPI("modules");
    const mappedRes = res.map((module) => ({
      ...module,
      moduleId: module.id,
    }));

    console.log("Modules:", res);
    return mappedRes;
  } catch (err) {
    console.error(err);
    return [];
  }
};
