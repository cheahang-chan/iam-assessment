# GovTech IAM Software Engineer Assessment

A Node.js/TypeScript service for synchronizing security-enabled groups from Microsoft Graph API into a MongoDB database.

---

## Table of Contents

- [GovTech IAM Software Engineer Assessment](#govtech-iam-software-engineer-assessment)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [ENV Configuration](#env-configuration)
  - [Running the Service](#running-the-service)
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

---

## Features

- Syncs security-enabled groups from Microsoft Graph API to MongoDB
- TypeScript-first, with strong typing and validation (Zod)
- OpenAPI (Swagger) documentation
- Dockerized for easy local development and deployment
- Modular, testable architecture

---

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/)
- (Optional) [Node.js](https://nodejs.org/) v18+ and [Yarn](https://yarnpkg.com/) if running locally

---

## Setup

1. **Clone the repository:**

2. **Copy and configure environment variables:**
   ```sh
   cp .env.sample .env
   ```
   Edit `.env` to provide your Microsoft Graph and MongoDB credentials.

---

## ENV Configuration

The service uses environment variables for configuration. See `.env.sample` for all required variables:

- `MONGO_URI` - MongoDB connection string
- `GRAPH_CLIENT_ID` - Azure AD App Client ID
- `GRAPH_CLIENT_SECRET` - Azure AD App Client Secret
- `GRAPH_TENANT_ID` - Azure AD Tenant ID
- `PORT` - Port for the API server (default: 3000)

---

## Running the Service

### Using Docker Compose (Recommended)

Build and start all services (API, MongoDB) with:

```sh
docker-compose up --build
```

- The API will be available at [http://localhost:3000](http://localhost:3000)
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

---

## API Documentation

OpenAPI (Swagger) documentation is available at:

```
http://localhost:3000/api-docs
```

See `openapi/v1/openapi.yaml` for the full API spec.

### Updating the OpenAPI Documentation

To validate and build the OpenAPI docs after making changes, run:

```sh
yarn swagger:validate
yarn swagger:build
```

These commands will update and check your OpenAPI specification for correctness.

---

## Seeding Security Groups

To create sample security groups in Azure AD (for development/testing):

```sh
yarn seed:groups
```

> Requires valid Microsoft Graph credentials in your `.env`.

---

## Testing

This project uses [Jest](https://jestjs.io/) for testing.

- **Unit tests** are located alongside the service code in `__tests__` directories.
- **Integration tests** can be added under the `tests/` directory.

### Running Tests

In order to run E2E test, the app needs to be connected to a MongoDB instance. You may spin up a MongoDB instance in Docker Compose or configure `MONGO_URI` in `.env` to use a cloud instance.
```sh
docker-compose up -d mongodb
```

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

A summary will be displayed in the terminal.

---

## Troubleshooting

- **MongoDB connection errors:** Ensure MongoDB is running and `MONGO_URI` is correct.
- **Microsoft Graph errors:** Check your Azure AD app credentials and permissions.
- **Port conflicts:** Change the `PORT` variable in your `.env`, `docker-compose.yml`, and `Dockerfile`.

Logs are output to the console by default.

---