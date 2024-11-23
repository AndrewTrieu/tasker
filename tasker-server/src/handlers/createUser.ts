import { fetchRandomTeamId } from "@/lib/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_USER_TABLE_NAME = process.env.TASKER_USER_TABLE_NAME || "";

const client = new DynamoDBClient({ region: SLS_REGION });
const docClient = DynamoDBDocument.from(client);

export const handler = async (event: any): Promise<any> => {
  const { username, cognitoId } = JSON.parse(event.body);
  const teamId = fetchRandomTeamId();

  try {
    const newUser = {
      category: "users",
      cognitoId,
      userId: `user#${uuidv4()}`,
      username,
      profilePictureUrl: "i0.jpg",
      teamId,
    };

    const params: PutCommandInput = {
      TableName: TASKER_USER_TABLE_NAME,
      Item: newUser,
    };

    await docClient.put(params);

    return {
      statusCode: 201,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `Error creating user: ${error.message}`,
      }),
    };
  }
};
