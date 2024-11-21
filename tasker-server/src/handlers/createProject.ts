import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const SLS_REGION = process.env.SLS_REGION;
const TASKER_PROJECT_TABLE_NAME = process.env.TASKER_PROJECT_TABLE_NAME || "";

const docClient = new DynamoDB.DocumentClient({ region: SLS_REGION });

export const handler = async (event: any): Promise<any> => {
  const { name, description, startDate, endDate } = event.body;
  try {
    const newProject = {
      type: "projects",
      projectId: `project#${uuidv4()}`,
      name,
      description,
      startDate,
      endDate,
    };

    const params = {
      TableName: TASKER_PROJECT_TABLE_NAME,
      Item: newProject,
    };

    await docClient.put(params).promise();

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
