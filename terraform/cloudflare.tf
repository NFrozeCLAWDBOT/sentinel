resource "cloudflare_record" "sentinel" {
  zone_id = var.cloudflare_zone_id
  name    = "sentinel"
  content = aws_s3_bucket_website_configuration.frontend.website_endpoint
  type    = "CNAME"
  proxied = true
  ttl     = 1
}
