#!/bin/sh
set -e
# Get the secrets from aws secrets manager
# transform them into KEY=value pairing, and store in temp file
# rely on dotenv to add the environment variables to the node process

if [ -n "$APP_SECRET_ARN" ]; then
    APP_SECRETS_JSON=$(aws secretsmanager get-secret-value --secret-id "$APP_SECRET_ARN" --region "$AWS_REGION" | jq -r .SecretString)

    echo "$APP_SECRETS_JSON" | jq -r 'to_entries[] | "export \(.key)=\(.value)"' > /tmp/set_env.sh
    source /tmp/set_env.sh

    unset APP_SECRETS_JSON
fi

exec "$@"