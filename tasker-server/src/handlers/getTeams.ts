import { fetchUserWithUserId } from "@/lib/util";
import { DynamoDB } from "aws-sdk";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_TEAM_TABLE_NAME = process.env.TASKER_TEAM_TABLE_NAME || "";

const docClient = new DynamoDB.DocumentClient({ region: SLS_REGION });

export const handler = async (event: any): Promise<any> => {
  try {
    const params = {
      TableName: TASKER_TEAM_TABLE_NAME,
      KeyConditionExpression: "type = :type",
      ExpressionAttributeValues: {
        ":type": "teams",
      },
    };

    const result = await docClient.query(params).promise();
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
