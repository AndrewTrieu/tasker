resource "aws_cognito_user_pool" "tasker_cognito_user_pool" {
  name = "tasker-cognito-user-pool"

  # Sign-in options
  alias_attributes = ["preferred_username", "email"]

  # User name requirements
  username_configuration {
    case_sensitive = true
  }

  # Password policy
  password_policy {
    minimum_length    = 8
    require_uppercase = false
    require_lowercase = false
    require_numbers   = false
    require_symbols   = false
  }

  # MFA settings
  mfa_configuration = "OFF"

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # Auto-verified attributes
  auto_verified_attributes = ["email"]

  # Self-registration and message delivery
  admin_create_user_config {
    allow_admin_create_user_only = false # Enable self-registration
  }

  verification_message_template {
    default_email_option = "CONFIRM_WITH_CODE"
    email_subject        = "Tasker - Verify your email address"
    email_message        = "Your verification code is {####}."
  }

  user_attribute_update_settings {
    attributes_require_verification_before_update = ["email"]
  }

  tags = {
    Environment = "Dev"
  }
}

resource "aws_cognito_user_pool_client" "tasker_cognito_client" {
  name            = "tasker-cognito-client"
  user_pool_id    = aws_cognito_user_pool.tasker_cognito_user_pool.id
  generate_secret = false

  allowed_oauth_flows          = []
  allowed_oauth_scopes         = []
  supported_identity_providers = ["COGNITO"]

  prevent_user_existence_errors = "ENABLED"
}

resource "aws_cognito_user_pool_domain" "tasker_cognito_domain" {
  domain       = "tasker"
  user_pool_id = aws_cognito_user_pool.tasker_cognito_user_pool.id
}

resource "aws_ssm_parameter" "user_pool_id" {
  name        = "/tasker/cognito/user-pool-id"
  description = "Tasker Cognito User Pool ID"
  type        = "String"
  value       = aws_cognito_user_pool.tasker_cognito_user_pool.id
}

resource "aws_ssm_parameter" "user_pool_arn" {
  name        = "/tasker/cognito/user-pool-arn"
  description = "Tasker Cognito User Pool ARN"
  type        = "String"
  value       = aws_cognito_user_pool.tasker_cognito_user_pool.arn
}

resource "aws_ssm_parameter" "user_pool_name" {
  name        = "/tasker/cognito/user-pool-name"
  description = "Tasker Cognito User Pool Name"
  type        = "String"
  value       = aws_cognito_user_pool.tasker_cognito_user_pool.name
}

resource "aws_ssm_parameter" "client_id" {
  name        = "/tasker/cognito/client-id"
  description = "Tasker Cognito Client ID"
  type        = "String"
  value       = aws_cognito_user_pool_client.tasker_cognito_client.id
}

resource "aws_ssm_parameter" "cognito_domain" {
  name        = "/tasker/cognito/domain"
  description = "Tasker Cognito Domain"
  type        = "String"
  value       = aws_cognito_user_pool_domain.tasker_cognito_domain.domain
}
