const mockQuery = jest.fn();

import { handler } from "../src/handlers/getProjects";

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocument: {
    from: jest.fn(() => ({
      query: mockQuery,
    })),
  },
}));

describe("getProjects handler", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should retrieve projects and return a 200 response", async () => {
    const mockProjects = [
      { projectId: "project_1", name: "Project 1" },
      { projectId: "project_2", name: "Project 2" },
    ];

    mockQuery.mockResolvedValue({
      Items: mockProjects,
    });

    const response = await handler({});

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-project-table",
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": "projects",
      },
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(mockProjects),
    });
  });

  it("should return a 500 response if the query fails", async () => {
    const mockError = new Error("DynamoDB query error");
    mockQuery.mockRejectedValue(mockError);

    const response = await handler({});

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-project-table",
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": "projects",
      },
    });

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Error retrieving projects: ${mockError.message}`,
      }),
    });
  });
});
