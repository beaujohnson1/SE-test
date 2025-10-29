# Freepik AI API Documentation - Photo Restoration & Upscaling

This document covers both the Gemini 2.5 Flash (photo restoration) and Magnific Upscaler Precision V2 APIs.

**Base URL:** `https://api.freepik.com`
**Authentication:** All endpoints require `x-freepik-api-key` header

---

# Google Gemini 2.5 Flash (Nano Banana) – Image Generation API

## Overview

Google Gemini 2.5 Flash – Image Preview (also known as "Nano Banana") focuses on creative precision and reliability. Generate accurate, production-ready images in a single attempt with Gemini 2.5 Flash, while preserving subject identity and visual coherence. Combine your prompt with up to 3 image references to achieve consistent product placement, character continuity, and style alignment. Use webhooks to retrieve results asynchronously in production pipelines.

## Key Capabilities

- Single-attempt accurate, production-ready images for complex transformations
- Consistent products, characters, and styles across images
- Multi-reference prompting (up to 3 image references)
- Async-friendly: task IDs and webhooks for reliable retrieval
- Cost-effective for large-scale variant testing

## Use Cases

- Product placement and product + character compositions
- Character continuity across scenes and expression changes
- Style alignment and brand consistency for campaigns
- Ads with text and social creatives at scale
- Multi-reference generation and multi-shot scenes

---

## API Endpoints

### 1. Create a Gemini 2.5 Flash Generation Task

**Endpoint:** `POST /v1/ai/gemini-2-5-flash-image-preview`

**Headers:**
```
x-freepik-api-key: <your-api-key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "A beautiful sunset over mountains with vibrant orange and purple skies",
  "reference_images": [
    "iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...",
    "https://example.com/reference-image.jpg"
  ],
  "webhook_url": "https://www.example.com/webhook"
}
```

**Parameters:**
- `prompt` (string, required): The prompt describing the image you want to generate or edit
- `reference_images` (string[], optional): Array of reference images (max 3) as Base64 encoded strings or publicly accessible URLs
- `webhook_url` (string, optional): Callback URL for asynchronous status notifications

**Response (200 OK):**
```json
{
  "data": {
    "generated": [],
    "task_id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
    "status": "CREATED"
  }
}
```

**cURL Example:**
```bash
curl --request POST \
  --url https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview \
  --header 'Content-Type: application/json' \
  --header 'x-freepik-api-key: <api-key>' \
  --data '{
  "prompt": "A beautiful sunset over mountains with vibrant orange and purple skies",
  "reference_images": [
    "iVBORw0KGgoAAAANSUhEUgAAASwAAAEsAQAAAABRBrPYAAABrElEQVR4nO3BMQEAAADCoPVPbQ0Po...",
    "https://example.com/reference-image.jpg"
  ],
  "webhook_url": "https://www.example.com/webhook"
}'
```

---

### 2. Get the Status of One Task

**Endpoint:** `GET /v1/ai/gemini-2-5-flash-image-preview/{task-id}`

**Headers:**
```
x-freepik-api-key: <your-api-key>
```

**Path Parameters:**
- `task-id` (string, required): ID of the task

**Response (200 OK):**
```json
{
  "data": {
    "generated": [
      "https://openapi-generator.tech",
      "https://openapi-generator.tech"
    ],
    "task_id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
    "status": "CREATED"
  }
}
```

**cURL Example:**
```bash
curl --request GET \
  --url https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview/{task-id} \
  --header 'x-freepik-api-key: <api-key>'
```

---

### 3. Get the Status of All Tasks

**Endpoint:** `GET /v1/ai/gemini-2-5-flash-image-preview`

**Headers:**
```
x-freepik-api-key: <your-api-key>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "task_id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
      "status": "CREATED"
    },
    {
      "task_id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
      "status": "CREATED"
    }
  ]
}
```

**cURL Example:**
```bash
curl --request GET \
  --url https://api.freepik.com/v1/ai/gemini-2-5-flash-image-preview \
  --header 'x-freepik-api-key: <api-key>'
```

---

## Photo Restoration Prompt

For our photo restoration use case, we're using the following prompt:

```
Ultra-realistic recreation of an old vintage photo, keeping the same original face (99% likeness, no alteration). Transform into a modern high-quality digital portrait with vibrant updated colors, smooth realistic skin textures, and natural lighting. The outfit and background should be upgraded into a clean, modern aesthetic while preserving the authenticity of the original pose and expression.
```

This prompt will be sent along with the original damaged photo as a reference image to restore old photos while maintaining the subject's identity.

---

## Implementation Notes

- The API uses task-based async processing
- After creating a task, you'll receive a `task_id`
- Poll the task status endpoint or use webhooks to get the result
- Maximum 3 reference images per request
- Reference images can be Base64 encoded or publicly accessible URLs
- The `generated` array in the response will contain URLs to the generated images once the task is complete

---
---

# Magnific Upscaler Precision V2 API

## Overview

Upscale images with precision using Magnific V2. This endpoint upscales images while intelligently adding new visual elements and details based on the prompt and inferred context. The AI-powered upscaling technology increases resolution while maintaining and enhancing image quality.

## Key Capabilities

- AI-powered upscaling with intelligent detail enhancement
- Scale factors from 2x to 16x
- Multiple processing flavors optimized for different image types
- Customizable sharpness, grain, and detail levels
- Async task-based processing with webhooks

## Use Cases

- High-resolution photo restoration output
- Product photography enhancement
- Print-ready image preparation
- Detail recovery in low-resolution images

