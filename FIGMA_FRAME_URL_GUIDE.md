# 🎨 How to Get Frame URLs in Figma

## Overview

There are **3 ways** to get frame/design image URLs for the analysis system:

---

## Method 1: Direct Figma Frame URL (Shareable Link) ⭐ EASIEST

### Steps:

1. **Open your Figma project** in your browser
2. **Select a frame** in your design
3. **Right-click the frame** in the left panel
4. **Select "Copy link"** or use the menu at the top
5. **Your frame URL looks like:**
   ```
   https://www.figma.com/file/YOUR_FILE_ID/ProjectName?node-id=FRAME_ID
   ```

### Example:
```
https://www.figma.com/file/abc123xyz789/MyDesignProject?node-id=123:456
```

### Where to use it:
- ❌ **NOT for image URL** - This is a link to Figma editor
- ✅ **Use for Figma API** - Our backend can extract this info

---

## Method 2: Export Frame as PNG Image (Recommended) ⭐ BEST FOR ANALYSIS

### Steps to Export:

1. **Select the frame** you want to analyze
2. **Right-click and select "Copy as"** → **"Copy as PNG"** or use **Cmd/Ctrl + Shift + C**
3. **Open an image hosting site:**
   - **Imgur** (free, no account needed): https://imgur.com
   - **imgbb** (free, no account): https://imgbb.com
   - **Cloudinary** (free tier): https://cloudinary.com
   - **Or any image hosting service**

4. **Paste the image** and upload
5. **Copy the image URL** (should end in .png or .jpg)

### Example Image URL:
```
https://i.imgur.com/xyz123abc.png
https://i.ibb.co/xyz123abc/screenshot.png
```

### Use this in the app:
✅ Paste directly in **"Design Image URL"** field
✅ This is the image URL the app needs for analysis

---

## Method 3: Figma Export Feature (Alternative Export)

### Steps:

1. **Select the frame(s)** you want to export
2. **Go to:** Design panel (right side) → **Export** section
3. **Add export setting:**
   - Click **"+"** in Export section
   - Choose **PNG** format
   - Set scale to **1x** or **2x**
4. **Click "Export [Frame Name]"**
5. **File downloads to your computer**
6. **Upload the PNG to image hosting** (Imgur, imgbb, etc.)
7. **Copy the image URL**

---

## Method 4: Using Frame Node ID (Advanced - For API)

### Get the Node ID:

1. **Open Figma file** in browser
2. **Click on a frame**
3. **Look at the URL bar:**
   ```
   https://www.figma.com/file/abc123xyz/ProjectName?node-id=123:456
   ```
   - `abc123xyz` = **File ID**
   - `123:456` = **Node ID**

### In our system:

You can send the **File ID** and **Node ID** to the backend:

```json
{
  "file_id": "abc123xyz789",
  "node_id": "123:456"
}
```

The backend will:
1. ✅ Download the frame as PNG from Figma
2. ✅ Analyze it
3. ✅ Return results

---

## Quick Reference Table

| Method | Input | Use Case | Difficulty |
|--------|-------|----------|------------|
| **1. Figma Share Link** | `figma.com/file/...?node-id=...` | Get from Figma editor | Easy |
| **2. Export PNG → Upload** | Image URL (imgur, imgbb) | **RECOMMENDED** | Easy |
| **3. Direct Export** | Save PNG locally first | Quick exports | Medium |
| **4. Node ID** | File ID + Node ID | Advanced/API use | Hard |

---

## Step-by-Step Example

### Example: Export a Hero Section Frame

**1. In Figma:**
```
Select "Hero Section" frame
  ↓
Right-click frame
  ↓
Select "Copy as" → "Copy as PNG"
  ↓
Image copied to clipboard
```

**2. Upload to Imgur:**
```
Go to https://imgur.com
  ↓
Paste image (Ctrl+V)
  ↓
Click "Upload from computer" if needed
  ↓
Image uploads
  ↓
Right-click image → "Copy image URL"
  ↓
Get URL like: https://i.imgur.com/abc123xyz.png
```

