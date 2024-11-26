const mockQueryTasks = jest.fn();

import { handler } from "../src/handlers/getUserTasks";
import { queryTasks } from "@/lib/util";

jest.mock("@/lib/util", () => ({
  queryTasks: mockQueryTasks,
}));

describe("getUserTasks handler", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should retrieve tasks authored and assigned to the user and return a 200 response", async () => {
    const mockAuthorTasks = [
      { taskId: "task_1", title: "Authored Task 1" },
      { taskId: "task_2", title: "Authored Task 2" },
    ];
    const mockAssigneeTasks = [
      { taskId: "task_2", title: "Authored Task 2" }, // Duplicate task
      { taskId: "task_3", title: "Assigned Task 3" },
    ];

    const mockUniqueTasks = [
      { taskId: "task_1", title: "Authored Task 1" },
      { taskId: "task_2", title: "Authored Task 2" },
      { taskId: "task_3", title: "Assigned Task 3" },
    ];

    mockQueryTasks
      .mockResolvedValueOnce(mockAuthorTasks)
      .mockResolvedValueOnce(mockAssigneeTasks);

    const event = {
      pathParameters: { userId: "user_123" },
    };

    const response = await handler(event);

    expect(queryTasks).toHaveBeenCalledWith(
      "user_123",
      "GSI-author-user-id",
      "authorUserId"
    );
    expect(queryTasks).toHaveBeenCalledWith(
      "user_123",
      "GSI-assigned-user-id",
      "assignedUserId"
    );

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(mockUniqueTasks),
    });
  });

  it("should return a 500 response if queryTasks fails", async () => {
    const mockError = new Error("Query failed");

    mockQueryTasks.mockRejectedValueOnce(mockError);

    const event = {
      pathParameters: { userId: "user_123" },
    };

    const response = await handler(event);

    expect(queryTasks).toHaveBeenCalledWith(
      "user_123",
      "GSI-author-user-id",
      "authorUserId"
    );

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Error retrieving tasks for user: ${mockError.message}`,
      }),
    });
  });

  it("should handle empty author and assignee tasks gracefully", async () => {
    mockQueryTasks.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

    const event = {
      pathParameters: { userId: "user_123" },
    };

    const response = await handler(event);

    expect(queryTasks).toHaveBeenCalledWith(
      "user_123",
      "GSI-author-user-id",
      "authorUserId"
    );
    expect(queryTasks).toHaveBeenCalledWith(
      "user_123",
      "GSI-assigned-user-id",
      "assignedUserId"
    );

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify([]),
    });
  });
});
