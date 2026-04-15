"""
Figma API Client for extracting design files and components.
Handles authentication, file fetching, and data parsing.
"""

import os
import re
import logging
import time
from typing import Optional, Dict, List, Any, Tuple
from dataclasses import dataclass, asdict
import requests
from urllib.parse import urlparse, parse_qs
from datetime import datetime
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)


@dataclass
class FigmaColor:
    """Represents a color value from Figma"""
    r: float  # 0-1
    g: float
    b: float
    a: float = 1.0
    
    def to_hex(self) -> str:
        """Convert to hex color code"""
        def to_hex_part(val: float) -> str:
            return format(int(val * 255), '02x')
        return f"#{to_hex_part(self.r)}{to_hex_part(self.g)}{to_hex_part(self.b)}"
    
    def to_rgb(self) -> Tuple[int, int, int]:
        """Convert to RGB tuple"""
        return (int(self.r * 255), int(self.g * 255), int(self.b * 255))


@dataclass
class FigmaTextStyle:
    """Text properties from Figma"""
    font_family: Optional[str] = None
    font_size: Optional[float] = None
    font_weight: Optional[int] = None
    line_height_percent: Optional[float] = None
    letter_spacing: Optional[float] = None
    text_align: Optional[str] = None
    color: Optional[FigmaColor] = None


@dataclass
class FigmaNode:
    """Represents a Figma node (element)"""
    id: str
    name: str
    type: str  # FRAME, TEXT, SHAPE, COMPONENT, etc.
    x: float
    y: float
    width: float
    height: float
    visible: bool = True
    opacity: float = 1.0
    
    # Text properties
    characters: Optional[str] = None
    text_style: Optional[FigmaTextStyle] = None
    
    # Fill and stroke
    fills: Optional[List[Dict[str, Any]]] = None
    strokes: Optional[List[Dict[str, Any]]] = None
    
    # Component info
    component_id: Optional[str] = None
    is_component: bool = False
    is_instance: bool = False
    
    # Children
    children: Optional[List['FigmaNode']] = None
    
    # Bounding box
    absolute_bounding_box: Optional[Dict[str, float]] = None
    
    def get_background_color(self) -> Optional[FigmaColor]:
        """Extract background color from fills"""
        if not self.fills:
            return None
        
        for fill in self.fills:
            if fill.get('type') == 'SOLID' and fill.get('visible', True):
                color_data = fill.get('color', {})
                if color_data:
                    return FigmaColor(
                        r=color_data.get('r', 0),
                        g=color_data.get('g', 0),
                        b=color_data.get('b', 0),
                        a=color_data.get('a', 1.0)
                    )
        return None
    
    def get_text_color(self) -> Optional[FigmaColor]:
        """Extract text color"""
        if self.text_style and self.text_style.color:
            return self.text_style.color
        return None


@dataclass
class FigmaPage:
    """Represents a Figma page"""
    id: str
    name: str
    nodes: List[FigmaNode]


