resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"]
    allow_methods = ["GET", "OPTIONS"]
    allow_headers = ["Content-Type"]
    max_age       = 3600
  }

  tags = {
    Project = var.project_name
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  tags = {
    Project = var.project_name
  }
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.api.invoke_arn
  payload_format_version = "2.0"
}

# Specific routes BEFORE wildcard to avoid greedy matching
resource "aws_apigatewayv2_route" "search" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/vulnerabilities/search"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "top10" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/vulnerabilities/top10"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "vulnerabilities" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/vulnerabilities"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "vulnerability_detail" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/vulnerabilities/{cveId}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "stats" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/stats"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "trends" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/trends"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}
