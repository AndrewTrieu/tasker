const mockQuery = jest.fn();
const mockFetchUserWithUserId = jest.fn();
const mockFetchComments = jest.fn();
const mockFetchAttachments = jest.fn();

import { handler } from "../src/handlers/getTasks";

jest.mock("@aws-sdk/lib-dynamodb", () => ({
  DynamoDBDocument: {
    from: jest.fn(() => ({
      query: mockQuery,
    })),
  },
}));

jest.mock("@/lib/util", () => ({
  fetchUserWithUserId: mockFetchUserWithUserId,
  fetchComments: mockFetchComments,
  fetchAttachments: mockFetchAttachments,
}));

describe("getTasks handler", () => {
  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("should retrieve tasks with details and return a 200 response", async () => {
    const mockTasks = [
      {
        taskId: "task_1",
        title: "Task 1",
        authorUserId: "user_1",
        assignedUserId: "user_2",
      },
      {
        taskId: "task_2",
        title: "Task 2",
      },
    ];

    const mockAuthor = { userId: "user_1", username: "AuthorUser" };
    const mockAssignee = { userId: "user_2", username: "AssigneeUser" };
    const mockComments = [{ commentId: "comment_1", content: "Nice work!" }];
    const mockAttachments = [
      { attachmentId: "attachment_1", name: "file.pdf" },
    ];

    mockQuery.mockResolvedValue({ Items: mockTasks });

    mockFetchUserWithUserId.mockResolvedValueOnce(mockAuthor);
    mockFetchUserWithUserId.mockResolvedValueOnce(mockAssignee);
    mockFetchComments.mockResolvedValue(mockComments);
    mockFetchAttachments.mockResolvedValue(mockAttachments);

    const event = {
      queryStringParameters: { projectId: "project_123" },
    };

    const response = await handler(event);

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-task-table",
      KeyConditionExpression: "category = :category AND projectId = :projectId",
      IndexName: "GSI-project-id",
      ExpressionAttributeValues: {
        ":category": "tasks",
        ":projectId": "project_123",
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
          taskId: "task_1",
          title: "Task 1",
          authorUserId: "user_1",
          assignedUserId: "user_2",
          author: mockAuthor,
          assignee: mockAssignee,
          comments: mockComments,
          attachments: mockAttachments,
        },
        {
          taskId: "task_2",
          title: "Task 2",
          author: null,
          assignee: null,
          comments: mockComments,
          attachments: mockAttachments,
        },
      ]),
    });
  });

  it("should return a 500 response if there is an error", async () => {
    const mockError = new Error("DynamoDB query error");
    mockQuery.mockRejectedValue(mockError);

    const event = {
      queryStringParameters: { projectId: "project_123" },
    };

    const response = await handler(event);

    expect(mockQuery).toHaveBeenCalledWith({
      TableName: "mock-task-table",
      KeyConditionExpression: "category = :category AND projectId = :projectId",
      IndexName: "GSI-project-id",
      ExpressionAttributeValues: {
        ":category": "tasks",
        ":projectId": "project_123",
      },
    });

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: `Error retrieving tasks: ${mockError.message}`,
      }),
    });
  });
});
