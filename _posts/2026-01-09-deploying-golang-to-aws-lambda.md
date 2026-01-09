---
layout: post
title:  "Complete Guide: Deploying Go (Golang) to AWS Lambda"
author: kevin
categories: [ Go, AWS, Technology ]
image: assets/images/2026-01-09-deploying-golang-to-aws-lambda.png
---

AWS Lambda is a powerful serverless platform, and Go is one of the best languages for it — fast cold starts, tiny binaries, and excellent performance. This guide covers everything you need to deploy Go code to Lambda.

---

## Prerequisites

Before we start, make sure you have:

- **Go 1.21+** installed ([download](https://go.dev/dl/))
- **AWS CLI** configured with credentials ([setup guide](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html))
- An **AWS account** with Lambda permissions

---

## 1. Understanding Lambda's Go Runtime

AWS Lambda supports Go through the `provided.al2023` runtime (Amazon Linux 2023). Your Go code compiles to a native binary that Lambda executes directly — no interpreter overhead.

**Key points:**
- Lambda expects a binary named `bootstrap`
- Must be compiled for Linux (`GOOS=linux`)
- Use ARM64 for better price/performance (`GOARCH=arm64`)

---

## 2. Create Your Lambda Function

Create a new Go project:

```bash
mkdir my-lambda && cd my-lambda
go mod init my-lambda
```

Install the Lambda SDK:

```bash
go get github.com/aws/aws-lambda-go/lambda
```

Create `main.go`:

```go
package main

import (
	"context"
	"fmt"

	"github.com/aws/aws-lambda-go/lambda"
)

// Request is the input to your Lambda
type Request struct {
	Name string `json:"name"`
}

// Response is the output from your Lambda
type Response struct {
	Message string `json:"message"`
}

// Handler is your Lambda function
func Handler(ctx context.Context, req Request) (Response, error) {
	if req.Name == "" {
		req.Name = "World"
	}
	
	return Response{
		Message: fmt.Sprintf("Hello, %s!", req.Name),
	}, nil
}

func main() {
	lambda.Start(Handler)
}
```

---

## 3. Build for Lambda

Lambda requires a Linux binary. Build it with:

```bash
# For ARM64 (Graviton2 - recommended, cheaper)
GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bootstrap main.go

# For x86_64 (if you need it)
GOOS=linux GOARCH=amd64 go build -tags lambda.norpc -o bootstrap main.go
```

**Note:** The `-tags lambda.norpc` flag reduces binary size by excluding unused RPC code.

Zip the binary:

```bash
zip function.zip bootstrap
```

---

## 4. Deploy with AWS CLI

### Create an IAM Role (first time only)

Create a trust policy file `trust-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

Create the role:

```bash
aws iam create-role \
  --role-name lambda-go-role \
  --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
  --role-name lambda-go-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### Create the Lambda Function

```bash
aws lambda create-function \
  --function-name my-go-function \
  --runtime provided.al2023 \
  --architectures arm64 \
  --role arn:aws:iam::YOUR_ACCOUNT_ID:role/lambda-go-role \
  --handler bootstrap \
  --zip-file fileb://function.zip
```

Replace `YOUR_ACCOUNT_ID` with your AWS account ID.

### Update Existing Function

```bash
aws lambda update-function-code \
  --function-name my-go-function \
  --zip-file fileb://function.zip
```

---

## 5. Test Your Function

Invoke it from the CLI:

```bash
aws lambda invoke \
  --function-name my-go-function \
  --payload '{"name": "Gopher"}' \
  --cli-binary-format raw-in-base64-out \
  response.json

cat response.json
```

Output:

```json
{"message":"Hello, Gopher!"}
```

---

## 6. Add an API Gateway (HTTP Endpoint)

To expose your Lambda as an HTTP API:

```bash
aws apigatewayv2 create-api \
  --name my-go-api \
  --protocol-type HTTP \
  --target arn:aws:lambda:us-east-1:YOUR_ACCOUNT_ID:function:my-go-function
```

Update your handler to work with API Gateway:

```go
package main

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func Handler(ctx context.Context, request events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
	name := request.QueryStringParameters["name"]
	if name == "" {
		name = "World"
	}

	body, _ := json.Marshal(map[string]string{
		"message": fmt.Sprintf("Hello, %s!", name),
	})

	return events.APIGatewayV2HTTPResponse{
		StatusCode: 200,
		Headers:    map[string]string{"Content-Type": "application/json"},
		Body:       string(body),
	}, nil
}

func main() {
	lambda.Start(Handler)
}
```

---

## 7. Using AWS SAM (Recommended for Production)

AWS SAM simplifies Lambda deployment. Create `template.yaml`:

```yaml
AWSTemplateFormatVersion: '2010-09-09'
Transform: AWS::Serverless-2016-10-31

Globals:
  Function:
    Timeout: 10
    MemorySize: 128

Resources:
  MyGoFunction:
    Type: AWS::Serverless::Function
    Properties:
      FunctionName: my-go-function
      CodeUri: .
      Handler: bootstrap
      Runtime: provided.al2023
      Architectures:
        - arm64
      Events:
        Api:
          Type: HttpApi
          Properties:
            Path: /hello
            Method: GET
    Metadata:
      BuildMethod: go1.x

Outputs:
  ApiEndpoint:
    Description: "API Gateway endpoint URL"
    Value: !Sub "https://${ServerlessHttpApi}.execute-api.${AWS::Region}.amazonaws.com/hello"
```

Deploy with SAM:

```bash
sam build
sam deploy --guided
```

---

## 8. Makefile for Easy Builds

Create a `Makefile`:

```makefile
.PHONY: build deploy clean

build:
	GOOS=linux GOARCH=arm64 go build -tags lambda.norpc -o bootstrap main.go
	zip function.zip bootstrap

deploy: build
	aws lambda update-function-code \
		--function-name my-go-function \
		--zip-file fileb://function.zip

clean:
	rm -f bootstrap function.zip
```

Now just run:

```bash
make deploy
```

---

## 9. Best Practices

### Reduce Cold Starts

- Use **ARM64** architecture (faster + cheaper)
- Keep dependencies minimal
- Initialize SDK clients outside the handler:

```go
var dynamoClient *dynamodb.Client

func init() {
	cfg, _ := config.LoadDefaultConfig(context.Background())
	dynamoClient = dynamodb.NewFromConfig(cfg)
}

func Handler(ctx context.Context, req Request) (Response, error) {
	// dynamoClient is already initialized
}
```

### Error Handling

Return errors properly — Lambda will log them to CloudWatch:

```go
func Handler(ctx context.Context, req Request) (Response, error) {
	if req.ID == "" {
		return Response{}, fmt.Errorf("missing required field: id")
	}
	// ...
}
```

### Environment Variables

```go
import "os"

func Handler(ctx context.Context, req Request) (Response, error) {
	tableName := os.Getenv("DYNAMODB_TABLE")
	// ...
}
```

Set them in Lambda configuration or SAM template.

### Structured Logging

Use structured logging for better CloudWatch insights:

```go
import "log/slog"

func Handler(ctx context.Context, req Request) (Response, error) {
	slog.Info("processing request", "name", req.Name, "requestId", ctx.Value("requestId"))
	// ...
}
```

---

## 10. Monitoring & Debugging

- **CloudWatch Logs**: All `fmt.Print` and `log` output goes here
- **X-Ray**: Add tracing with `aws-xray-sdk-go`
- **Lambda Insights**: Enable for CPU/memory metrics

View logs:

```bash
aws logs tail /aws/lambda/my-go-function --follow
```

---

## Conclusion

Go is an excellent choice for AWS Lambda — fast, efficient, and easy to deploy. The combination of tiny binaries, quick cold starts, and strong typing makes it ideal for serverless workloads.

**Quick recap:**
1. Write your handler with `aws-lambda-go`
2. Build for Linux with `GOOS=linux GOARCH=arm64`
3. Name the binary `bootstrap`
4. Zip and deploy

Happy shipping! 🚀
