# AWS Bedrock Setup for Ragas Tests

## Overview
The Ragas test suite has been updated to use AWS Bedrock with Claude models instead of direct Anthropic API access.

## Changes Made

### 1. Updated `conftest.py`
- **Added**: `aws_credentials` fixture that uses standard AWS credentials:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION` (optional, defaults to `us-east-1`)

### 2. Updated LLM Configuration
- **Before**: Used `ChatAnthropic` from `langchain-anthropic`
- **After**: Uses `ChatBedrockConverse` from `langchain-aws`
- **Model ID**: `anthropic.claude-sonnet-4-20250514-v1:0`

### 3. Updated Embeddings Configuration
- No changes needed - still uses HuggingFace (local, no AWS credentials required)

## Environment Setup

### Required Environment Variables
```bash
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_REGION="us-east-1"  # Optional, defaults to us-east-1
```

### Adding to `.env` file
```bash
# Add to ai-service/.env
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
```

## AWS Bedrock Prerequisites

### 1. Enable Claude Models in AWS Bedrock
1. Log into AWS Console
2. Navigate to Amazon Bedrock
3. Go to "Model access" in the left sidebar
4. Request access to Anthropic Claude models if not already enabled
5. Ensure Claude Sonnet 4 is enabled in your region

### 2. IAM Permissions
Your AWS user/role needs the following permissions:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "arn:aws:bedrock:*::foundation-model/anthropic.claude-*"
    }
  ]
}
```

## Running Tests

### Run all Ragas tests
```bash
cd ai-service
ENV=test AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=xxx pytest tests/ragas/
```

### Run specific semantic tests
```bash
cd ai-service
ENV=test AWS_ACCESS_KEY_ID=xxx AWS_SECRET_ACCESS_KEY=xxx \
  pytest tests/ragas/test_rag_semantic.py -v
```

### Run with Docker (recommended)
```bash
cd ai-service
make test  # Ensure docker-compose.test.yml has AWS env vars
```

## Supported AWS Regions

AWS Bedrock Claude models are available in:
- `us-east-1` (N. Virginia)
- `us-west-2` (Oregon)
- `ap-southeast-1` (Singapore)
- `ap-northeast-1` (Tokyo)
- `eu-central-1` (Frankfurt)
- `eu-west-2` (London)

Check [AWS Bedrock documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html) for the latest region availability.

## Model IDs Reference

If you need to use different Claude models:
- Claude 3.5 Sonnet (v2): `anthropic.claude-3-5-sonnet-20241022-v2:0`
- Claude 3 Opus: `anthropic.claude-3-opus-20240229-v1:0`
- Claude 3 Sonnet: `anthropic.claude-3-sonnet-20240229-v1:0`
- Claude 3 Haiku: `anthropic.claude-3-haiku-20240307-v1:0`

Update the model ID in `conftest.py`:
```python
llm = ChatBedrockConverse(
    model="anthropic.claude-sonnet-4-20250514-v1:0",  # Change this
    temperature=0,
    max_tokens=4096,
    region_name=region,
    aws_access_key_id=access_key_id,
    aws_secret_access_key=secret_access_key,
)
```

## Troubleshooting

### Error: "Could not load credentials"
- Ensure `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` are set
- Check credentials are valid and not expired

### Error: "Model access denied" or "AccessDeniedException"
- Enable Claude models in AWS Bedrock console
- Check IAM permissions include `bedrock:InvokeModel`
- Verify the model is available in your selected region

### Error: "Model not found"
- Verify the model ID is correct for your region
- Check the model is enabled in AWS Bedrock

### Tests are skipped
- If AWS credentials are not set, tests will be automatically skipped with:
  ```
  SKIPPED [1] tests/ragas/conftest.py:40: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY not set, skipping semantic Ragas tests
  ```

## Cost Considerations

AWS Bedrock charges per token. Claude Sonnet 4 pricing (as of Nov 2024):
- Input: ~$3 per million tokens
- Output: ~$15 per million tokens

Monitor costs in AWS Cost Explorer under "Amazon Bedrock" service.

## Migration Notes

### From Direct Anthropic API
If migrating from direct Anthropic API:
1. Replace `ANTHROPIC_API_KEY` with AWS credentials
2. Update any scripts/CI that set the old env var
3. Ensure AWS Bedrock model access is enabled
4. Update documentation and README files

### Backward Compatibility
The test interface remains the same:
- Same pytest fixtures (`ragas_llm`, `ragas_embeddings`)
- Same test functions
- No changes needed in test implementations
