output "api_url" {
  description = "API Gateway endpoint URL"
  value       = aws_apigatewayv2_stage.default.invoke_url
}

output "s3_website_endpoint" {
  description = "S3 static website endpoint"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.vulnerabilities.name
}

output "ingestion_lambda_name" {
  description = "Ingestion Lambda function name"
  value       = aws_lambda_function.ingestion.function_name
}

output "api_lambda_name" {
  description = "API Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "s3_bucket_name" {
  description = "S3 bucket name"
  value       = aws_s3_bucket.frontend.id
}