**3. In ARAI App:**
```
Paste URL: https://i.imgur.com/abc123xyz.png
  ↓
Enter frame name: "Hero Section"
  ↓
Click "Analyze Design Image"
  ↓
Get results!
```

---

## Figma Frame URL Components

```
https://www.figma.com/file/abc123xyz789/MyProject?node-id=123:456&t=abcdef

│                                  │
├─ Protocol: https://
├─ Domain: figma.com
├─ Path: /file/{FILE_ID}/{PROJECT_NAME}
├─ Query: node-id={FRAME_ID}:{COMPONENT_ID}
└─ Optional: &t={timestamp}

Components:
  FILE_ID      = Document/project ID in Figma
  FRAME_ID     = Frame number
  COMPONENT_ID = Component variant number
  PROJECT_NAME = Name of the project
```

---

## Getting Figma File ID & Token (Advanced)

### File ID:
1. **Open Figma file** in browser
2. **Copy from URL:** `figma.com/file/{FILE_ID}/ProjectName`
3. Example: `abc123xyz789`

### Figma API Token:
1. **Go to:** https://www.figma.com/api/tokens
2. **Create a new token**
3. **Copy the token** (keep it secret!)
4. **Use in backend API calls**

---

## Common Issues & Solutions

### ❌ "Image failed to load"
- ✅ Check URL is complete (has http:// or https://)
- ✅ Check image hosting site is accessible
- ✅ Try downloading URL in browser first

### ❌ "No frames found in Figma"
- ✅ Make sure frames are **actual Frames**, not just grouped shapes
- ✅ In Figma, create a **Frame** (not just group items)
- ✅ Select Frame tool from toolbar, draw a frame around items

### ❌ "Figma API token invalid"
- ✅ Generate new token at https://www.figma.com/api/tokens
- ✅ Token might have expired
- ✅ Make sure it's the full token string (no spaces)

### ❌ "Rate limit exceeded"
- ✅ Wait a few minutes before trying again
- ✅ Don't make too many Figma API calls at once
- ✅ Try the image URL method instead (no rate limits)

---

## Best Practice

### For Quick Testing:
1. ✅ **Use Method 2** (Export PNG → Imgur)
   - Fastest
   - No rate limits
   - Works with any design tool

### For Production:
1. ✅ **Use Method 2** (Image hosting)
   - Most reliable
   - No API keys needed
   - Works everywhere

### For Advanced Users:
1. ✅ **Use Method 4** (Node ID + API)
   - Direct integration with Figma
   - Automated workflows
   - Requires API token

---

## Image Hosting Services (Free Options)

| Service | Free? | No Account? | Speed | Notes |
|---------|-------|------------|-------|-------|
| **Imgur** | ✅ | ✅ | Fast | Most popular |
| **imgbb** | ✅ | ✅ | Fast | Permanent links |
| **Cloudinary** | ✅ | ❌ | Fast | Free tier limited |
| **FireBase Storage** | ❌ | ❌ | Fast | Small free tier |
| **Netlify Drop** | ✅ | ✅ | Medium | Temporary |

**Recommended:** Imgur or imgbb (no account needed, permanent links)

---

## Testing URLs

You can test the app with these sample design images:

```
https://via.placeholder.com/1200x800/FF6B6B/FFFFFF?text=Design+Frame
https://i.imgur.com/example.png
```

Or upload your own!

---

## Summary

| Question | Answer |
|----------|--------|
| **How to get design image URL?** | Export PNG → Upload to imgur/imgbb → Copy image URL |
| **What format?** | PNG, JPG, WebP |
| **Where to paste it?** | ARAI App → "Design Image URL" field |
| **Do I need Figma?** | No! Use any design tool |
| **Do I need API key?** | No! (Unless using advanced Figma API method) |
| **How many designs?** | Unlimited! Add multiple |

---

**✅ Ready to analyze designs!** 🎨
