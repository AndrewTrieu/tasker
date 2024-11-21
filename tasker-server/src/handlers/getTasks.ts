import {
  fetchAttachments,
  fetchComments,
  fetchUserWithUserId,
} from "@/lib/util";
import { DynamoDB } from "aws-sdk";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_TASK_TABLE_NAME = process.env.TASKER_TASK_TABLE_NAME || "";

const docClient = new DynamoDB.DocumentClient({ region: SLS_REGION });

export const handler = async (event: any): Promise<any> => {
  const { projectId } = event.queryStringParameters;
  try {
    const params = {
      TableName: TASKER_TASK_TABLE_NAME,
      KeyConditionExpression: "type = :type AND projectId = :projectId",
      IndexName: "GSI-project-id",
      ExpressionAttributeValues: {
        ":type": "tasks",
        ":projectId": projectId,
      },
    };

    const result = await docClient.query(params).promise();
    const tasks = result.Items || [];

    const tasksWithDetails = await Promise.all(
      tasks.map(async (task: any) => {
        const author = task.authorUserId
          ? await fetchUserWithUserId(task.authorUserId)
          : null;

        const assignee = task.assignedUserId
          ? await fetchUserWithUserId(task.assignedUserId)
          : null;

        const comments = await fetchComments(task.taskId);

        const attachments = await fetchAttachments(task.taskId);

        return {
          ...task,
          author,
          assignee,
          comments,
          attachments,
        };
      })
    );

    return {
      status: 200,
      body: JSON.stringify(tasksWithDetails),
    };
  } catch (error: any) {
    return {
      status: 500,
      body: JSON.stringify({
        message: `Error retrieving tasks: ${error.message}`,
      }),
    };
  }
};
