resource "aws_cloudwatch_event_rule" "ingestion_schedule" {
  name                = "${var.project_name}-ingestion-schedule"
  description         = "Trigger vulnerability ingestion every 6 hours"
  schedule_expression = "rate(6 hours)"

  tags = {
    Project = var.project_name
  }
}

resource "aws_cloudwatch_event_target" "ingestion_lambda" {
  rule      = aws_cloudwatch_event_rule.ingestion_schedule.name
  target_id = "${var.project_name}-ingestion"
  arn       = aws_lambda_function.ingestion.arn
}
