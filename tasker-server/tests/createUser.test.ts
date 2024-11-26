const mockPut = jest.fn();

import { handler } from "../src/handlers/createUser";
import { v4 as uuidv4 } from "uuid";
import { fetchRandomTeamId } from "@/lib/util";

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocument: {
    from: jest.fn(() => ({
      put: mockPut,
    })),
  },
}));

jest.mock("uuid", () => ({
  v4: jest.fn(),
}));

jest.mock("@/lib/util", () => ({
  fetchRandomTeamId: jest.fn(),
}));

describe("createUser handler", () => {
  beforeAll(() => {
    jest.spyOn(console, "info").mockImplementation(jest.fn());
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should create a new user and log a success message", async () => {
    const mockUUID = "mock-uuid";
    const mockTeamId = "team-123";
    (uuidv4 as jest.Mock).mockReturnValue(mockUUID);
    (fetchRandomTeamId as jest.Mock).mockResolvedValue(mockTeamId);

    const event = {
      request: {
        userAttributes: {
          preferred_username: "testUser",
          sub: "cognito-123",
        },
      },
      userName: "fallbackUser",
    };

    mockPut.mockResolvedValue({});

    const response = await handler(event);

    expect(fetchRandomTeamId).toHaveBeenCalled();
    expect(mockPut).toHaveBeenCalledWith({
      TableName: "mock-user-table",
      Item: {
        category: "users",
        cognitoId: "cognito-123",
        userId: `user_${mockUUID}`,
        username: "testUser",
        profilePictureUrl: "p0.jpeg",
        teamId: mockTeamId,
      },
    });

    expect(response).toEqual(event);
  });

  it("should throw an error if DynamoDB operation fails", async () => {
    const mockUUID = "mock-uuid";
    const mockTeamId = "team-123";
    (uuidv4 as jest.Mock).mockReturnValue(mockUUID);
    (fetchRandomTeamId as jest.Mock).mockResolvedValue(mockTeamId);

    const event = {
      request: {
        userAttributes: {
          preferred_username: "testUser",
          sub: "cognito-123",
        },
      },
      userName: "fallbackUser",
    };

    const mockError = new Error("DynamoDB error");
    mockPut.mockRejectedValue(mockError);

    await expect(handler(event)).rejects.toThrow(
      "Error creating user: DynamoDB error"
    );

    expect(fetchRandomTeamId).toHaveBeenCalled();
    expect(mockPut).toHaveBeenCalledWith({
      TableName: "mock-user-table",
      Item: {
        category: "users",
        cognitoId: "cognito-123",
        userId: `user_${mockUUID}`,
        username: "testUser",
        profilePictureUrl: "p0.jpeg",
        teamId: mockTeamId,
      },
    });
  });
});
