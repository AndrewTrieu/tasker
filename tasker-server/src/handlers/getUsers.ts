import { DynamoDB } from "aws-sdk";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_USER_TABLE_NAME = process.env.TASKER_USER_TABLE_NAME || "";

const docClient = new DynamoDB.DocumentClient({ region: SLS_REGION });

export const handler = async (event: any): Promise<any> => {
  try {
    const params = {
      TableName: TASKER_USER_TABLE_NAME,
      KeyConditionExpression: "type = :type",
      ExpressionAttributeValues: {
        ":type": "users",
      },
    };

    const users = await docClient.query(params).promise();

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
