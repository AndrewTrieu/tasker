const mockPut = jest.fn();

import { handler } from "../src/handlers/createProject";
import { v4 as uuidv4 } from "uuid";

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

describe("handler", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should create a new project and return 201 response", async () => {
    const mockUUID = "mock-uuid";
    (uuidv4 as jest.Mock).mockReturnValue(mockUUID);

    const event = {
      body: JSON.stringify({
        name: "Test Project",
        description: "This is a test project.",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      }),
    };

    mockPut.mockResolvedValue({});

    const response = await handler(event);

    expect(mockPut).toHaveBeenCalledWith({
      TableName: "mock-project-table",
      Item: {
        category: "projects",
        projectId: `project_${mockUUID}`,
        name: "Test Project",
        description: "This is a test project.",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      },
    });

    expect(response).toEqual({
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        category: "projects",
        projectId: `project_${mockUUID}`,
        name: "Test Project",
        description: "This is a test project.",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      }),
    });
  });

  it("should return 500 response on error", async () => {
    const event = {
      body: JSON.stringify({
        name: "Test Project",
        description: "This is a test project.",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
      }),
    };

    const mockError = new Error("DynamoDB error");
    mockPut.mockRejectedValue(mockError);

    const response = await handler(event);

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Error creating project: ${mockError.message}`,
      }),
    });
  });
});
