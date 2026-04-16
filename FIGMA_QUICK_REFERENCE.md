# Figma Integration - Quick Reference Card

## 🚀 One-Minute Setup

```bash
# 1. Get token from https://www.figma.com/developers/api#auth
# 2. Set it
export FIGMA_API_TOKEN=ffile_your_token_here

# 3. Test it works
curl -H "X-Figma-Token: ffile_..." https://api.figma.com/v1/me

# 4. Done! ✅
```

---

## 📊 What Your System Does

```
Input:  https://www.figma.com/file/ABC123/MyDesign
  ↓
Extract FILE_KEY: ABC123
  ↓
Fetch file structure via Figma API
  ↓
Find all frames/screens
  ↓
Download preview images
  ↓
Run 3 analyses on each frame:
  • Accessibility (WCAG compliance)
  • Readability (text clarity)
  • Attention (visual hierarchy)
  ↓
Output: { "files": [ { arai_score, accessibility_score, ... } ] }
```

---

## 🔧 Key Files

| File | Purpose | Location |
|------|---------|----------|
| **figma_client.py** | API interaction, token handling | `backend/app/core/` |
| **figma_service.py** | Analysis logic | `backend/app/services/` |
| **analysis.py** | HTTP endpoints | `backend/app/api/` |
| **FigmaAnalyzer.jsx** | UI form & results | `frontend/src/components/` |

---

## ⚙️ Configuration

### Required Environment Variable
```bash
FIGMA_API_TOKEN=ffile_abc123xyz...
```

### Set In:
- **Local**: `backend/.env`
- **Render**: Environment variables in dashboard
- **Docker**: Pass as env variable

---

## 🧪 Testing

### Quick Test
```bash
python test_figma_integration.py
```

### Manual Tests
```bash
# Test 1: Token works
curl -H "X-Figma-Token: ffile_..." \
  https://api.figma.com/v1/me

# Test 2: File access
curl -H "X-Figma-Token: ffile_..." \
  https://api.figma.com/v1/files/ABC123XYZ

# Test 3: Analysis endpoint
curl -X POST http://localhost:8000/api/v1/analysis/figma-screens \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{"figma_url": "https://www.figma.com/file/ABC123/..."}'
```

---

## ❌ Common Errors & Fixes

| Error | Fix |
|-------|-----|
| **401 Unauthorized** | Set `FIGMA_API_TOKEN` in environment |
| **Invalid Figma URL** | Use `https://www.figma.com/file/ABC123/Name` |
| **No frames found** | Create a Frame/Board in Figma file |
| **403 Access Denied** | Make Figma file public or share it |
| **Timeout** | Try again, large files take time |
| **Rate limited (429)** | Wait 2 minutes, system auto-retries |

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| Time to analyze | 15-60 seconds |
| Frames per request | Up to 200 |
| Image batch size | Max 200 |
| Rate limit | ~30 req/min |
| Timeout | 90 seconds |
| Cache TTL | 1 hour (optional) |

---

## 📂 Request/Response Format

### Request
```json
POST /api/v1/analysis/figma-screens

{
  "figma_url": "https://www.figma.com/file/ABC123/ProjectName",
  "figma_token": null
}
```

### Response
```json
{
  "files": [
    {
      "file_name": "screen_1",
      "file_id": "uuid",
      "arai_score": 75.5,
      "accessibility_score": 85,
      "readability_score": 70,
      "attention_score": 72,
      "grade": "B",
      "accessibility": {
        "score": 85,
        "issues": [ ... ]
      },
      "readability": {
        "score": 70,
        "issues": [ ... ]
      },
      "attention": {
        "score": 72,
        "issues": [ ... ]
      }
    },
    { ...frame2... }
  ]
}
```

---

## 🎯 Success Criteria

- [x] Token configured
- [x] URL parsing works
- [x] File fetching works
- [x] Image rendering works
- [x] Analysis completes
- [x] Results saved to DB
- [x] Frontend displays results
- [x] Error messages helpful

---

## 📚 Full Documentation

- **Setup**: `FIGMA_QUICK_START.md`
- **Deep Dive**: `FIGMA_INTEGRATION_FIX.md`
- **Troubleshooting**: `FIGMA_TROUBLESHOOTING.md`
- **Tests**: `test_figma_integration.py`

---

## 🚨 Monitoring

### Watch these logs
```bash
tail -f backend.log | grep -i figma
```

### Key metrics
- Success rate (% analysis completion)
- Average duration (should be 15-60s)
- Error rate (should be <5%)
- API response times

---

## ✨ What's Improved

1. ✅ Better error messages (actionable, not generic)
2. ✅ Increased timeout for image requests (90s vs 60s)
3. ✅ Graceful degradation (analysis works without images)
4. ✅ Flexible URL parsing (accepts more formats)
5. ✅ Rate limit handling (auto-retry with backoff)
6. ✅ Detailed logging (easy debugging)

---

## 🚀 Deployment

1. Set `FIGMA_API_TOKEN` in environment
2. Run `test_figma_integration.py`
3. Deploy to Render/production
4. Monitor logs for 24 hours
5. Share feedback

---

## 💡 Tips

- **Test file**: Use Figma Team File (usually public)
- **Small test first**: Try with 1-5 frames before larger files
- **Sharing**: Make file public if private: File → Share
- **Token expires**: Regenerate if analysis starts failing
- **Large files**: May take 30-60 seconds (normal)

---

## 🆘 Need Help?

1. Check error message in frontend
2. Search in `FIGMA_TROUBLESHOOTING.md`
3. Run `test_figma_integration.py`
4. Check backend logs: `tail -f backend.log`
5. Verify token: `curl -H "X-Figma-Token: ..." https://api.figma.com/v1/me`

---

## 📞 Support Resources

| Resource | URL |
|----------|-----|
| Figma API Docs | https://www.figma.com/developers/api |
| Figma Dev Portal | https://www.figma.com/developers/api#auth |
| ARAI Guides | See `/FIGMA_*.md` files |
| Test Suite | `test_figma_integration.py` |

---

**Last Updated**: April 16, 2026  
**Status**: ✅ Production Ready  
**Version**: 1.0.0

Your Figma integration is complete and ready to use! 🎉
