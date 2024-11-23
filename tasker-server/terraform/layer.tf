resource "aws_s3_bucket" "tasker_lambda_layer" {
  bucket = "tasker-lambda-layer"
}

resource "aws_s3_object" "tasker_lambda_layer_zip" {
  bucket = aws_s3_bucket.tasker_lambda_layer.id
  key    = "layers/tasker-layer.zip"
  source = "../layers/tasker-layer.zip"
}

resource "aws_lambda_layer_version" "tasker_layer" {
  layer_name          = "tasker-layer"
  s3_bucket           = aws_s3_object.tasker_lambda_layer_zip.bucket
  s3_key              = aws_s3_object.tasker_lambda_layer_zip.key
  compatible_runtimes = ["nodejs20.x"]

  description = "Tasker Lambda Layer with shared dependencies"
}

resource "aws_ssm_parameter" "tasker_layer_arn" {
  name  = "/tasker/layers/tasker-layer-arn"
  type  = "String"
  value = aws_lambda_layer_version.tasker_layer.arn
}
