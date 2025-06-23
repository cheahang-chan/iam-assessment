resource "aws_s3_bucket" "beanstalk_bucket" {
  bucket        = "s3-${var.env_name}-${var.region}-${var.org_name}-${var.app_name}-${random_id.bucket_id.hex}"
  force_destroy = true
}

resource "random_id" "bucket_id" {
  byte_length = 4
}
