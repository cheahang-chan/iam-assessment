variable "aws_region" {
  description = "AWS region to deploy to"
  type        = string
  default     = "ap-southeast-1"
}

variable "region" {
  description = "Shortened AWS region to deploy to"
  type        = string
  default     = "sg"
}

variable "app_name" {
  description = "Elastic Beanstalk application name"
  type        = string
  default     = "security-groups"
}

variable "env_name" {
  description = "The name of the environment (dev, stg, prd)"
  type        = string

  validation {
    condition     = contains(["dev", "stg", "prd"], var.env_name)
    error_message = "Valid values for env_name is 'dev', 'stg' and 'prd'."
  }
}

variable "org_name" {
  description = "Organization name"
  type        = string
  default     = "gt"
}

variable "mongo_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}

variable "azure_client_id" {
  description = "Azure Client ID"
  type        = string
}

variable "azure_tenant_id" {
  description = "Azure Tenant ID"
  type        = string
}

variable "azure_client_secret" {
  description = "Azure Client Secret"
  type        = string
  sensitive   = true
}
