const mockQuery = jest.fn();

import { handler } from "../src/handlers/getUsers";

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocument: {
    from: jest.fn(() => ({
      query: mockQuery,
    })),
  },
}));

describe("getUsers handler", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should retrieve all users and return a 200 response", async () => {
    const mockUsers = [
      { userId: "user_1", username: "User1", category: "users" },
      { userId: "user_2", username: "User2", category: "users" },
    ];

    mockQuery.mockResolvedValue({
      Items: mockUsers,
    });

    const response = await handler({});

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-user-table",
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": "users",
      },
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(mockUsers),
    });
  });

  it("should return an empty array if no users are found", async () => {
    mockQuery.mockResolvedValue({
      Items: [],
    });

    const response = await handler({});

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-user-table",
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": "users",
      },
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify([]),
    });
  });

  it("should return a 500 response if there is an error", async () => {
    const mockError = new Error("DynamoDB query error");
    mockQuery.mockRejectedValue(mockError);

    const response = await handler({});

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-user-table",
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": "users",
      },
    });

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Error retrieving users: ${mockError.message}`,
      }),
    });
  });
});
