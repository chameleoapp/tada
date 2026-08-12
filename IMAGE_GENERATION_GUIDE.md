# Image Generation Guide

This document explains how to generate clothing images for the Tada app using AI image generators.

## Recommended Tools

1. **Midjourney** (best quality) - https://midjourney.com
2. **DALL-E 3** (via ChatGPT Plus) - https://chat.openai.com
3. **Stable Diffusion** (free, self-hosted) - https://stability.ai
4. **Leonardo.AI** (good for product photos) - https://leonardo.ai

## Quick Start

For each clothing item, use the base prompt from `IMAGE_STYLE.md` plus the specific item description:

### Example: Winter Jacket

**Full Prompt:**
```
Professional product photography of a single high-quality children's outdoor clothing item, children's waterproof winter jacket, bright blue technical shell fabric, realistic hood with drawstrings, front zipper, side pockets, reflective details, Nordic design aesthetic, functional sportswear style, clean modern look, realistic technical fabric texture, professional studio lighting, pure white background, item laid flat, sharp commercial photography, centered composition, soft natural shadows, no person, no mannequin, no hanger, no brand logos, no text, no labels
```

**Negative Prompt:**
```
child wearing clothes, model, person, mannequin, hanger, store display, brand logo, text, watermark, labels, tags visible, busy background, multiple clothing items, dark gloomy colors, harsh shadows, wrinkled messy fabric, clutter, emoji, sticker, toy-like, flat illustration, cartoon style, thick outline, low quality, blurry
```

### Example: Winter Overall (Snowsuit)

**Full Prompt:**
```
Professional product photography of children's one-piece snowsuit, Nordic outdoor style, bright teal technical shell fabric, realistic padding texture, functional zippers, reflective strips, elastic cuffs, laid flat on white background, commercial product photography, centered composition, high quality, sharp focus, soft natural shadows, no person, no mannequin, no brand logos
```

## Color Palette (Reima-Inspired)

Use these vibrant, practical colors:
- **Primary:** Bright teal (#00B4D8), Ocean blue (#0077B6), Coral orange (#FF6B35)
- **Accent:** Sunshine yellow (#FFD700), Berry red (#DC143C), Forest green (#228B22)
- **Base layers:** Soft purple, pink, light blue
- **Rain gear:** Bright yellow, teal, lime green

## Settings for Different Tools

### Midjourney
```
/imagine [your prompt] --ar 1:1 --style raw --v 6
```

### DALL-E 3
- Just paste the prompt directly
- Request 1024x1024 square format
- Ask for "product photography style"

### Stable Diffusion
- Model: Realistic Vision or DreamShaper
- Steps: 30-50
- CFG Scale: 7-10
- Sampler: DPM++ 2M Karras

## Checklist Before Using

✅ Item is centered and clearly visible  
✅ Background is pure white  
✅ No visible brand logos or text  
✅ Realistic fabric texture  
✅ Appropriate for toddlers (bright, friendly colors)  
✅ File saved as PNG with transparency or white background  
✅ Named correctly (e.g., `winter-jacket.png`)  

## Batch Generation Tips

To maintain consistency across all 35+ items:
1. Generate 3-4 items at a time
2. Keep the same base prompt and camera angle
3. Only change the specific item description and color
4. Review all items together to ensure style consistency
5. Regenerate any items that don't match the style

## File Naming

Save files with exact names from `public/clothes/README.md`:
- `winter-jacket.png`
- `winter-overall.png`
- `fleece-layer.png`
- `rain-jacket.png` (note: called "raincoat" in code)
- `thermal-top.png`
- `thermal-bottoms.png`
- `winter-boots.png`
- `mittens.png`
- `winter-hat.png`
- `balaclava.png`
- etc.

## Legal Note

These prompts generate **original AI images** inspired by Nordic outdoor wear aesthetics. They do not copy or reproduce any specific brand's copyrighted product photos. The resulting images are original creations suitable for commercial use (check your AI tool's license).