---

## API Endpoints

### 1. Create an Upscaling Task

**Endpoint:** `POST /v1/ai/image-upscaler-precision-v2`

**Headers:**
```
x-freepik-api-key: <your-api-key>
Content-Type: application/json
```

**Request Body:**
```json
{
  "image": "https://example.com/restored-photo.jpg",
  "webhook_url": "https://www.example.com/webhook",
  "sharpen": 7,
  "smart_grain": 7,
  "ultra_detail": 30,
  "flavor": "photo",
  "scale_factor": 4
}
```

**Parameters:**
- `image` (string, required): Source image to upscale. Accepts either:
  - A publicly accessible HTTPS URL
  - A base64-encoded image string
- `webhook_url` (string, optional): Callback URL for asynchronous notifications
- `sharpen` (integer, default: 7): Image sharpness intensity (0-100)
  - Higher values increase edge definition and clarity
- `smart_grain` (integer, default: 7): Intelligent grain/texture enhancement (0-100)
  - Preserves natural film grain and texture detail
  - Prevents overly smooth or artificial appearance
- `ultra_detail` (integer, default: 30): Fine detail enhancement level (0-100)
  - Controls textures, patterns, and micro-details
- `flavor` (enum, optional): Image processing optimization style
  - `sublime`: Optimized for artistic and illustrated images
  - `photo`: Optimized for photographic images (RECOMMENDED FOR OUR USE CASE)
  - `photo_denoiser`: Specialized for noisy photos with noise reduction
- `scale_factor` (integer, required): Scaling multiplier (2-16)
  - Example: 2 doubles dimensions (2x width, 2x height = 4x total pixels)
  - Recommended: 4 for most use cases

**Response (200 OK):**
```json
{
  "data": {
    "generated": [],
    "task_id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
    "status": "CREATED"
  }
}
```

**cURL Example:**
```bash
curl --request POST \
  --url https://api.freepik.com/v1/ai/image-upscaler-precision-v2 \
  --header 'Content-Type: application/json' \
  --header 'x-freepik-api-key: <api-key>' \
  --data '{
  "image": "https://example.com/restored-photo.jpg",
  "webhook_url": "https://www.example.com/webhook",
  "sharpen": 7,
  "smart_grain": 7,
  "ultra_detail": 30,
  "flavor": "photo",
  "scale_factor": 4
}'
```

---

### 2. Get the Status of One Upscaling Task

**Endpoint:** `GET /v1/ai/image-upscaler-precision-v2/{task-id}`

**Headers:**
```
x-freepik-api-key: <your-api-key>
```

**Path Parameters:**
- `task-id` (string, required): UUID of the task

**Response (200 OK):**
```json
{
  "data": {
    "generated": [
      "https://cdn.freepik.com/upscaled-image-url.jpg"
    ],
    "task_id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
    "status": "COMPLETED"
  }
}
```

**cURL Example:**
```bash
curl --request GET \
  --url https://api.freepik.com/v1/ai/image-upscaler-precision-v2/{task-id} \
  --header 'x-freepik-api-key: <api-key>'
```

---

### 3. Get the Status of All Upscaling Tasks

**Endpoint:** `GET /v1/ai/image-upscaler-precision-v2`

**Headers:**
```
x-freepik-api-key: <your-api-key>
```

**Response (200 OK):**
```json
{
  "data": [
    {
      "task_id": "046b6c7f-0b8a-43b9-b35d-6489e6daee91",
      "status": "COMPLETED"
    },
    {
      "task_id": "123e4567-e89b-12d3-a456-426614174000",
      "status": "PROCESSING"
    }
  ]
}
```

**cURL Example:**
```bash
curl --request GET \
  --url https://api.freepik.com/v1/ai/image-upscaler-precision-v2 \
  --header 'x-freepik-api-key: <api-key>'
```

---

## Recommended Settings for Photo Restoration

For upscaling restored vintage photos, use these optimized settings:

```json
{
  "sharpen": 10,
  "smart_grain": 5,
  "ultra_detail": 40,
  "flavor": "photo",
  "scale_factor": 4
}
```

**Rationale:**
- **Sharpen (10):** Slightly higher than default to enhance facial features and text
- **Smart Grain (5):** Lower to avoid adding artificial texture to already-restored photos
- **Ultra Detail (40):** Higher to recover fine details like fabric textures, hair strands
- **Flavor (photo):** Optimized for photographic content with realistic colors
- **Scale Factor (4):** 4x provides excellent quality without excessive processing time

---

## Implementation Notes

- Task-based async processing (same pattern as Gemini API)
- Poll the status endpoint every 2-5 seconds until `status` is `COMPLETED` or `FAILED`
- The `generated` array contains download URLs for upscaled images
- Upscaling typically takes 10-30 seconds depending on scale factor
- Images remain accessible for 24 hours after generation
- For production, recommend saving upscaled images to your own storage (R2)

---

## Complete Workflow: Restoration + Upscaling

1. **Restore Photo** (Gemini 2.5 Flash)
   - Upload original damaged photo
   - Submit to Gemini API with restoration prompt
   - Poll until restoration complete
   - Save restored image URL

2. **Upscale Photo** (Magnific Precision V2)
   - Take restored image URL from step 1
   - Submit to Magnific API with optimized settings
   - Poll until upscaling complete
   - Save upscaled image to R2 storage
   - Provide download link to user

3. **Export**
   - User clicks "Export"
   - Automatically triggers upscaling if not done
   - Downloads high-resolution upscaled version
