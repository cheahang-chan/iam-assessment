resource "aws_secretsmanager_secret" "app_secrets" {
  name        = "secret-${var.env_name}-${var.region}-${var.org_name}-${var.app_name}-env"
  description = "All runtime secrets for ${var.org_name}/${var.app_name} in ${var.env_name} (${var.aws_region})"
}

resource "aws_secretsmanager_secret_version" "app_secrets" {
  secret_id     = aws_secretsmanager_secret.app_secrets.id
  secret_string = jsonencode({
    NODE_ENV            = var.env_name == "prd" ? "production" : var.env_name
    AZURE_CLIENT_ID     = var.azure_client_id
    AZURE_TENANT_ID     = var.azure_tenant_id
    AZURE_CLIENT_SECRET = var.azure_client_secret
    MONGO_URI           = var.mongo_uri
  })
}
