resource "aws_dynamodb_table" "tasker_project_table" {
  name         = "tasker-project-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "type"
  range_key    = "projectId"

  attribute {
    name = "type"
    type = "S"
  }

  attribute {
    name = "projectId"
    type = "S"
  }
}

resource "aws_ssm_parameter" "tasker_project_table_name" {
  name  = "/tasker/dynamodb/project-table-name"
  type  = "String"
  value = aws_dynamodb_table.tasker_project_table.name
}

resource "aws_ssm_parameter" "tasker_project_table_arn" {
  name  = "/tasker/dynamodb/project-table-arn"
  type  = "String"
  value = aws_dynamodb_table.tasker_project_table.arn
}

resource "aws_dynamodb_table" "tasker_user_table" {
  name         = "tasker-user-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "type"
  range_key    = "cognitoId"

  attribute {
    name = "type"
    type = "S"
  }

  attribute {
    name = "cognitoId"
    type = "S"
  }

  attribute {
    name = "userId"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI-user-id"
    hash_key        = "type"
    range_key       = "userId"
    projection_type = "ALL"
  }
}

resource "aws_ssm_parameter" "tasker_user_table_name" {
  name  = "/tasker/dynamodb/user-table-name"
  type  = "String"
  value = aws_dynamodb_table.tasker_user_table.name
}

resource "aws_ssm_parameter" "tasker_user_table_arn" {
  name  = "/tasker/dynamodb/user-table-arn"
  type  = "String"
  value = aws_dynamodb_table.tasker_user_table.arn
}

resource "aws_dynamodb_table" "tasker_team_table" {
  name         = "tasker-team-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "type"
  range_key    = "teamId"

  attribute {
    name = "type"
    type = "S"
  }

  attribute {
    name = "teamId"
    type = "S"
  }
}

resource "aws_ssm_parameter" "tasker_team_table_name" {
  name  = "/tasker/dynamodb/team-table-name"
  type  = "String"
  value = aws_dynamodb_table.tasker_team_table.name
}

resource "aws_ssm_parameter" "tasker_team_table_arn" {
  name  = "/tasker/dynamodb/team-table-arn"
  type  = "String"
  value = aws_dynamodb_table.tasker_team_table.arn
}

resource "aws_dynamodb_table" "tasker_task_table" {
  name         = "tasker-task-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "type"
  range_key    = "taskId"

  attribute {
    name = "type"
    type = "S"
  }

  attribute {
    name = "taskId"
    type = "S"
  }

  attribute {
    name = "projectId"
    type = "S"
  }

  attribute {
    name = "authorUserId"
    type = "S"
  }

  attribute {
    name = "assignedUserId"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI-project-id"
    hash_key        = "type"
    range_key       = "projectId"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "GSI-author-user-id"
    hash_key        = "type"
    range_key       = "authorUserId"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "GSI-assigned-user-id"
    hash_key        = "type"
    range_key       = "assignedUserId"
    projection_type = "ALL"
  }
}

resource "aws_ssm_parameter" "tasker_task_table_name" {
  name  = "/tasker/dynamodb/task-table-name"
  type  = "String"
  value = aws_dynamodb_table.tasker_task_table.name
}

resource "aws_ssm_parameter" "tasker_task_table_arn" {
  name  = "/tasker/dynamodb/task-table-arn"
  type  = "String"
  value = aws_dynamodb_table.tasker_task_table.arn
}

resource "aws_dynamodb_table" "tasker_task_extra_table" {
  name         = "tasker-task-extra-table"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "type"
  range_key    = "id"

  attribute {
    name = "type"
    type = "S"
  }

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "taskId"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI-task-id"
    hash_key        = "type"
    range_key       = "taskId"
    projection_type = "ALL"
  }
}

resource "aws_ssm_parameter" "tasker_task_extra_table_name" {
  name  = "/tasker/dynamodb/task-extra-table-name"
  type  = "String"
  value = aws_dynamodb_table.tasker_task_extra_table.name
}

resource "aws_ssm_parameter" "tasker_task_extra_table_arn" {
  name  = "/tasker/dynamodb/task-extra-table-arn"
  type  = "String"
  value = aws_dynamodb_table.tasker_task_extra_table.arn
}
