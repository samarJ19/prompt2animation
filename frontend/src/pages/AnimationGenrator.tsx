import { useState, useEffect } from "react";
import { Send, Play, Loader2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export default function AnimationGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [animationUrl, setAnimationUrl] = useState("");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to system preference
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setHasGenerated(false);

    // Simulate API call
    setTimeout(() => {
      // For demo purposes, using a placeholder video URL
      setAnimationUrl(
        "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      );
      setIsLoading(false);
      setHasGenerated(true);
    }, 1000);
  };

  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-200 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Prompt 2 Motion
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            {isDarkMode ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full">
        {/* Messages Area */}
        <div className="flex-1 px-4 py-6 space-y-6">
          {!hasGenerated && !isLoading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <Play className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                Create Amazing Animations
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Describe what you want to animate and I'll generate it for you.
              </p>
            </div>
          )}

          {isLoading && (
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Generating your animation...
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-2 rounded animate-pulse bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-2 rounded animate-pulse w-3/4 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-2 rounded animate-pulse w-1/2 bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {hasGenerated && animationUrl && (
            <div className="space-y-4">
              {/* User Message */}
              <div className="flex items-start space-x-2 justify-end">
                <Card className="max-w-[60%] w-fit bg-gray-900 dark:bg-blue-600 border-gray-800 dark:border-blue-500 px-3 py-2 rounded-xl">
                  <CardContent className="p-1">
                    <p className="text-sm text-white">{prompt}</p>
                  </CardContent>
                </Card>
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gray-900 dark:bg-blue-600">
                  <span className="text-white text-sm font-medium">U</span>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex items-start space-x-4">
                {/* <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">AI</span>
                </div> */}
                <div className="flex-1">
                  <Card className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <p className="mb-4 text-gray-800 dark:text-gray-300">
                        Here's your generated animation:
                      </p>
                      <div className="bg-black rounded-lg overflow-hidden">
                        <video
                          controls
                          className="w-full h-64 object-cover"
                          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3Cpolygon points='40,30 40,70 70,50' fill='%23fff'/%3E%3C/svg%3E"
                        >
                          <source src={animationUrl} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 transition-colors duration-200">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the animation you want to create..."
              className="resize-none pr-12 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-200"
              rows={1}
              style={{
                minHeight: "44px",
                maxHeight: "120px",
                height: "auto",
              }}
              onInput={(e) => {}}
              disabled={isLoading}
            />
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isLoading}
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 h-8 w-8 bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          <div className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400 transition-colors duration-200">
            Press Enter to generate • Shift + Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
