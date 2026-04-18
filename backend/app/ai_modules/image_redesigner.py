"""
Image Redesigner: Generates visual analysis overlays and an auto-enhanced version
of the uploaded design based on accessibility, readability, and attention results.
"""
from __future__ import annotations
import base64
import io
import logging
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

logger = logging.getLogger(__name__)

# Max dimension for output images (keeps base64 payload small)
MAX_DIM = 900


class ImageRedesigner:
    def generate(self, image_path: str, analysis_results: dict) -> dict:
        """
        Returns:
          heatmap  – attention heatmap overlaid on original (3×3 grid, jet colormap)
          annotated – original with issue-severity overlays + score banner
          enhanced  – auto-corrected version (contrast, brightness, sharpness, vignette)
        """
        try:
            img = self._load(image_path)
            return {
                "heatmap":   self._to_b64(self._heatmap(img, analysis_results)),
                "annotated": self._to_b64(self._annotated(img, analysis_results)),
                "enhanced":  self._to_b64(self._enhanced(img, analysis_results)),
            }
        except Exception as exc:
            logger.error(f"ImageRedesigner.generate failed: {exc}", exc_info=True)
            return {}

    # ── helpers ──────────────────────────────────────────────────────────────

    def _load(self, path: str) -> Image.Image:
        img = Image.open(path).convert("RGB")
        w, h = img.size
        if max(w, h) > MAX_DIM:
            ratio = MAX_DIM / max(w, h)
            img = img.resize((int(w * ratio), int(h * ratio)), Image.LANCZOS)
        return img

    @staticmethod
    def _to_b64(img: Image.Image) -> str:
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=88, optimize=True)
        buf.seek(0)
        return "data:image/jpeg;base64," + base64.b64encode(buf.read()).decode()

    @staticmethod
    def _jet(t: float):
        """Map t ∈ [0,1] → (R,G,B) using a jet-like colormap."""
        r = int(np.clip(1.5 - abs(4 * t - 3), 0, 1) * 255)
        g = int(np.clip(1.5 - abs(4 * t - 2), 0, 1) * 255)
        b = int(np.clip(1.5 - abs(4 * t - 1), 0, 1) * 255)
        return r, g, b

    # ── 1. Attention heatmap ──────────────────────────────────────────────────

    def _heatmap(self, img: Image.Image, results: dict) -> Image.Image:
        """
        Divides image into a 3×3 grid.  Each cell is scored by luminance
        variance + edge density → mapped to jet colormap overlay.
        High score (red) = regions likely to attract user gaze.
        """
        gray = np.array(img.convert("L"), dtype=np.float32)
        h, w = gray.shape
        ch, cw = h // 3, w // 3

        scores = np.zeros((3, 3))
        for r in range(3):
            for c in range(3):
                region = gray[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw]
                variance  = float(np.var(region))
                edge_mean = float(np.mean(np.abs(np.diff(region))))
                scores[r, c] = variance * 0.6 + edge_mean * 100 * 0.4

        lo, hi = scores.min(), scores.max()
        if hi > lo:
            scores = (scores - lo) / (hi - lo)

        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw    = ImageDraw.Draw(overlay)

        labels = ["LOW", "MED", "HIGH"]

        for r in range(3):
            for c in range(3):
                x1, y1 = c * cw, r * ch
                x2, y2 = x1 + cw, y1 + ch
                t      = scores[r, c]
                color  = self._jet(t)
                alpha  = int(100 + t * 100)
                draw.rectangle([x1, y1, x2, y2], fill=(*color, alpha))

                # label
                label = labels[0] if t < 0.34 else (labels[1] if t < 0.67 else labels[2])
                tx, ty = x1 + cw // 2 - 14, y1 + ch // 2 - 8
                # shadow
                draw.text((tx + 1, ty + 1), label, fill=(0, 0, 0, 180))
                draw.text((tx,     ty),     label, fill=(255, 255, 255, 230))

        # grid lines
        for i in range(1, 3):
            draw.line([(i * cw, 0), (i * cw, h)],  fill=(255, 255, 255, 100), width=1)
            draw.line([(0, i * ch), (w, i * ch)],   fill=(255, 255, 255, 100), width=1)

        result = Image.alpha_composite(img.convert("RGBA"), overlay)

        # Legend bar at bottom
        result = self._add_legend(
            result.convert("RGB"), w,
            title="Attention Heatmap",
            items=[
                ("\u25a0 HIGH FOCUS", (220, 50, 50)),
                ("\u25a0 MED FOCUS",  (220, 200, 50)),
                ("\u25a0 LOW FOCUS",  (50, 80, 200)),
            ]
        )
        return result

    # ── 2. Issue-annotated overlay ────────────────────────────────────────────

    def _annotated(self, img: Image.Image, results: dict) -> Image.Image:
        """
        Draws coloured borders and translucent zones per module score:
          • Accessibility  → red tint on top half (where UI controls live)
          • Readability    → amber tint on lower third (text-heavy area)
          • Attention      → purple hatching if visual balance is poor
        Adds a score banner at the bottom.
        """
        w, h = img.size
        base    = img.convert("RGBA")
        overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
        draw    = ImageDraw.Draw(overlay)

        acc  = results.get("accessibility", {}).get("score", 100)
        read = results.get("readability",   {}).get("score", 100)
        attn = results.get("attention",     {}).get("score", 100)

        # Accessibility zone (top 55 %)
        if acc < 85:
            a = int((85 - acc) / 85 * 80) + 20
            draw.rectangle([0, 0, w, int(h * 0.55)], fill=(220, 50, 50, a))

        # Readability zone (bottom 40 %)
        if read < 85:
            a = int((85 - read) / 85 * 70) + 15
            draw.rectangle([0, int(h * 0.60), w, h], fill=(255, 180, 0, a))

        # Attention: hatching if imbalanced
        if attn < 75:
            for i in range(0, w + h, 24):
                draw.line(
                    [(max(0, i - h), min(h, i)), (min(w, i), max(0, i - w))],
                    fill=(130, 30, 200, 35), width=6
                )

        # Border colour by worst score
        worst = min(acc, read, attn)
        border_color = (
            (220, 50,  50,  200) if worst < 60 else
            (255, 165, 0,   200) if worst < 80 else
            (50,  180, 80,  200)
        )
        draw.rectangle([1, 1, w - 2, h - 2], outline=border_color, width=4)

        composite = Image.alpha_composite(base, overlay).convert("RGB")

        # Score banner
        def _color(s):
            return (220, 50, 50) if s < 60 else (255, 140, 0) if s < 80 else (50, 175, 80)

        composite = self._add_legend(
            composite, w,
            title="Issue Overlay",
            items=[
                (f"ACC {acc:.0f}%",  _color(acc)),
                (f"READ {read:.0f}%", _color(read)),
                (f"ATTN {attn:.0f}%", _color(attn)),
            ]
        )
        return composite

    # ── 3. Auto-enhanced version ──────────────────────────────────────────────

    def _enhanced(self, img: Image.Image, results: dict) -> Image.Image:
        """
        Applies PIL corrections driven by analysis scores:
          • Low accessibility score  → contrast boost
          • Dark/washed-out image    → brightness normalisation
          • Low readability score    → sharpening
          • Low attention score      → focus vignette
          • Always: slight colour saturation boost
        """
        enhanced = img.copy()
        acc  = results.get("accessibility", {}).get("score", 100)
        read = results.get("readability",   {}).get("score", 100)
        attn = results.get("attention",     {}).get("score", 100)

        # Contrast
        if acc < 80:
            factor = 1.0 + (80 - acc) / 120       # max ≈ 1.67
            enhanced = ImageEnhance.Contrast(enhanced).enhance(min(factor, 1.7))

        # Brightness normalisation
        gray = np.array(enhanced.convert("L"), dtype=np.float32)
        avg  = float(np.mean(gray))
        if avg < 85:
            enhanced = ImageEnhance.Brightness(enhanced).enhance(1.25)
        elif avg > 210:
            enhanced = ImageEnhance.Brightness(enhanced).enhance(0.88)

        # Sharpness (readability)
        if read < 75:
            enhanced = enhanced.filter(ImageFilter.SHARPEN)
            enhanced = ImageEnhance.Sharpness(enhanced).enhance(1.6)

        # Focus vignette (attention)
        if attn < 75:
            enhanced = self._vignette(enhanced)

        # Colour pop
        enhanced = ImageEnhance.Color(enhanced).enhance(1.12)

        enhanced = self._add_legend(
            enhanced, img.width,
            title="Suggested Enhancement",
            items=[
                ("Contrast corrected"  if acc  < 80 else "Contrast OK",   (100, 160, 255)),
                ("Sharpness boosted"   if read < 75 else "Sharpness OK",   (100, 220, 160)),
                ("Focus vignette added" if attn < 75 else "Balance OK",    (200, 150, 255)),
            ]
        )
        return enhanced

    def _vignette(self, img: Image.Image) -> Image.Image:
        """Darken edges to draw the eye inward."""
        w, h   = img.size
        cx, cy = w / 2, h / 2
        max_d  = (cx ** 2 + cy ** 2) ** 0.5

        y_idx, x_idx = np.mgrid[0:h, 0:w]
        dist         = ((x_idx - cx) ** 2 + (y_idx - cy) ** 2) ** 0.5
        norm         = dist / max_d
        alpha        = (norm ** 1.8 * 140).astype(np.uint8)

        pixels = np.zeros((h, w, 4), dtype=np.uint8)
        pixels[:, :, 3] = alpha            # black transparent to black opaque

        mask = Image.fromarray(pixels, "RGBA")
        result = Image.alpha_composite(img.convert("RGBA"), mask)
        return result.convert("RGB")

    # ── shared legend bar ─────────────────────────────────────────────────────

    @staticmethod
    def _add_legend(img: Image.Image, w: int, title: str, items: list) -> Image.Image:
        """Attach a dark banner at the bottom with coloured indicator chips."""
        bar_h  = 48
        bar    = Image.new("RGB", (w, bar_h), (18, 30, 66))
        draw   = ImageDraw.Draw(bar)

        # Title
        draw.text((12, 6), title, fill=(180, 195, 230))

        # Items spread across the bar
        spacing = w // (len(items) + 1)
        for i, (text, color) in enumerate(items):
            x = spacing * (i + 1)
            # chip
            draw.rectangle([x - 6, 28, x + 6, 40], fill=color)
            draw.text((x + 10, 28), text, fill=(210, 220, 240))

        result = Image.new("RGB", (w, img.height + bar_h))
        result.paste(img, (0, 0))
        result.paste(bar, (0, img.height))
        return result