class FigmaAPIClient:
    """
    Client for interacting with the Figma REST API.
    Authenticates using personal access token.
    """
    
    BASE_URL = "https://api.figma.com/v1"
    
    def __init__(self, token: Optional[str] = None):
        """
        Initialize Figma API client.
        
        Args:
            token: Figma personal access token. If None, reads from env var FIGMA_API_TOKEN
        """
        self.token = token or os.getenv("FIGMA_API_TOKEN")
        if not self.token:
            raise ValueError(
                "Figma API token not provided. Set FIGMA_API_TOKEN environment variable "
                "or pass token parameter."
            )
        
        self.headers = {
            "X-Figma-Token": self.token,
            "Content-Type": "application/json"
        }
        
        # Configure retry strategy with exponential backoff for rate limiting
        retry_strategy = Retry(
            total=5,  # Maximum 5 retries
            backoff_factor=1,  # Exponential backoff: 1s, 2s, 4s, 8s, 16s
            status_forcelist=[429, 500, 502, 503, 504],  # Retry on these HTTP codes
            allowed_methods=["GET", "POST", "HEAD", "OPTIONS"]  # Retry GET and POST requests
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        
        self.session = requests.Session()
        self.session.headers.update(self.headers)
        self.session.mount("https://", adapter)
        self.session.mount("http://", adapter)
    
    @staticmethod
    def extract_file_key(figma_url: str) -> str:
        """
        Extract file key from Figma URL.
        
        Supports:
        - https://www.figma.com/file/FILE_KEY/filename
        - https://www.figma.com/design/FILE_KEY/filename
        
        Args:
            figma_url: Full Figma file URL
            
        Returns:
            File key string
            
        Raises:
            ValueError: If URL format is invalid
        """
        if not figma_url:
            raise ValueError("URL cannot be empty")
        
        # Pattern: /file/ or /design/ followed by the file key
        pattern = r"figma\.com/(?:file|design)/([a-zA-Z0-9]+)"
        match = re.search(pattern, figma_url)
        
        if not match:
            raise ValueError(
                f"Invalid Figma URL: {figma_url}. "
                "Expected format: https://www.figma.com/file/FILE_KEY/filename or "
                "https://www.figma.com/design/FILE_KEY/filename"
            )
        
        return match.group(1)
    
    def _handle_rate_limit(self, response: requests.Response) -> None:
        """
        Handle rate limit headers and implement smart backoff.
        
        Args:
            response: The response object from Figma API
        """
        # Check for rate limit headers
        remaining = response.headers.get('X-RateLimit-Remaining')
        reset_time = response.headers.get('X-RateLimit-Reset')
        
        if remaining:
            remaining = int(remaining)
            logger.info(f"⏱️  Rate limit: {remaining} requests remaining")
            
            # If we're approaching the limit, add a small delay
            if remaining < 5:
                delay = 2
                logger.warning(f"⚠️  Approaching rate limit! Waiting {delay}s before next request")
                time.sleep(delay)
        
        if reset_time:
            reset = int(reset_time)
            reset_epoch = reset / 1000 if reset > 10000000000 else reset
            seconds_until_reset = max(0, reset_epoch - time.time())
            if seconds_until_reset > 0:
                logger.info(f"⏱️  Rate limit resets in {seconds_until_reset:.0f} seconds")
    
    def get_file(self, file_key: str) -> Dict[str, Any]:
        """
        Fetch Figma file data.
        
        Args:
            file_key: Figma file key
            
        Returns:
            File data dict containing pages, components, etc.
            
        Raises:
            requests.HTTPError: If API request fails
        """
        url = f"{self.BASE_URL}/files/{file_key}"
        
        logger.info(f"📥 Fetching Figma file: {file_key}")
        response = self.session.get(url, timeout=60)
        self._handle_rate_limit(response)
        response.raise_for_status()

        return response.json()
    
    def get_file_nodes(self, file_key: str, node_ids: List[str]) -> Dict[str, Any]:
        """
        Get specific nodes from a file.
        
        Args:
            file_key: Figma file key
            node_ids: List of node IDs to fetch
            
        Returns:
            Node data dict
        """
        if not node_ids:
            return {}
        
        # API supports comma-separated IDs
        ids_param = ",".join(node_ids)
        url = f"{self.BASE_URL}/files/{file_key}/nodes"
        params = {"ids": ids_param}
        
        logger.info(f"📥 Fetching {len(node_ids)} nodes from Figma file")
        response = self.session.get(url, params=params, timeout=60)
        self._handle_rate_limit(response)
        response.raise_for_status()
        
        return response.json()
    
    def parse_node(self, node_data: Dict[str, Any]) -> Optional[FigmaNode]:
        """
        Parse Figma node data into FigmaNode object.
        
        Args:
            node_data: Raw node data from Figma API
            
        Returns:
            FigmaNode object or None if parsing fails
        """
        try:
            node_id = node_data.get("id", "")
            node_type = node_data.get("type", "")
            
            # Skip if missing essential data
            if not node_id or not node_type:
                return None
            
            # Parse text style if present
            text_style = None
            if "style" in node_data:
                style_data = node_data["style"]
                text_color = None
                
                # Extract text color from fills if this is a text node
                if node_type == "TEXT" and "fills" in node_data:
                    fills = node_data.get("fills", [])
                    for fill in fills:
                        if fill.get("type") == "SOLID" and fill.get("visible", True):
                            color = fill.get("color", {})
                            text_color = FigmaColor(
                                r=color.get("r", 0),
                                g=color.get("g", 0),
                                b=color.get("b", 0),
                                a=color.get("a", 1.0)
                            )
                            break
                
                text_style = FigmaTextStyle(
                    font_family=style_data.get("fontFamily"),
                    font_size=style_data.get("fontSize"),
                    font_weight=style_data.get("fontWeight"),
                    line_height_percent=style_data.get("lineHeightPercent"),
                    letter_spacing=style_data.get("letterSpacing"),
                    text_align=style_data.get("textAlignHorizontal"),
                    color=text_color
                )
            
            # Parse children recursively
            children = None
            if "children" in node_data:
                children = []
                for child_data in node_data["children"]:
                    child = self.parse_node(child_data)
                    if child:
                        children.append(child)
            
            node = FigmaNode(
                id=node_id,
                name=node_data.get("name", ""),
                type=node_type,
                x=node_data.get("x", 0),
                y=node_data.get("y", 0),
                width=node_data.get("width", 0),
                height=node_data.get("height", 0),
                visible=node_data.get("visible", True),
                opacity=node_data.get("opacity", 1.0),
                characters=node_data.get("characters"),
                text_style=text_style,
                fills=node_data.get("fills"),
                strokes=node_data.get("strokes"),
                component_id=node_data.get("componentId"),
                is_component=node_data.get("isComponent", False),
                is_instance=node_data.get("isInstance", False),
                children=children,
                absolute_bounding_box=node_data.get("absoluteBoundingBox")
            )
            
            return node
        
        except Exception as e:
            logger.warning(f"⚠️ Failed to parse node: {e}")
            return None
    
    def extract_pages(self, file_data: Dict[str, Any]) -> List[FigmaPage]:
        """
        Extract pages from file data.
        
        Args:
            file_data: File data from get_file()
            
        Returns:
            List of FigmaPage objects
        """
        pages = []
        
        for page_data in file_data.get("document", {}).get("children", []):
            if page_data.get("type") != "CANVAS":
                continue
            
            page_id = page_data.get("id", "")
            page_name = page_data.get("name", "Untitled")
            
            # Parse nodes on this page
            nodes = []
            for node_data in page_data.get("children", []):
                node = self.parse_node(node_data)
                if node:
                    nodes.append(node)
            
            pages.append(FigmaPage(id=page_id, name=page_name, nodes=nodes))
        
        logger.info(f"✅ Extracted {len(pages)} pages from Figma file")
        return pages
    
    def extract_frames(self, page: FigmaPage) -> List[FigmaNode]:
        """
        Extract top-level FRAME nodes (screens) from a page.
        Only returns direct children of the canvas that are FRAMEs or SECTIONs —
        these represent individual screens/artboards, not nested components.

        Args:
            page: FigmaPage object

        Returns:
            List of top-level frame nodes
        """
        frames = [node for node in page.nodes if node.type in ("FRAME", "SECTION")]
        logger.info(f"✅ Extracted {len(frames)} frames from page '{page.name}'")
        return frames

    def get_frame_images(
        self,
        file_key: str,
        node_ids: List[str],
        scale: float = 0.5,
        format: str = "png"
    ) -> Dict[str, str]:
        """
        Fetch rendered image URLs for specific frames via Figma's /images endpoint.

        Args:
            file_key: Figma file key
            node_ids: List of node IDs to render (max 200 per request)
            scale: Export scale (0.01 – 4). Default 0.5 for thumbnails.
            format: Image format — "png", "jpg", "svg", or "pdf"

        Returns:
            Dict mapping node_id → image URL (may be None if render failed)
        """
        if not node_ids:
            return {}

        ids_param = ",".join(node_ids)
        url = f"{self.BASE_URL}/images/{file_key}"
        params = {"ids": ids_param, "scale": scale, "format": format}

        logger.info(f"📸 Fetching preview images for {len(node_ids)} frames...")
        response = self.session.get(url, params=params, timeout=60)
        self._handle_rate_limit(response)
        response.raise_for_status()

        data = response.json()
        images = data.get("images", {})
        # Filter out None values
        valid_images = {k: v for k, v in images.items() if v}
        logger.info(f"✅ Got {len(valid_images)}/{len(node_ids)} frame preview URLs")
        return valid_images
    
    def extract_all_elements(self, node: FigmaNode) -> List[FigmaNode]:
        """
        Recursively extract all elements from a node and its children.
        
        Args:
            node: Root node
            
        Returns:
            Flat list of all elements
        """
        elements = [node]
        
        if node.children:
            for child in node.children:
                elements.extend(self.extract_all_elements(child))
        
        return elements
    
    def get_node_bounds(self, node: FigmaNode) -> Dict[str, float]:
        """Get bounding box coordinates for a node."""
        return {
            "x": node.x,
            "y": node.y,
            "width": node.width,
            "height": node.height,
            "x2": node.x + node.width,
            "y2": node.y + node.height
        }


class FigmaExtractor:
    """
    High-level extractor for Figma design data.
    Combines API client with parsing logic.
    """
    
    def __init__(self, token: Optional[str] = None):
        self.client = FigmaAPIClient(token)
    
    def extract_from_url(self, figma_url: str) -> Dict[str, Any]:
        """
        Complete extraction pipeline from Figma URL.
        
        Args:
            figma_url: Full Figma file URL
            
        Returns:
            Extracted data with pages, frames, and elements
            
        Raises:
            ValueError: If URL is invalid
            requests.HTTPError: If API fails
        """
        # Extract file key from URL
        file_key = self.client.extract_file_key(figma_url)
        logger.info(f"🔑 File key: {file_key}")
        
        # Fetch file data
        file_data = self.client.get_file(file_key)
        
        # Extract pages
        pages = self.client.extract_pages(file_data)
        
        # Extract frames from each page
        result = {
            "file_key": file_key,
            "file_name": file_data.get("name", "Untitled"),
            "timestamp": datetime.utcnow().isoformat(),
            "pages": []
        }
        
        # First pass: extract all pages and frames
        for page in pages:
            page_data = {
                "page_id": page.id,
                "page_name": page.name,
                "frames": []
            }

            frames = self.client.extract_frames(page)

            for frame in frames:
                all_elements = self.client.extract_all_elements(frame)

                frame_data = {
                    "frame_id": frame.id,
                    "frame_name": frame.name,
                    "bounds": self.client.get_node_bounds(frame),
                    "elements": self._serialize_elements(all_elements),
                    "preview_url": None  # populated below
                }

                page_data["frames"].append(frame_data)

            result["pages"].append(page_data)

        # Second pass: fetch preview images for all frames in batches of 200
        all_frame_ids = [
            frame_data["frame_id"]
            for page_data in result["pages"]
            for frame_data in page_data["frames"]
        ]

        frame_images: Dict[str, str] = {}
        if all_frame_ids:
            batch_size = 200
            for i in range(0, len(all_frame_ids), batch_size):
                batch = all_frame_ids[i : i + batch_size]
                try:
                    batch_images = self.client.get_frame_images(file_key, batch, scale=0.5)
                    frame_images.update(batch_images)
                except Exception as img_error:
                    logger.warning(f"⚠️ Could not fetch frame images for batch {i//batch_size + 1}: {img_error}")

            # Attach preview URLs to frame data
            for page_data in result["pages"]:
                for frame_data in page_data["frames"]:
                    frame_data["preview_url"] = frame_images.get(frame_data["frame_id"])

        logger.info(f"✅ Attached preview URLs to {len(frame_images)}/{len(all_frame_ids)} frames")
        return result
    
    def _serialize_elements(self, elements: List[FigmaNode]) -> List[Dict[str, Any]]:
        """Convert elements to serializable format"""
        serialized = []
        
        for elem in elements:
            elem_dict = {
                "id": elem.id,
                "name": elem.name,
                "type": elem.type,
                "bounds": {
                    "x": elem.x,
                    "y": elem.y,
                    "width": elem.width,
                    "height": elem.height
                },
                "visible": elem.visible,
                "opacity": elem.opacity,
            }
            
            # Add text content if available
            if elem.characters:
                elem_dict["text"] = elem.characters
            
            # Add text style if available
            if elem.text_style:
                style = elem.text_style
                elem_dict["text_style"] = {
                    "font_family": style.font_family,
                    "font_size": style.font_size,
                    "font_weight": style.font_weight,
                    "line_height_percent": style.line_height_percent,
                    "letter_spacing": style.letter_spacing,
                    "text_align": style.text_align,
                    "color": style.color.to_hex() if style.color else None
                }
            
            # Add colors
            if elem.get_background_color():
                elem_dict["background_color"] = elem.get_background_color().to_hex()
            
            if elem.get_text_color():
                elem_dict["text_color"] = elem.get_text_color().to_hex()
            
            serialized.append(elem_dict)
        
        return serialized
