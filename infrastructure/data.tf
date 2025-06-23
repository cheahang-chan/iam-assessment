data "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id = "secret-${var.env_name}-${var.region}-${var.org_name}-${var.app_name}-env"
}