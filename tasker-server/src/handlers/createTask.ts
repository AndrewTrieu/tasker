import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_TASK_TABLE_NAME = process.env.TASKER_TASK_TABLE_NAME || "";

const docClient = new DynamoDB.DocumentClient({ region: SLS_REGION });

export const handler = async (event: any): Promise<any> => {
  const {
    title,
    description,
    status,
    priority,
    tags,
    startDate,
    dueDate,
    points,
    projectId,
    authorUserId,
    assignedUserId,
  } = event.body;
  try {
    const newTask = {
      type: "tasks",
      taskId: `task#${uuidv4()}`,
      title,
      description,
      status,
      priority,
      tags,
      startDate,
      dueDate,
      points,
      projectId,
      authorUserId,
      assignedUserId,
    };

    const params = {
      TableName: TASKER_TASK_TABLE_NAME,
      Item: newTask,
    };

    await docClient.put(params).promise();

    return {
      status: 201,
      body: JSON.stringify(newTask),
    };
  } catch (error: any) {
    return {
      status: 500,
      body: JSON.stringify({
        message: `Error creating task: ${error.message}`,
      }),
    };
  }
};
