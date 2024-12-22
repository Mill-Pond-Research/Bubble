

# Claude API Integration Guide

## Prerequisites
- An Anthropic Console account (sign up at console.anthropic.com)
- An API key (obtain from https://console.anthropic.com/settings/keys)
- Python 3.7+ or TypeScript 4.5+

## Development Environment Setup

### 1. SDK Installation

#### Python Setup
```bash
# Create a virtual environment
python -m venv claude-env

# Activate the virtual environment
# For macOS/Linux:
source claude-env/bin/activate
# For Windows:
claude-env\Scripts\activate

# Install the Anthropic SDK
pip install anthropic
```

#### TypeScript Setup
The Anthropic SDK supports TypeScript 4.5+

### 2. API Key Configuration

Set your API key as an environment variable:

For macOS/Linux:
```bash
export ANTHROPIC_API_KEY='your-api-key-here'
```

For Windows:
```bash
set ANTHROPIC_API_KEY=your-api-key-here
```

## Development Workflow

### 1. Start with the Workbench
Before implementing API calls in your code:
1. Log into the Anthropic Console
2. Use the Workbench to test and refine your prompts
3. Use the "Get Code" feature to generate implementation code

### 2. API Implementation

#### Basic API Call Structure

Python Example:
```python
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=1000,
    temperature=0,
    system="Your system prompt here",
    messages=[
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "Your message here"
                }
            ]
        }
    ]
)
print(message.content)
```

cURL Example:
```bash
curl https://api.anthropic.com/v1/messages \
     --header "x-api-key: $ANTHROPIC_API_KEY" \
     --header "anthropic-version: 2023-06-01" \
     --header "content-type: application/json" \
     --data '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [
        {"role": "user", "content": "Hello, world"}
    ]
}'
```

### 3. API Requirements

#### Authentication
- All requests must include an `x-api-key` header with your API key
- SDKs handle this automatically when initialized with your API key

#### Content Types
- All requests and responses use JSON
- Required header: `content-type: application/json`
- SDKs handle content type headers automatically

## Best Practices

1. **Use the Workbench First**: Develop and test your prompts in the Workbench before implementing them in code
2. **System Prompts**: Use system prompts to control response format, tone, and personality
3. **Environment Variables**: Store API keys as environment variables rather than hardcoding them
4. **Workspace Organization**: Use workspaces to segment API keys and control spend by use case