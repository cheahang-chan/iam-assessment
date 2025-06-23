resource "aws_elastic_beanstalk_application" "app" {
  name        = "ebs-app-${var.env_name}-${var.region}-${var.org_name}-${var.app_name}"
  description = "Elastic Beanstalk app for ${var.org_name}/${var.app_name} in ${var.env_name} (${var.aws_region})"
}

resource "aws_elastic_beanstalk_environment" "env" {
  name                = "ebs-env-${var.env_name}-${var.region}-${var.org_name}-${var.app_name}"
  application         = aws_elastic_beanstalk_application.app.name
  solution_stack_name = "64bit Amazon Linux 2 v4.1.2 running Docker"

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "InstanceType"
    value     = "t3.micro"
  }

  setting {
    namespace = "aws:elasticbeanstalk:application:environment"
    name      = "APP_SECRET_ARN"
    value     = aws_secretsmanager_secret.app_secrets.arn
  }

  setting {
    namespace = "aws:autoscaling:launchconfiguration"
    name      = "IamInstanceProfile"
    value     = aws_iam_instance_profile.eb_instance_profile.name
  }
}
