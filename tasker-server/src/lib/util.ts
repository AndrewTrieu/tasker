import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, QueryCommandInput } from "@aws-sdk/lib-dynamodb";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_TEAM_TABLE_NAME = process.env.TASKER_TEAM_TABLE_NAME || "";
const TASKER_USER_TABLE_NAME = process.env.TASKER_USER_TABLE_NAME || "";
const TASKER_TASK_TABLE_NAME = process.env.TASKER_TASK_TABLE_NAME || "";
const TASKER_TASK_EXTRA_TABLE_NAME =
  process.env.TASKER_TASK_EXTRA_TABLE_NAME || "";

const client = new DynamoDBClient({ region: SLS_REGION });
const docClient = DynamoDBDocument.from(client);

export const fetchRandomTeamId = async () => {
  const params = {
    TableName: TASKER_TEAM_TABLE_NAME,
    KeyConditionExpression: "category = :category",
    ExpressionAttributeValues: {
      ":category": "teams",
    },
  };

  const teams = await docClient.query(params);
  if (!teams.Items) {
    return null;
  }
  const randomTeam =
    teams.Items[Math.floor(Math.random() * teams.Items.length)];
  return randomTeam.teamId;
};

export const fetchUserWithUserId = async (userId: string): Promise<any> => {
  const params: QueryCommandInput = {
    TableName: TASKER_USER_TABLE_NAME,
    KeyConditionExpression: "category = :category AND userId = :userId",
    IndexName: "GSI-user-id",
    ExpressionAttributeValues: {
      ":category": "users",
      ":userId": userId,
    },
  };

  const result = await docClient.query(params);
  return result.Items?.[0];
};

export const fetchComments = async (taskId: string): Promise<any> => {
  const params: QueryCommandInput = {
    TableName: TASKER_TASK_EXTRA_TABLE_NAME,
    KeyConditionExpression: "category = :category AND taskId = :taskId",
    IndexName: "GSI-task-id",
    ExpressionAttributeValues: {
      ":category": "comments",
      ":taskId": taskId,
    },
  };

  const result = await docClient.query(params);
  return result.Items;
};

export const fetchAttachments = async (taskId: string): Promise<any> => {
  const params: QueryCommandInput = {
    TableName: TASKER_TASK_EXTRA_TABLE_NAME,
    KeyConditionExpression: "category = :category AND taskId = :taskId",
    IndexName: "GSI-task-id",
    ExpressionAttributeValues: {
      ":category": "attachments",
      ":taskId": taskId,
    },
  };

  const result = await docClient.query(params);
  return result.Items;
};

export const queryTasks = async (
  userId: string,
  indexName: string,
  key: string
): Promise<any> => {
  const params: QueryCommandInput = {
    TableName: TASKER_TASK_TABLE_NAME,
    KeyConditionExpression: "category = :category AND #key = :userId",
    IndexName: indexName,
    ExpressionAttributeValues: {
      ":category": "tasks",
      ":userId": userId,
    },
    ExpressionAttributeNames: {
      "#key": key,
    },
  };

  const result = await docClient.query(params);
  return result.Items ?? [];
};
