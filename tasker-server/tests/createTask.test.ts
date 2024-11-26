const mockPut = jest.fn();

import { handler } from "../src/handlers/createTask";
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

describe("createTask handler", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should create a new task and return 201 response", async () => {
    const mockUUID = "mock-uuid";
    (uuidv4 as jest.Mock).mockReturnValue(mockUUID);

    const event = {
      body: JSON.stringify({
        title: "Test Task",
        description: "This is a test task.",
        status: "In Progress",
        priority: "High",
        tags: ["test", "jest"],
        startDate: "2024-01-01",
        dueDate: "2024-01-15",
        points: 5,
        projectId: "project_12345",
        authorUserId: "user_abc",
        assignedUserId: "user_xyz",
      }),
    };

    mockPut.mockResolvedValue({});

    const response = await handler(event);

    expect(mockPut).toHaveBeenCalledWith({
      TableName: "mock-task-table",
      Item: {
        category: "tasks",
        taskId: `task_${mockUUID}`,
        title: "Test Task",
        description: "This is a test task.",
        status: "In Progress",
        priority: "High",
        tags: ["test", "jest"],
        startDate: "2024-01-01",
        dueDate: "2024-01-15",
        points: 5,
        projectId: "project_12345",
        authorUserId: "user_abc",
        assignedUserId: "user_xyz",
      },
    });

    expect(response).toEqual({
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        category: "tasks",
        taskId: `task_${mockUUID}`,
        title: "Test Task",
        description: "This is a test task.",
        status: "In Progress",
        priority: "High",
        tags: ["test", "jest"],
        startDate: "2024-01-01",
        dueDate: "2024-01-15",
        points: 5,
        projectId: "project_12345",
        authorUserId: "user_abc",
        assignedUserId: "user_xyz",
      }),
    });
  });

  it("should return 500 response on error", async () => {
    const event = {
      body: JSON.stringify({
        title: "Test Task",
        description: "This is a test task.",
        status: "In Progress",
        priority: "High",
        tags: ["test", "jest"],
        startDate: "2024-01-01",
        dueDate: "2024-01-15",
        points: 5,
        projectId: "project_12345",
        authorUserId: "user_abc",
        assignedUserId: "user_xyz",
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
        message: `Error creating task: ${mockError.message}`,
      }),
    });
  });
});
