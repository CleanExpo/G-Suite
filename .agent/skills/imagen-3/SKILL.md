---
name: Imagen 3
description: Google's advanced image generation for high-quality visual content
---

# Imagen 3 Skill

Generate, edit, and upscale images using Google's Imagen 3 API.

## Functions

### `imagen3Generate`
Create images from text prompts.

| Parameter | Type | Description |
|-----------|------|-------------|
| `prompt` | string | Image description |
| `width` | 512-2048 | Image width |
| `height` | 512-2048 | Image height |
| `aspectRatio` | string | 1:1, 16:9, 9:16, 4:3, 3:4 |
| `style` | string | photographic, digital-art, anime, etc. |
| `numberOfImages` | 1-4 | Images to generate |

### `imagen3Edit`
Edit existing images (inpaint, outpaint, remove, replace).

### `imagen3Upscale`
Upscale images 2x or 4x resolution.

### `imagen3Consistent`
Generate multiple consistent images of the same subject.

## Usage

```typescript
const result = await imagen3Generate('user_id', 'A sunset over mountains', {
  aspectRatio: '16:9',
  style: 'photographic'
});
```

## Billing

| Operation | Cost |
|-----------|------|
| Generate | ~$0.02/image |
| Edit | ~$0.03/image |
| Upscale | ~$0.01-0.04/image |
