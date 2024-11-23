import {
  fetchAttachments,
  fetchComments,
  fetchUserWithUserId,
} from "@/lib/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_TASK_TABLE_NAME = process.env.TASKER_TASK_TABLE_NAME || "";

const client = new DynamoDBClient({ region: SLS_REGION });
const docClient = DynamoDBDocument.from(client);

export const handler = async (event: any): Promise<any> => {
  const { projectId } = event.queryStringParameters;
  try {
    const params: QueryCommandInput = {
      TableName: TASKER_TASK_TABLE_NAME,
      KeyConditionExpression: "category = :category AND projectId = :projectId",
      IndexName: "GSI-project-id",
      ExpressionAttributeValues: {
        ":category": "tasks",
        ":projectId": projectId,
      },
    };

    const result = await docClient.query(params);
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
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(tasksWithDetails),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Error retrieving tasks: ${error.message}`,
      }),
    };
  }
};
