import { DynamoDB } from "aws-sdk";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_USER_TABLE_NAME = process.env.TASKER_USER_TABLE_NAME || "";

const docClient = new DynamoDB.DocumentClient({ region: SLS_REGION });

export const handler = async (event: any): Promise<any> => {
  const { cognitoId } = event.pathParameters;
  try {
    const params = {
      TableName: TASKER_USER_TABLE_NAME,
      KeyConditionExpression: "type = :type AND cognitoId = :cognitoId",
      ExpressionAttributeValues: {
        ":type": "users",
        ":cognitoId": cognitoId,
      },
    };

    const user = await docClient.query(params).promise();

    return {
      status: 200,
      body: JSON.stringify(user.Items?.[0] || {}),
    };
  } catch (error: any) {
    return {
      status: 500,
      body: JSON.stringify({
        message: `Error retrieving user: ${error.message}`,
      }),
    };
  }
};
