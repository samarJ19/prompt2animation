from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
import uvicorn
import os
import asyncio
import uuid
from datetime import datetime
import logging

from services.mainm_generator import ManimGenerator
from utils.file_utils import FileManager
from models.request_models import PromptRequest, RenderRequest, GenerateResponse, RenderResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Manim Animation API",
    description="API service for generating animations using Manim",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Node.js backend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
manim_generator = ManimGenerator()
file_manager = FileManager()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Starting Manim API service...")
    
    # Create necessary directories
    await file_manager.create_directories()
    
    # Initialize Manim generator
    await manim_generator.initialize()
    
    logger.info("✅ Manim API service ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🔄 Shutting down Manim API service...")
    await file_manager.cleanup_temp_files()
    logger.info("✅ Shutdown complete!")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "manim-api",
        "timestamp": datetime.now().isoformat(),
        "manim_version": manim_generator.get_version()
    }

@app.post("/generate-manim", response_model=GenerateResponse)
async def generate_manim_code(request: PromptRequest):
    """
    Generate Manim code from natural language prompt
    """
    try:
        logger.info(f"Generating Manim code for prompt: {request.prompt[:50]}...")
        
        # Generate Manim code
        manim_code = await manim_generator.prompt_to_manim(
            prompt=request.prompt,
            duration=request.duration,
            resolution=request.resolution,
            frame_rate=request.frame_rate,
            background_color=request.background_color
        )
        
        logger.info("✅ Manim code generated successfully")
        
        return GenerateResponse(
            success=True,
            manim_code=manim_code,
            message="Manim code generated successfully"
        )
        
    except Exception as e:
        logger.error(f"❌ Error generating Manim code: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate Manim code: {str(e)}"
        )

@app.post("/render-animation", response_model=RenderResponse)
async def render_animation(request: RenderRequest):
    """
    Render Manim code to video animation
    """
    try:
        logger.info(f"Rendering animation for ID: {request.animation_id}")
        
        # Generate unique filename
        video_filename = f"{request.animation_id}_{uuid.uuid4().hex[:8]}.mp4"
        
        # Render animation
        video_path, render_info = await manim_generator.render_manim(
            manim_code=request.manim_code,
            filename=video_filename,
            settings=request.settings
        )
        
        # Generate thumbnail if successful
        thumbnail_path = None
        if video_path and os.path.exists(video_path):
            thumbnail_path = await file_manager.generate_thumbnail(
                video_path, 
                f"{request.animation_id}_thumb.jpg"
            )
        
        logger.info(f"✅ Animation rendered successfully: {video_path}")
        
        return RenderResponse(
            success=True,
            video_path=video_path,
            thumbnail_path=thumbnail_path,
            render_info=render_info,
            message="Animation rendered successfully"
        )
        
    except Exception as e:
        logger.error(f"❌ Error rendering animation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to render animation: {str(e)}"
        )

@app.post("/render-async")
async def render_animation_async(request: RenderRequest, background_tasks: BackgroundTasks):
    """
    Start async rendering process (for long animations)
    """
    try:
        task_id = str(uuid.uuid4())
        
        # Add background task
        background_tasks.add_task(
            manim_generator.render_async,
            request.manim_code,
            f"{request.animation_id}_{task_id}.mp4",
            request.settings,
            task_id
        )
        
        return {
            "success": True,
            "task_id": task_id,
            "message": "Rendering started in background"
        }
        
    except Exception as e:
        logger.error(f"❌ Error starting async render: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start rendering: {str(e)}"
        )

@app.get("/render-status/{task_id}")
async def get_render_status(task_id: str):
    """
    Get status of async rendering task
    """
    try:
        status = await manim_generator.get_render_status(task_id)
        return status
        
    except Exception as e:
        logger.error(f"❌ Error getting render status: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get render status: {str(e)}"
        )

@app.delete("/cleanup/{animation_id}")
async def cleanup_files(animation_id: str):
    """
    Clean up temporary files for an animation
    """
    try:
        cleaned_files = await file_manager.cleanup_animation_files(animation_id)
        
        return {
            "success": True,
            "cleaned_files": cleaned_files,
            "message": f"Cleaned up {len(cleaned_files)} files"
        }
        
    except Exception as e:
        logger.error(f"❌ Error cleaning up files: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to cleanup files: {str(e)}"
        )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="localhost",
        port=8000,
        reload=True,
        log_level="info"
    )

