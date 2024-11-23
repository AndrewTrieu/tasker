import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_PROJECT_TABLE_NAME = process.env.TASKER_PROJECT_TABLE_NAME || "";

const client = new DynamoDBClient({ region: SLS_REGION });
const docClient = DynamoDBDocument.from(client);

export const handler = async (event: any): Promise<any> => {
  try {
    const params: QueryCommandInput = {
      TableName: TASKER_PROJECT_TABLE_NAME,
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": "projects",
      },
    };

    const projects = await docClient.query(params);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projects.Items),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Error retrieving projects: ${error.message}`,
      }),
    };
  }
};
