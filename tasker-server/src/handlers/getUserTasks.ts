import { queryTasks } from "@/lib/util";

export const handler = async (event: any): Promise<any> => {
  const { userId } = event.pathParameters;
  try {
    const authorTasks = await queryTasks(
      userId,
      "GSI-author-user-id",
      "authorUserId"
    );

    const assigneeTasks = await queryTasks(
      userId,
      "GSI-assigned-user-id",
      "assignedUserId"
    );

    const userTasks = [...authorTasks, ...assigneeTasks];

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userTasks),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Error retrieving tasks for user: ${error.message}`,
      }),
    };
  }
};
