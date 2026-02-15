variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "sentinel"
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-2"
}

variable "domain_name" {
  description = "Domain name for the frontend"
  type        = string
  default     = "sentinel.nfroze.co.uk"
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for nfroze.co.uk"
  type        = string
  default     = "cdccc75819418e12002199451b6bde4e"
}
