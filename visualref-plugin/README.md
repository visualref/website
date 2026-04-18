# VisualRef WordPress Integration Plugin

Connect your WordPress site to VisualRef and automatically publish articles.

## Installation

1. Upload the `visualref-integration` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Go to **Settings → VisualRef Integration**
4. Click **"Generate Integration Key"**
5. Copy the key and paste it in the VisualRef dashboard

## Features

- **Secure Integration Key** - HMAC-signed key for secure authentication
- **Automatic Publishing** - Articles from VisualRef are published automatically
- **Category Selection** - Choose default category for new posts
- **Tag Support** - Select default tags for new posts
- **Author Assignment** - Set default author for published articles
- **Draft/Publish** - Choose default publish status
- **Featured Images** - Automatically download and attach featured images
- **Connection Test** - Verify your integration is working

## REST API Endpoints

All endpoints require the `X-VR-Key` header with a valid integration key.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wp-json/vr/v1/verify` | Verify connection |
| POST | `/wp-json/vr/v1/publish` | Publish new article |
| POST | `/wp-json/vr/v1/update` | Update existing article |
| GET | `/wp-json/vr/v1/categories` | Get categories |
| GET | `/wp-json/vr/v1/tags` | Get tags |
| GET | `/wp-json/vr/v1/authors` | Get authors |

## Publish Article Payload

```json
{
  "title": "Article Title",
  "content": "<p>Article HTML content</p>",
  "excerpt": "Article excerpt",
  "featured_image": "https://example.com/image.jpg",
  "slug": "article-slug",
  "category": 1,
  "tags": [1, 2, 3],
  "author_id": 1,
  "status": "publish"
}
```

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher