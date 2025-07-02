# Infrastructure as Code (IaC) for AWS Elastic Beanstalk

This directory contains Terraform code to provision and manage AWS infrastructure for the application, including Elastic Beanstalk, S3, and secrets management.

## Setup

1. **Install Terraform**: [Download Terraform](https://www.terraform.io/downloads.html)
2. **Configure AWS credentials**: Ensure your AWS CLI is configured with appropriate permissions.
3. **Initialize Terraform**:
   ```sh
   terraform init
   terraform workspace new [dev|stg|prd]
   terraform workspace select [dev|stg|prd]
   ```
4. **Review and update variables** in `terraform.tfvars` as needed.

## Infrastructure Architecture

This diagram illustrates the core AWS infrastructure components:
- **Elastic Beanstalk** hosts the Node.js/TypeScript application.
- **MongoDB** is used for data persistence (hosted on Atlas, EC2, or other).
- **S3** is used for storage of deployment artifacts.
- **Secrets Manager** stores sensitive configuration (API Keys / MongoDB Connection String).
- **IAM** manages permissions and roles for secure access.
- **Terraform** provisions and manages all resources.

## Provisioning Resources

Ensure runtime secrets are first provisioned to AWS Secret Manager before provisioning.
```sh
terraform apply -target="aws_secretsmanager_secret_version.app_secrets"
```

```sh
terraform apply
```

## Assumptions for Production

- **Remote State**: Use a remote backend (e.g., S3 with DynamoDB locking) for production to avoid local state file risks.
- **Access Control**: Restrict IAM permissions for Terraform execution to the minimum required.
- **Review Outputs**: Ensure outputs do not expose sensitive information.

## Cleaning Up

To destroy all resources created by this configuration:
```sh
terraform destroy
```