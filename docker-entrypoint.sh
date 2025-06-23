#!/bin/sh
set -e
# Get the secrets from aws secrets manager
# transform them into KEY=value pairing, and store in temp file
# rely on dotenv to add the environment variables to the node process

if [ -n "$APP_SECRET_ARN" ]; then
    aws secretsmanager get-secret-value --secret-id "$APP_SECRET_ARN" --query SecretString --output text | jq -r 'to_entries|map("\(.key)=\(.value|tostring)")|.[]' > .env
fi

exec "$@"