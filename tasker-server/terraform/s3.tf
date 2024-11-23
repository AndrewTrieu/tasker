resource "aws_s3_bucket" "tasker_public_images" {
  bucket = "tasker-public-images"
}

resource "aws_s3_bucket_policy" "public_read_policy" {
  bucket = aws_s3_bucket.tasker_public_images.id
  policy = data.aws_iam_policy_document.public_read_policy.json
}

data "aws_iam_policy_document" "public_read_policy" {
  statement {
    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.tasker_public_images.arn}/*"]
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
  }
}

resource "aws_s3_bucket_ownership_controls" "tasker_public_images_ownership_controls" {
  bucket = aws_s3_bucket.tasker_public_images.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_public_access_block" "tasker_public_images_public_access_block" {
  bucket = aws_s3_bucket.tasker_public_images.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "tasker_public_images_acl" {
  depends_on = [
    aws_s3_bucket_ownership_controls.tasker_public_images_ownership_controls,
    aws_s3_bucket_public_access_block.tasker_public_images_public_access_block,
  ]

  bucket = aws_s3_bucket.tasker_public_images.id
  acl    = "public-read"
}

resource "aws_ssm_parameter" "tasker_public_images_name" {
  name  = "/tasker/s3/public-images-bucket-name"
  type  = "String"
  value = aws_s3_bucket.tasker_public_images.bucket
}

resource "aws_ssm_parameter" "tasker_public_images_arn" {
  name  = "/tasker/s3/public-images-bucket-arn"
  type  = "String"
  value = aws_s3_bucket.tasker_public_images.arn
}
