"""
Figma OAuth Token Management
Handles token refresh and expiry logic
"""

import httpx
import logging
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.core.config import settings

logger = logging.getLogger(__name__)


class FigmaOAuthManager:
    """Manages Figma OAuth token lifecycle"""
    
    def __init__(self):
        self.token_cache: Dict[str, Dict[str, Any]] = {}
    
    async def refresh_token(self, refresh_token: str) -> Optional[Dict[str, Any]]:
        """
        Refresh an expired OAuth token
        
        Args:
            refresh_token: The refresh token from original OAuth flow
        
        Returns:
            New token data with access_token, expires_in, etc.
        """
        if not settings.FIGMA_CLIENT_ID or not settings.FIGMA_CLIENT_SECRET:
            logger.error("❌ Figma OAuth credentials not configured")
            return None
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://www.figma.com/api/oauth/token",
                    data={
                        "client_id": settings.FIGMA_CLIENT_ID,
                        "client_secret": settings.FIGMA_CLIENT_SECRET,
                        "refresh_token": refresh_token,
                        "grant_type": "refresh_token"
                    }
                )
            
            if response.status_code == 200:
                token_data = response.json()
                logger.info("✅ Token refreshed successfully")
                return token_data
            else:
                logger.error(f"❌ Token refresh failed: {response.text}")
                return None
        
        except Exception as e:
            logger.error(f"❌ Token refresh error: {e}")
            return None
    
    def is_token_expired(self, expires_at: float) -> bool:
        """
        Check if token is expired (with 5 minute buffer)
        
        Args:
            expires_at: Unix timestamp when token expires
        
        Returns:
            True if expired or expiring soon
        """
        buffer_minutes = 5
        return datetime.utcnow().timestamp() > (expires_at - buffer_minutes * 60)
    
    async def get_valid_token(
        self, 
        session: Dict[str, Any]
    ) -> Optional[str]:
        """
        Get a valid Figma access token, refreshing if necessary
        
        Args:
            session: User session dict containing token info
        
        Returns:
            Valid access token or None if refresh failed
        """
        access_token = session.get("figma_access_token")
        expires_at = session.get("figma_token_expires")
        refresh_token = session.get("figma_refresh_token")
        
        if not access_token:
            return None
        
        # Check if token is expired
        if expires_at and self.is_token_expired(expires_at):
            if refresh_token:
                logger.info("🔄 Token expired, attempting refresh...")
                new_token_data = await self.refresh_token(refresh_token)
                
                if new_token_data:
                    # Update session with new token
                    session["figma_access_token"] = new_token_data.get("access_token")
                    session["figma_token_expires"] = (
                        datetime.utcnow().timestamp() + new_token_data.get("expires_in", 3600)
                    )
                    # Refresh token might change
                    if "refresh_token" in new_token_data:
                        session["figma_refresh_token"] = new_token_data["refresh_token"]
                    
                    return new_token_data.get("access_token")
                else:
                    logger.error("❌ Token refresh failed")
                    return None
            else:
                logger.warning("⚠️ No refresh token available")
                return None
        
        return access_token


# Global instance
oauth_manager = FigmaOAuthManager()
