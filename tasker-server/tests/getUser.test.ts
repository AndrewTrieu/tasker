const mockQuery = jest.fn();

import { handler } from "../src/handlers/getUser";

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocument: {
    from: jest.fn(() => ({
      query: mockQuery,
    })),
  },
}));

describe("getUser handler", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should retrieve a user and return a 200 response", async () => {
    const mockUser = {
      cognitoId: "cognito_123",
      userId: "user_1",
      username: "TestUser",
      category: "users",
    };

    mockQuery.mockResolvedValue({
      Items: [mockUser],
    });

    const event = {
      pathParameters: { cognitoId: "cognito_123" },
    };

    const response = await handler(event);

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-user-table",
      KeyConditionExpression: "category = :category AND cognitoId = :cognitoId",
      ExpressionAttributeValues: {
        ":category": "users",
        ":cognitoId": "cognito_123",
      },
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(mockUser),
    });
  });

  it("should return an empty object if no user is found", async () => {
    mockQuery.mockResolvedValue({
      Items: [],
    });

    const event = {
      pathParameters: { cognitoId: "cognito_456" },
    };

    const response = await handler(event);

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-user-table",
      KeyConditionExpression: "category = :category AND cognitoId = :cognitoId",
      ExpressionAttributeValues: {
        ":category": "users",
        ":cognitoId": "cognito_456",
      },
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({}),
    });
  });

  it("should return a 500 response if there is an error", async () => {
    const mockError = new Error("DynamoDB query error");
    mockQuery.mockRejectedValue(mockError);

    const event = {
      pathParameters: { cognitoId: "cognito_123" },
    };

    const response = await handler(event);

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-user-table",
      KeyConditionExpression: "category = :category AND cognitoId = :cognitoId",
      ExpressionAttributeValues: {
        ":category": "users",
        ":cognitoId": "cognito_123",
      },
    });

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Error retrieving user: ${mockError.message}`,
      }),
    });
  });
});
