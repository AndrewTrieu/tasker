terraform {
  backend "s3" {
    bucket = "tasker-tf-infra"
    key    = "terraform.tfstate"
    region = "eu-north-1"
  }
}

provider "aws" {}
