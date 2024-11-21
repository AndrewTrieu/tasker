import { fetchRandomTeamId } from "@/lib/util";
import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_USER_TABLE_NAME = process.env.TASKER_USER_TABLE_NAME || "";

const docClient = new DynamoDB.DocumentClient({ region: SLS_REGION });

export const handler = async (event: any): Promise<any> => {
  const { username, cognitoId, profilePictureUrl = "i0.jpg" } = event.body;
  const teamId = fetchRandomTeamId();

  try {
    const newUser = {
      type: "users",
      cognitoId,
      userId: `user#${uuidv4()}`,
      username,
      profilePictureUrl,
      teamId,
    };

    const params = {
      TableName: TASKER_USER_TABLE_NAME,
      Item: newUser,
    };

    await docClient.put(params).promise();

    return {
      status: 201,
      body: JSON.stringify(newUser),
    };
  } catch (error: any) {
    return {
      status: 500,
      body: JSON.stringify({
        message: `Error creating user: ${error.message}`,
      }),
    };
  }
};
