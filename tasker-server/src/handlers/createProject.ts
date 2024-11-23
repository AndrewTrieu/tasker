import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, PutCommandInput } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_PROJECT_TABLE_NAME = process.env.TASKER_PROJECT_TABLE_NAME || "";

const client = new DynamoDBClient({ region: SLS_REGION });
const docClient = DynamoDBDocument.from(client);

export const handler = async (event: any): Promise<any> => {
  const { name, description, startDate, endDate } = event.body;
  try {
    const newProject = {
      category: "projects",
      projectId: `project#${uuidv4()}`,
      name,
      description,
      startDate,
      endDate,
    };

    const params: PutCommandInput = {
      TableName: TASKER_PROJECT_TABLE_NAME,
      Item: newProject,
    };

    await docClient.put(params);

    return {
      status: 201,
      body: JSON.stringify(newProject),
    };
  } catch (error: any) {
    return {
      status: 500,
      body: JSON.stringify({
        message: `Error creating project: ${error.message}`,
      }),
    };
  }
};
