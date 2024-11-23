import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_USER_TABLE_NAME = process.env.TASKER_USER_TABLE_NAME || "";

const client = new DynamoDBClient({ region: SLS_REGION });
const docClient = DynamoDBDocument.from(client);

export const handler = async (event: any): Promise<any> => {
  try {
    const params: QueryCommandInput = {
      TableName: TASKER_USER_TABLE_NAME,
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": "users",
      },
    };

    const users = await docClient.query(params);

    return {
      status: 200,
      body: JSON.stringify(users.Items),
    };
  } catch (error: any) {
    return {
      status: 500,
      body: JSON.stringify({
        message: `Error retrieving users: ${error.message}`,
      }),
    };
  }
};
