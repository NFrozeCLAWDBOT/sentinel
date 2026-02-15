resource "aws_lambda_function" "ingestion" {
  function_name = "${var.project_name}-ingestion"
  role          = aws_iam_role.ingestion_lambda.arn
  handler       = "lambda_function.handler"
  runtime       = "python3.12"
  timeout       = 300
  memory_size   = 256

  filename         = "${path.module}/../lambda/ingestion/ingestion.zip"
  source_code_hash = filebase64sha256("${path.module}/../lambda/ingestion/ingestion.zip")

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.vulnerabilities.name
    }
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-api"
  role          = aws_iam_role.api_lambda.arn
  handler       = "lambda_function.handler"
  runtime       = "python3.12"
  timeout       = 30
  memory_size   = 128

  filename         = "${path.module}/../lambda/api/api.zip"
  source_code_hash = filebase64sha256("${path.module}/../lambda/api/api.zip")

  environment {
    variables = {
      TABLE_NAME = aws_dynamodb_table.vulnerabilities.name
    }
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

resource "aws_lambda_permission" "eventbridge" {
  statement_id  = "AllowEventBridgeInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.ingestion.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.ingestion_schedule.arn
}
