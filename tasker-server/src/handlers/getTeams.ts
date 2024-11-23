import { fetchUserWithUserId } from "@/lib/util";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_TEAM_TABLE_NAME = process.env.TASKER_TEAM_TABLE_NAME || "";

const client = new DynamoDBClient({ region: SLS_REGION });
const docClient = DynamoDBDocument.from(client);

export const handler = async (event: any): Promise<any> => {
  try {
    const params: QueryCommandInput = {
      TableName: TASKER_TEAM_TABLE_NAME,
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": "teams",
      },
    };

    const result = await docClient.query(params);
    const teams = result.Items || [];

    const teamsWithUsernames = await Promise.all(
      teams.map(async (team: any) => {
        const productOwnerUsername = team.productOwnerUserId
          ? (await fetchUserWithUserId(team.productOwnerUserId))?.username
          : null;

        const projectManagerUsername = team.projectManagerUserId
          ? (await fetchUserWithUserId(team.projectManagerUserId))?.username
          : null;

        return {
          ...team,
          productOwnerUsername,
          projectManagerUsername,
        };
      })
    );

    return {
      status: 200,
      body: JSON.stringify(teamsWithUsernames),
    };
  } catch (error: any) {
    return {
      status: 500,
      body: JSON.stringify({
        message: `Error retrieving teams: ${error.message}`,
      }),
    };
  }
};
