import { DynamoDB } from "aws-sdk";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_PROJECT_TABLE_NAME = process.env.TASKER_PROJECT_TABLE_NAME || "";

const docClient = new DynamoDB.DocumentClient({ region: SLS_REGION });

export const handler = async (event: any): Promise<any> => {
  try {
    const params = {
      TableName: TASKER_PROJECT_TABLE_NAME,
      KeyConditionExpression: "type = :type",
      ExpressionAttributeValues: {
        ":type": "projects",
      },
    };

    const projects = await docClient.query(params).promise();

    return {
      status: 200,
      body: JSON.stringify(projects.Items),
    };
  } catch (error: any) {
    return {
      status: 500,
      body: JSON.stringify({
        message: `Error retrieving projects: ${error.message}`,
      }),
    };
  }
};
