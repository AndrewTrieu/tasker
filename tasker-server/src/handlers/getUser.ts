import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_USER_TABLE_NAME = process.env.TASKER_USER_TABLE_NAME || "";

const client = new DynamoDBClient({ region: SLS_REGION });
const docClient = DynamoDBDocument.from(client);

export const handler = async (event: any): Promise<any> => {
  const { cognitoId } = event.pathParameters;
  try {
    const params: QueryCommandInput = {
      TableName: TASKER_USER_TABLE_NAME,
      KeyConditionExpression: "category = :category AND cognitoId = :cognitoId",
      ExpressionAttributeValues: {
        ":category": "users",
        ":cognitoId": cognitoId,
      },
    };

    const user = await docClient.query(params);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user.Items?.[0] || {}),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Error retrieving user: ${error.message}`,
      }),
    };
  }
};
