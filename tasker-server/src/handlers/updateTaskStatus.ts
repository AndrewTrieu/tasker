import { DynamoDB } from "aws-sdk";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_TASK_TABLE_NAME = process.env.TASKER_TASK_TABLE_NAME || "";

const docClient = new DynamoDB.DocumentClient({ region: SLS_REGION });

export const handler = async (event: any): Promise<any> => {
  const { taskId } = event.pathParameters;
  const { status } = event.body;
  try {
    const params = {
      TableName: TASKER_TASK_TABLE_NAME,
      Key: {
        type: "tasks",
        taskId,
      },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
      ReturnValues: "ALL_NEW",
    };

    const updatedTask = await docClient.update(params).promise();

    return {
      status: 200,
      body: JSON.stringify(updatedTask.Attributes),
    };
  } catch (error: any) {
    return {
      status: 500,
      body: JSON.stringify({
        message: `Error updating task: ${error.message}`,
      }),
    };
  }
};
