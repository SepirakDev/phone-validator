# SEPira(k) Phone Validator

A lightweight service to validate phone numbers, built on Hono to be deployed on the edge with CloudFlare.


## Endpoints

### `POST /validate`
```shell
curl -X POST <hostname>/validate \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

### `GET /health`
```shell
curl <hostname>/health
```

## Deployment
[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/SepirakDev/phone-validator)
