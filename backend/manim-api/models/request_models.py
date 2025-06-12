from pydantic import BaseModel, Field
from typing import Optional, Dict, Any

class PromptRequest(BaseModel):
    prompt: str = Field(..., min_length=10, max_length=1000, description="Natural language description of the animation")
    duration: float = Field(default=5.0, ge=1.0, le=60.0, description="Animation duration in seconds")
    resolution: str = Field(default="720p", pattern="^(480p|720p|1080p)$", description="Video resolution")
    frame_rate: int = Field(default=30, ge=24, le=60, description="Frames per second")
    background_color: str = Field(default="#000000", pattern="^#[0-9A-Fa-f]{6}$", description="Background color in hex format")

class RenderRequest(BaseModel):
    manim_code: str = Field(..., min_length=50, description="Generated Manim Python code")
    animation_id: str = Field(..., description="Unique animation identifier")
    settings: Dict[str, Any] = Field(default_factory=dict, description="Additional rendering settings")

class GenerateResponse(BaseModel):
    success: bool
    manim_code: str
    message: str
    generation_time: Optional[float] = None

class RenderResponse(BaseModel):
    success: bool
    video_path: Optional[str] = None
    thumbnail_path: Optional[str] = None
    render_info: Optional[Dict[str, Any]] = None
    message: str
    render_time: Optional[float] = None
