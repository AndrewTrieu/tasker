const mockQuery = jest.fn();
const mockFetchUserWithUserId = jest.fn();

import { handler } from "../src/handlers/getTeams";

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocument: {
    from: jest.fn(() => ({
      query: mockQuery,
    })),
  },
}));

jest.mock("@/lib/util", () => ({
  fetchUserWithUserId: mockFetchUserWithUserId,
}));

describe("getTeams handler", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should retrieve teams with usernames and return a 200 response", async () => {
    const mockTeams = [
      {
        teamId: "team_1",
        name: "Team A",
        productOwnerUserId: "user_1",
        projectManagerUserId: "user_2",
      },
      {
        teamId: "team_2",
        name: "Team B",
        productOwnerUserId: "user_3",
      },
    ];

    const mockProductOwner1 = { userId: "user_1", username: "POUser1" };
    const mockProjectManager1 = { userId: "user_2", username: "PMUser2" };
    const mockProductOwner2 = { userId: "user_3", username: "POUser3" };

    mockQuery.mockResolvedValue({ Items: mockTeams });

    mockFetchUserWithUserId.mockImplementation((userId) => {
      if (userId === "user_1") return Promise.resolve(mockProductOwner1);
      if (userId === "user_2") return Promise.resolve(mockProjectManager1);
      if (userId === "user_3") return Promise.resolve(mockProductOwner2);
      return Promise.resolve(null);
    });

    const response = await handler({});

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-team-table",
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": "teams",
      },
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify([
        {
          teamId: "team_1",
          name: "Team A",
          productOwnerUserId: "user_1",
          projectManagerUserId: "user_2",
          productOwnerUsername: "POUser1",
          projectManagerUsername: "PMUser2",
        },
        {
          teamId: "team_2",
          name: "Team B",
          productOwnerUserId: "user_3",
          projectManagerUserId: undefined,
          productOwnerUsername: "POUser3",
          projectManagerUsername: null,
        },
      ]),
    });
  });

  it("should return a 500 response if there is an error", async () => {
    const mockError = new Error("DynamoDB query error");
    mockQuery.mockRejectedValue(mockError);

    const response = await handler({});

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-team-table",
      KeyConditionExpression: "category = :category",
      ExpressionAttributeValues: {
        ":category": "teams",
      },
    });

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Error retrieving teams: ${mockError.message}`,
      }),
    });
  });
});
