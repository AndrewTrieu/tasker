import { DynamoDB } from "aws-sdk";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_PROJECT_TABLE_NAME = process.env.TASKER_PROJECT_TABLE_NAME || "";
const TASKER_USER_TABLE_NAME = process.env.TASKER_USER_TABLE_NAME || "";
const TASKER_TASK_TABLE_NAME = process.env.TASKER_TASK_TABLE_NAME || "";
const TASKER_TASK_EXTRA_TABLE_NAME =
  process.env.TASKER_TASK_EXTRA_TABLE_NAME || "";

const docClient = new DynamoDB.DocumentClient({ region: SLS_REGION });

export const fetchRandomTeamId = async () => {
  const params = {
    TableName: TASKER_PROJECT_TABLE_NAME,
    KeyConditionExpression: "type = :type",
    ExpressionAttributeValues: {
      ":type": "teams",
    },
  };

  const projects = await docClient.query(params).promise();
  if (!projects.Items) {
    return null;
  }
  const randomProject =
    projects.Items[Math.floor(Math.random() * projects.Items.length)];
  return randomProject.id;
};

export const fetchUserWithUserId = async (userId: string): Promise<any> => {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TASKER_USER_TABLE_NAME,
    KeyConditionExpression: "type = :type AND userId = :userId",
    IndexName: "GSI-user-id",
    ExpressionAttributeValues: {
      ":type": "users",
      ":userId": userId,
    },
  };

  const result = await docClient.query(params).promise();
  return result.Items?.[0];
};

export const fetchComments = async (taskId: string): Promise<any> => {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TASKER_TASK_EXTRA_TABLE_NAME,
    KeyConditionExpression: "type = :type AND taskId = :taskId",
    IndexName: "GSI-task-id",
    ExpressionAttributeValues: {
      ":type": "comments",
      ":taskId": taskId,
    },
  };

  const result = await docClient.query(params).promise();
  return result.Items;
};

export const fetchAttachments = async (taskId: string): Promise<any> => {
  const params: DynamoDB.DocumentClient.QueryInput = {
    TableName: TASKER_TASK_EXTRA_TABLE_NAME,
    KeyConditionExpression: "type = :type AND taskId = :taskId",
    IndexName: "GSI-task-id",
    ExpressionAttributeValues: {
      ":type": "attachments",
      ":taskId": taskId,
    },
  };

  const result = await docClient.query(params).promise();
  return result.Items;
};

export const queryTasks = async (
  userId: string,
  indexName: string,
  key: string
): Promise<DynamoDB.ItemList> => {
  const params = {
    TableName: TASKER_TASK_TABLE_NAME,
    KeyConditionExpression: "type = :type AND #key = :userId",
    IndexName: indexName,
    ExpressionAttributeValues: {
      ":type": "tasks",
      ":userId": userId,
    },
    ExpressionAttributeNames: {
      "#key": key,
    },
  };

  const result = await docClient.query(params).promise();
  return result.Items ?? [];
};
