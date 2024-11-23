import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_TASK_TABLE_NAME = process.env.TASKER_TASK_TABLE_NAME || "";

const client = new DynamoDBClient({ region: SLS_REGION });
const docClient = DynamoDBDocument.from(client);

export const handler = async (event: any): Promise<any> => {
  const { taskId } = event.pathParameters;
  const { status } = event.body;
  try {
    const params: UpdateCommandInput = {
      TableName: TASKER_TASK_TABLE_NAME,
      Key: {
        category: "tasks",
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

    const updatedTask = await docClient.update(params);

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
