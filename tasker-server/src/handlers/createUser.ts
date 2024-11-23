import { fetchRandomTeamId } from "@/lib/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_USER_TABLE_NAME = process.env.TASKER_USER_TABLE_NAME || "";

const client = new DynamoDBClient({ region: SLS_REGION });
const docClient = DynamoDBDocument.from(client);

export const handler = async (event: any): Promise<any> => {
  console.info(`Event: ${JSON.stringify(event)}`);
  const username =
    event.request.userAttributes["preferred_username"] || event.userName;
  const cognitoId = event.userName;
  const teamId = await fetchRandomTeamId();

  try {
    const newUser = {
      category: "users",
      cognitoId,
      userId: `user_${uuidv4()}`,
      username,
      profilePictureUrl: "p0.jpeg",
      teamId,
    };

    const params: PutCommandInput = {
      TableName: TASKER_USER_TABLE_NAME,
      Item: newUser,
    };

    await docClient.put(params);

    console.info(`User ${username} created with teamId ${teamId}`);
  } catch (error: any) {
    throw new Error(`Error creating user: ${error.message}`);
  }

  return event;
};
