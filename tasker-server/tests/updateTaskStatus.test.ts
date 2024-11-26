const mockUpdate = jest.fn();

import { handler } from "../src/handlers/updateTaskStatus"; // Adjust the path as needed

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocument: {
    from: jest.fn(() => ({
      update: mockUpdate,
    })),
  },
}));

describe("updateTaskStatus handler", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should update the task status and return the updated task", async () => {
    const mockUpdatedTask = {
      category: "tasks",
      taskId: "task_123",
      status: "Completed",
    };

    mockUpdate.mockResolvedValue({
      Attributes: mockUpdatedTask,
    });

    const event = {
      pathParameters: { taskId: "task_123" },
      body: JSON.stringify({ status: "Completed" }),
    };

    const response = await handler(event);

    expect(mockUpdate).toHaveBeenCalledWith({
      TableName: "mock-task-table",
      Key: {
        category: "tasks",
        taskId: "task_123",
      },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "Completed",
      },
      ReturnValues: "ALL_NEW",
    });

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(mockUpdatedTask),
    });
  });

  it("should return a 500 response if the update fails", async () => {
    const mockError = new Error("DynamoDB update error");
    mockUpdate.mockRejectedValue(mockError);

    const event = {
      pathParameters: { taskId: "task_123" },
      body: JSON.stringify({ status: "Completed" }),
    };

    const response = await handler(event);

    expect(mockUpdate).toHaveBeenCalledWith({
      TableName: "mock-task-table",
      Key: {
        category: "tasks",
        taskId: "task_123",
      },
      UpdateExpression: "set #status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "Completed",
      },
      ReturnValues: "ALL_NEW",
    });

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Error updating task: ${mockError.message}`,
      }),
    });
  });

  it("should handle invalid input gracefully", async () => {
    const event = {
      pathParameters: { taskId: "task_123" },
      body: JSON.stringify({}),
    };

    const response = await handler(event);

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Error updating task: DynamoDB update error`,
      }),
    });
  });
});
