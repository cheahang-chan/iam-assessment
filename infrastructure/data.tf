data "aws_secretsmanager_secret_version" "azure" {
  secret_id = "secret-${var.env_name}-${var.region}-${var.org_name}-${var.app_name}-azure-credentials"
}

data "aws_secretsmanager_secret_version" "mongo" {
  secret_id = "secret-${var.env_name}-${var.region}-${var.org_name}-${var.app_name}-mongo-uri"
}
