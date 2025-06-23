output "beanstalk_url" {
  value = aws_elastic_beanstalk_environment.env.endpoint_url
}
