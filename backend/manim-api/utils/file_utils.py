import os
import shutil
import asyncio
import logging
from typing import List, Optional
import subprocess

logger = logging.getLogger(__name__)

class FileManager:
    def __init__(self):
        self.output_dir = os.getenv("OUTPUT_DIR", "../uploads/videos")
        self.temp_dir = os.getenv("TEMP_DIR", "../uploads/temp")
        self.thumbnail_dir = os.path.join(os.path.dirname(self.output_dir), "thumbnails")

    async def create_directories(self):
        """Create necessary directories"""
        directories = [self.output_dir, self.temp_dir, self.thumbnail_dir]
        
        for directory in directories:
            try:
                os.makedirs(directory, exist_ok=True)
                logger.info(f"✓ Directory created/verified: {directory}")
            except Exception as e:
                logger.error(f"Failed to create directory {directory}: {e}")
                raise

    async def generate_thumbnail(self, video_path: str, thumbnail_name: str) -> Optional[str]:
        """Generate thumbnail from video using ffmpeg"""
        try:
            thumbnail_path = os.path.join(self.thumbnail_dir, thumbnail_name)
            
            # Use ffmpeg to extract thumbnail at 1 second mark
            cmd = [
                "ffmpeg",
                "-i", video_path,
                "-ss", "1",
                "-vframes", "1",
                "-y",  # Overwrite output file
                thumbnail_path
            ]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode == 0 and os.path.exists(thumbnail_path):
                logger.info(f"✓ Thumbnail generated: {thumbnail_path}")
                return thumbnail_path
            else:
                logger.warning(f"Failed to generate thumbnail: {stderr.decode()}")
                return None
                
        except Exception as e:
            logger.error(f"Error generating thumbnail: {e}")
            return None

    async def cleanup_temp_files(self, max_age_hours: int = 24):
        """Clean up old temporary files"""
        try:
            import time
            current_time = time.time()
            cleanup_count = 0
            
            for filename in os.listdir(self.temp_dir):
                file_path = os.path.join(self.temp_dir, filename)
                
                if os.path.isfile(file_path):
                    file_age = current_time - os.path.getmtime(file_path)
                    
                    if file_age > (max_age_hours * 3600):
                        os.unlink(file_path)
                        cleanup_count += 1
            
            logger.info(f"✓ Cleaned up {cleanup_count} temporary files")
            
        except Exception as e:
            logger.error(f"Error cleaning up temp files: {e}")

    async def cleanup_animation_files(self, animation_id: str) -> List[str]:
        """Clean up all files related to a specific animation"""
        cleaned_files = []
        
        try:
            # Look for files in all directories
            directories = [self.output_dir, self.temp_dir, self.thumbnail_dir]
            
            for directory in directories:
                if not os.path.exists(directory):
                    continue
                    
                for filename in os.listdir(directory):
                    if animation_id in filename:
                        file_path = os.path.join(directory, filename)
                        if os.path.isfile(file_path):
                            os.unlink(file_path)
                            cleaned_files.append(file_path)
            
            logger.info(f"✓ Cleaned up {len(cleaned_files)} files for animation {animation_id}")
            
        except Exception as e:
            logger.error(f"Error cleaning up animation files: {e}")
        
        return cleaned_files

    def get_file_info(self, file_path: str) -> dict:
        """Get file information"""
        try:
            if not os.path.exists(file_path):
                return {}
            
            stat = os.stat(file_path)
            
            return {
                "size": stat.st_size,
                "created": stat.st_ctime,
                "modified": stat.st_mtime,
                "exists": True
            }
            
        except Exception as e:
            logger.error(f"Error getting file info: {e}")
            return {"exists": False}
