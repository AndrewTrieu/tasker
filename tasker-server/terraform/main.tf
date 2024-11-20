terraform {
  backend "s3" {
    bucket = "gamelog-terraform-tfstate"
    key    = "terraform.tfstate"
    region = "eu-west-1"
  }
}

provider "aws" {}
