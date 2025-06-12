import os
import sys
import subprocess
import tempfile
import asyncio
import time
from typing import Dict, Any, Tuple, Optional
import logging
import re

logger = logging.getLogger(__name__)

class ManimGenerator:
    def __init__(self):
        self.manim_path = os.getenv("MANIM_PATH", "manim")
        self.output_dir = os.getenv("OUTPUT_DIR", "../uploads/videos")
        self.temp_dir = os.getenv("TEMP_DIR", "../uploads/temp")
        self.render_tasks = {}  # Store async render tasks
        
    async def initialize(self):
        """Initialize the Manim generator"""
        try:
            # Check if Manim is installed
            result = subprocess.run([self.manim_path, "--version"], 
                                  capture_output=True, text=True)
            if result.returncode != 0:
                raise Exception("Manim not found or not properly installed")
                
            logger.info(f"Manim version: {result.stdout.strip()}")
            
            # Ensure output directories exist
            os.makedirs(self.output_dir, exist_ok=True)
            os.makedirs(self.temp_dir, exist_ok=True)
            
        except Exception as e:
            logger.error(f"Failed to initialize Manim generator: {e}")
            raise

    def get_version(self) -> str:
        """Get Manim version"""
        try:
            result = subprocess.run([self.manim_path, "--version"], 
                                  capture_output=True, text=True)
            return result.stdout.strip() if result.returncode == 0 else "Unknown"
        except:
            return "Unknown"

    async def prompt_to_manim(self, prompt: str, duration: float = 5.0, 
                            resolution: str = "720p", frame_rate: int = 30,
                            background_color: str = "#000000") -> str:
        """
        Convert natural language prompt to Manim code
        This is a simplified version - in production, you'd use AI/LLM for better conversion
        """
        start_time = time.time()
        
        try:
            # Parse resolution
            res_map = {"480p": (854, 480), "720p": (1280, 720), "1080p": (1920, 1080)}
            width, height = res_map.get(resolution, (1280, 720))
            
            # Simple keyword-based code generation
            # In production, replace this with AI-powered prompt-to-code conversion
            manim_code = self._generate_manim_code_from_prompt(
                prompt, duration, width, height, frame_rate, background_color
            )
            
            # Validate generated code
            if not self._validate_manim_code(manim_code):
                raise Exception("Generated Manim code validation failed")
            
            generation_time = time.time() - start_time
            logger.info(f"Code generation completed in {generation_time:.2f}s")
            
            return manim_code
            
        except Exception as e:
            logger.error(f"Error in prompt_to_manim: {e}")
            raise

    def _generate_manim_code_from_prompt(self, prompt: str, duration: float,
                                       width: int, height: int, frame_rate: int,
                                       background_color: str) -> str:
        """
        Generate Manim code based on prompt analysis
        This is a simplified template-based approach
        """
        
        # Analyze prompt for common patterns
        prompt_lower = prompt.lower()
        
        # Detect animation type
        if any(word in prompt_lower for word in ['circle', 'round', 'ball']):
            return self._generate_circle_animation(duration, background_color)
        elif any(word in prompt_lower for word in ['square', 'rectangle', 'box']):
            return self._generate_square_animation(duration, background_color)
        elif any(word in prompt_lower for word in ['text', 'write', 'words', 'letters']):
            # Extract text to animate
            text_match = re.search(r'["\']([^"\']+)["\']', prompt)
            text_content = text_match.group(1) if text_match else "Hello World"
            return self._generate_text_animation(text_content, duration, background_color)
        elif any(word in prompt_lower for word in ['graph', 'plot', 'chart']):
            return self._generate_graph_animation(duration, background_color)
        else:
            # Default to a simple shape animation
            return self._generate_default_animation(duration, background_color)

    def _generate_circle_animation(self, duration: float, bg_color: str) -> str:
        return f'''
from manim import *

class GeneratedAnimation(Scene):
    def construct(self):
        self.camera.background_color = "{bg_color}"
        
        # Create a circle
        circle = Circle(radius=1.5, color=BLUE)
        circle.set_fill(BLUE, opacity=0.7)
        
        # Animation sequence
        self.play(Create(circle), run_time=1)
        self.play(
            circle.animate.scale(1.5).set_color(RED),
            run_time=1.5
        )
        self.play(
            circle.animate.shift(RIGHT * 2).rotate(PI),
            run_time=1.5
        )
        self.wait({max(0.1, duration - 4)})
'''

    def _generate_square_animation(self, duration: float, bg_color: str) -> str:
        return f'''
from manim import *

class GeneratedAnimation(Scene):
    def construct(self):
        self.camera.background_color = "{bg_color}"
        
        # Create a square
        square = Square(side_length=2, color=GREEN)
        square.set_fill(GREEN, opacity=0.6)
        
        # Animation sequence
        self.play(Create(square), run_time=1)
        self.play(
            square.animate.rotate(PI/4).set_color(YELLOW),
            run_time=1.5
        )
        self.play(
            square.animate.scale(0.5).shift(UP * 2),
            run_time=1.5
        )
        self.wait({max(0.1, duration - 4)})
'''

    def _generate_text_animation(self, text: str, duration: float, bg_color: str) -> str:
        return f'''
from manim import *

class GeneratedAnimation(Scene):
    def construct(self):
        self.camera.background_color = "{bg_color}"
        
        # Create text
        text_obj = Text("{text}", font_size=48, color=WHITE)
        
        # Animation sequence
        self.play(Write(text_obj), run_time=2)
        self.play(
            text_obj.animate.scale(1.2).set_color(YELLOW),
            run_time=1
        )
        self.play(
            text_obj.animate.rotate(PI/6),
            run_time=1
        )
        self.wait({max(0.1, duration - 4)})
'''

    def _generate_graph_animation(self, duration: float, bg_color: str) -> str:
        return f'''
from manim import *
import numpy as np

class GeneratedAnimation(Scene):
    def construct(self):
        self.camera.background_color = "{bg_color}"
        
        # Create axes
        axes = Axes(
            x_range=[-3, 3, 1],
            y_range=[-2, 2, 1],
            x_length=6,
            y_length=4
        )
        
        # Create function
        func = axes.plot(lambda x: np.sin(x), color=BLUE, x_range=[-3, 3])
        
        # Animation sequence
        self.play(Create(axes), run_time=1)
        self.play(Create(func), run_time=2)
        self.wait({max(0.1, duration - 3)})
'''

    def _generate_default_animation(self, duration: float, bg_color: str) -> str:
        return f'''
from manim import *

class GeneratedAnimation(Scene):
    def construct(self):
        self.camera.background_color = "{bg_color}"
        
        # Create multiple shapes
        circle = Circle(radius=1, color=BLUE).shift(LEFT * 2)
        square = Square(side_length=1.5, color=RED)
        triangle = Triangle(color=GREEN).shift(RIGHT * 2)
        
        shapes = Group(circle, square, triangle)
        
        # Animation sequence
        self.play(Create(shapes), run_time=2)
        self.play(
            shapes.animate.rotate(PI/2),
            run_time=1.5
        )
        self.play(
            shapes.animate.scale(0.8).shift(UP),
            run_time=1.5
        )
        self.wait({max(0.1, duration - 5)})
'''

    def _validate_manim_code(self, code: str) -> bool:
        """Basic validation of generated Manim code"""
        required_elements = [
            'from manim import *',
            'class GeneratedAnimation(Scene):',
            'def construct(self):',
            'self.play('
        ]
        
        return all(element in code for element in required_elements)

    async def render_manim(self, manim_code: str, filename: str, 
                         settings: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
        """
        Render Manim code to video file
        """
        start_time = time.time()
        
        try:
            # Create temporary Python file
            with tempfile.NamedTemporaryFile(mode='w', suffix='.py', 
                                           dir=self.temp_dir, delete=False) as f:
                f.write(manim_code)
                temp_py_file = f.name
            
            # Prepare output path
            output_path = os.path.join(self.output_dir, filename)
            
            # Build Manim command
            resolution = settings.get('resolution', '720p')
            quality_flag = self._get_quality_flag(resolution)
            
            cmd = [
                self.manim_path,
                temp_py_file,
                "GeneratedAnimation",
                quality_flag,
                "--output_file", output_path,
                "--disable_caching"
            ]
            
            # Run Manim rendering
            logger.info(f"Running command: {' '.join(cmd)}")
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown rendering error"
                logger.error(f"Manim rendering failed: {error_msg}")
                raise Exception(f"Rendering failed: {error_msg}")
            
            # Clean up temp file
            os.unlink(temp_py_file)
            
            # Verify output file exists
            if not os.path.exists(output_path):
                raise Exception("Output video file was not created")
            
            render_time = time.time() - start_time
            
            # Get file info
            file_size = os.path.getsize(output_path)
            
            render_info = {
                "render_time": render_time,
                "file_size": file_size,
                "resolution": resolution,
                "filename": filename
            }
            
            logger.info(f"Rendering completed in {render_time:.2f}s, file size: {file_size} bytes")
            
            return output_path, render_info
            
        except Exception as e:
            logger.error(f"Error in render_manim: {e}")
            # Clean up temp file if it exists
            try:
                if 'temp_py_file' in locals():
                    os.unlink(temp_py_file)
            except:
                pass
            raise

    def _get_quality_flag(self, resolution: str) -> str:
        """Get Manim quality flag based on resolution"""
        quality_map = {
            "480p": "-ql",   # Low quality
            "720p": "-qm",   # Medium quality  
            "1080p": "-qh"   # High quality
        }
        return quality_map.get(resolution, "-qm")

    async def render_async(self, manim_code: str, filename: str, 
                         settings: Dict[str, Any], task_id: str):
        """
        Async rendering for background processing
        """
        try:
            self.render_tasks[task_id] = {"status": "processing", "progress": 0}
            
            video_path, render_info = await self.render_manim(manim_code, filename, settings)
            
            self.render_tasks[task_id] = {
                "status": "completed",
                "video_path": video_path,
                "render_info": render_info
            }
            
        except Exception as e:
            self.render_tasks[task_id] = {
                "status": "failed",
                "error": str(e)
            }

    async def get_render_status(self, task_id: str) -> Dict[str, Any]:
        """Get status of async render task"""
        if task_id not in self.render_tasks:
            raise Exception("Task not found")
        
        return self.render_tasks[task_id]
