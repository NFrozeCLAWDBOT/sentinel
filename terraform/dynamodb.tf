resource "aws_dynamodb_table" "vulnerabilities" {
  name         = "${var.project_name}-vulnerabilities"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "compositeScore"
    type = "N"
  }

  attribute {
    name = "publishedDate"
    type = "S"
  }

  attribute {
    name = "GSI3PK"
    type = "S"
  }

  global_secondary_index {
    name            = "CompositeScoreIndex"
    hash_key        = "GSI1PK"
    range_key       = "compositeScore"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "PublishedDateIndex"
    hash_key        = "GSI1PK"
    range_key       = "publishedDate"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "VendorIndex"
    hash_key        = "GSI3PK"
    range_key       = "compositeScore"
    projection_type = "ALL"
  }

  tags = {
    Project = var.project_name
  }
}
