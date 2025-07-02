## Deployment & CI Status
![CI](https://github.com/cheahang-chan/iam-assessment/actions/workflows/deploy-dev.yml/badge.svg) ![CI](https://github.com/cheahang-chan/iam-assessment/actions/workflows/deploy-prd.yml/badge.svg)

| Demo Environment | |
|------|-------|
|[Development](https://dev-security-groups.cheahang.dev/api-docs)|![Deployment](https://img.shields.io/badge/deployed-success-brightgreen?style=flat-square&logo=aws)

# GovTech IAM Software Engineer Assessment

A Node.js/TypeScript service for synchronizing security-enabled groups from Microsoft Graph API into a MongoDB database.

## Features

- Syncs security-enabled groups from Microsoft Graph API to MongoDB
- TypeScript-first, with strong typing and validation (Zod)
- OpenAPI (Swagger) documentation
- Dockerized for easy local development and deployment
- Modular, testable architecture

## Table of Contents
- [GovTech IAM Software Engineer Assessment](#govtech-iam-software-engineer-assessment)
  - [Features](#features)
  - [Table of Contents](#table-of-contents)
  - [Quick Start](#quick-start)
    - [Prerequisites](#prerequisites)
    - [Setup](#setup)
    - [Environment Configuration](#environment-configuration)
  - [Running Service](#running-service)
    - [Using Docker Compose (Recommended)](#using-docker-compose-recommended)
    - [Running Locally (Without Docker)](#running-locally-without-docker)
  - [API Documentation](#api-documentation)
    - [Updating the OpenAPI Documentation](#updating-the-openapi-documentation)
  - [Seeding Security Groups](#seeding-security-groups)
  - [Testing](#testing)
    - [Running Tests](#running-tests)
    - [Test Structure](#test-structure)
    - [Code Coverage](#code-coverage)
  - [Troubleshooting](#troubleshooting)
  - [Infrastructure as Code](#infrastructure-as-code)
  - [Correlation ID \& Distributed Tracing](#correlation-id--distributed-tracing)
    - [How it works](#how-it-works)
    - [Example](#example)
  - [Assumptions](#assumptions)
    - [Microft Graph API Integration](#microft-graph-api-integration)
    - [MongoDB Integration](#mongodb-integration)
    - [Authentication](#authentication)
    - [Sync Strategy](#sync-strategy)
    - [Deployment on AWS Elastic Beanstalk (EBS)](#deployment-on-aws-elastic-beanstalk-ebs)
    - [Observability](#observability)

## Quick Start
### Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)
- (Optional) [Node.js](https://nodejs.org/) v18+ and [Yarn](https://yarnpkg.com/) if running locally


### Setup

1. Clone the repository:
2. Copy and configure environment variables:
   ```sh
   cp .env.sample .env
   ```
   Edit `.env` to provide your Microsoft Graph and MongoDB credentials.

### Environment Configuration

The service uses environment variables for configuration. See `.env.sample` for all required variables:

- `MONGO_URI` - MongoDB connection string
- `GRAPH_CLIENT_ID` - Azure AD App Client ID
- `GRAPH_CLIENT_SECRET` - Azure AD App Client Secret
- `GRAPH_TENANT_ID` - Azure AD Tenant ID
- `PORT` - Port for the API server (default: 8080)

## Running Service

### Using Docker Compose (Recommended)

Build and start all services (API, MongoDB) with:

```sh
docker-compose up --build
```
- The API will be available at [http://localhost:8080](http://localhost:8080)
- MongoDB will be available at `mongodb://localhost:27017` (see `docker-compose.yml`)

### Running Locally (Without Docker)

1. **Install dependencies:**
   ```sh
   yarn install
   ```

2. **Start MongoDB** (if not using Docker):
   - Install and run MongoDB locally, or use a cloud MongoDB URI.

3. **Start the API server:**
   ```sh
   yarn dev
   ```

## API Documentation

Access Swagger UI at:

```
http://localhost:8080/api-docs
```

See `openapi/v1/openapi.yaml` for the full API spec.

### Updating the OpenAPI Documentation

To validate and build the OpenAPI docs after making changes, run:

```sh
yarn swagger:validate
yarn swagger:build
```

## Seeding Security Groups

To create sample security groups in Azure AD (for development/testing):

```sh
yarn seed:groups
```
> Requires valid Microsoft Graph credentials in your `.env`.

## Testing

This project uses [Jest](https://jestjs.io/) for testing.

- **Unit tests** are located alongside the service code in `__tests__` directories.
- **Integration tests** can be added under the `tests/` directory.

### Running Tests

To run all tests:

```sh
yarn test
```

### Test Structure

- Unit tests mock external dependencies (like MongoDB and Microsoft Graph) to ensure fast, isolated tests.
- Test files should use the `.test.ts` suffix.

### Code Coverage

To check code coverage, run:

```sh
yarn test --coverage
```

## Troubleshooting

- **MongoDB connection errors:** Ensure MongoDB is running and `MONGO_URI` is correct.
- **Microsoft Graph errors:** Check your Azure AD app credentials and permissions.
- **Port conflicts:** Change the `PORT` variable in your `.env`, `docker-compose.yml`, and `Dockerfile`.

Logs are output to the console by default.

## Infrastructure as Code

Infrastructure resources (e.g., AWS, secrets, S3, IAM, Beanstalk) are managed using [Terraform](https://www.terraform.io/).

- All Terraform files are in the `infrastructure/` directory.
- See [infrastructure/docs/README.md](infrastructure/docs/README.md) for detailed infrastructure setup and remote backend configuration.

---

## Correlation ID & Distributed Tracing

This service uses the `x-correlation-id` HTTP header to enable request tracing across distributed systems.

### How it works

- Every incoming HTTP request is checked for an `x-correlation-id` header.
- If present, the existing correlation ID is used; otherwise, a new UUID is generated.
- The correlation ID is attached to both the request and response headers.
- All error logs include the correlation ID for traceability.

### Example

```http
GET /api/v1/security-groups HTTP/1.1
Host: example.com
x-correlation-id: 123e4567-e89b-12d3-a456-426614174000
```

All logs and downstream requests related to this API call should include the same correlation ID.

## Assumptions
### Microft Graph API Integration
- The solution assumes the use of Client Credentials OAuth2.0 flow with a pre-registered Azure AD App to authenticate and fetch data from Microsoft Graph API.

- Only security-enabled groups (i.e., `securityEnabled: true`) are in scope for synchronization.

- The app syncs group metadata only. Group members are out of scope, but can be implemented further.

- Pagination is handled using Graph SDK’s `@odata.nextLink` helper, assuming the number of security groups may exceed a single page set via `AppConfig.EXTERNAL.AZURE.GRAPH_TOP_LIMIT` (Max 999 set by Microsoft Graph).

### MongoDB Integration
- The data is persisted in a MongoDB collection named `SecurityGroup`.
  
- Local development uses MongoDB via Docker Compose, while the production deployment targets a Cloud MongoDB Atlas server, with credentials injected via environment variables.

### Authentication
- The service exposes basic endpoints:
  - `POST /api/v1/sync`: Synchronizes data from Microsoft Graph API to MongoDB.
  - `GET /api/v1/security-groups{/:id}`: Retrieves all security groups stored in MongoDB.
  - `DELETE /api/v1/security-groups{/:id}`: Deletes a specific group by ID.
  
- API authentication is not enforced (e.g., no JWT or API key layer), assuming it’s acceptable for demo purposes.
  
### Sync Strategy
- The current implementation supports manual syncing via CLI; no scheduler or CRON job is included but can be configured using Cloud Scheduler tools like EventBridge.

- Sync logic is implemented as an internal service and can be triggered from a REST endpoint or CLI script.

### Deployment on AWS Elastic Beanstalk (EBS)
- The service is hosted as a Dockerized Node.js app on AWS EBS using a single-container Docker platform.
  
- MongoDB Atlas connection string and Graph API credentials are stored in AWS Secret Manager with the Secret ARN injected through EBS Environment and pulled using `docker-entrypoint.sh`.

- Port 8080 is assumed as per EBS expectations.

### Observability
- Basic logging is implemented via a custom Logger utility using Winston, outputting to console; no centralized log shipping (e.g., to CloudWatch or Datadog).

- CloudWatch Alerts can be setup to monitor instances of crtical errors and triggered via SNS Email/Webhook to Email/Slack.