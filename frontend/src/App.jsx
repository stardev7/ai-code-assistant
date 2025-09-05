import { useState } from "react";
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import {
  Send, Code, Upload, Bot, Copy, Sparkles,
  CheckCircle, AlertCircle, FileCode, Clock,
  BookOpen, ExternalLink, ChevronDown,
  ChevronRight, Lightbulb, Zap, Globe,
  Activity, Play, Star, Award
} from "lucide-react";

function App() {
  const [code, setCode] = useState(`def sum(a, b):
    """Add two numbers together"""
    return a + b

# Example usage
result = sum(5, 3)
print(f"Result: {result}")`);
  
  const [review, setReview] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState({
    suggestions: true,
    python: true,
    java: false,
    c: false,
    cpp: false,
    complexity: true,
    links: true
  });

  // Enhanced color scheme
  const colorScheme = {
    suggestions: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      icon: "text-amber-600",
      hover: "hover:bg-amber-100"
    },
    python: {
      bg: "bg-green-50",
      border: "border-green-200", 
      text: "text-green-800",
      icon: "text-green-600",
      hover: "hover:bg-green-100"
    },
    java: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      text: "text-orange-800", 
      icon: "text-orange-600",
      hover: "hover:bg-orange-100"
    },
    c: {
      bg: "bg-purple-50",
      border: "border-purple-200",
      text: "text-purple-800",
      icon: "text-purple-600", 
      hover: "hover:bg-purple-100"
    },
    cpp: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-800",
      icon: "text-indigo-600",
      hover: "hover:bg-indigo-100"
    },
    complexity: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-600",
      hover: "hover:bg-red-100"
    },
    links: {
      bg: "bg-blue-50", 
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-600",
      hover: "hover:bg-blue-100"
    }
  };

  const sanitizeAIText = (text) => {
    return text.replace(/<think>/gi, '').replace(/<\/think>/gi, '').trim();
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  

 const parseAIResponse = (response) => {
    const sections = {
        suggestions: "",
        python: "",
        java: "",
        c: "",
        cpp: "",
        complexity: "",
        links: ""
    };

    if (!response || typeof response !== 'string') {
        return sections;
    }

    // Extract content between markers
    const extractSection = (startMarker, endMarker) => {
        const regex = new RegExp(`\\[${startMarker}_START\\](.*?)\\[${startMarker}_END\\]`, 'gis');
        const match = response.match(regex);
        return match ? match[0].replace(`[${startMarker}_START]`, '').replace(`[${startMarker}_END]`, '').trim() : '';
    };

    sections.suggestions = extractSection('SUGGESTIONS', 'SUGGESTIONS');
    sections.python = extractSection('PYTHON', 'PYTHON');
    sections.java = extractSection('JAVA', 'JAVA');
    sections.c = extractSection('C', 'C');
    sections.cpp = extractSection('CPP', 'CPP');
    sections.complexity = extractSection('COMPLEXITY', 'COMPLEXITY');
    sections.links = extractSection('LINKS', 'LINKS');

    return sections;
};

  const CodeBlock = ({ code, language = "python" }) => (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2">
        <span className="text-gray-300 text-sm font-medium">{language.toUpperCase()}</span>
        <button
          onClick={() => copyToClipboard(code)}
          className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm transition-colors"
          title="Copy code"
        >
          <Copy size={14} />
          Copy
        </button>
      </div>
      <CodeMirror
        value={code.trim()}
        readOnly={true}
        extensions={[python()]}
        basicSetup={{ 
          lineNumbers: true,
          foldGutter: false,
          searchKeymap: false
        }}
        theme="dark"
        className="text-sm"
      />
    </div>
  );

  // Enhanced Learning Resources Component with FUNCTIONAL LINKS
  const LearningResourcesSection = ({ content }) => {
    // Function to extract and validate URLs from text
    const extractUrl = (text) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const match = text.match(urlRegex);
      return match ? match[0] : null;
    };

    // Function to generate fallback URLs for common resources
    const getFallbackUrl = (title, type) => {
      const lowerTitle = title.toLowerCase();
      
      if (lowerTitle.includes('python') && lowerTitle.includes('documentation')) {
        return 'https://docs.python.org/3/';
      } else if (lowerTitle.includes('java') && lowerTitle.includes('documentation')) {
        return 'https://docs.oracle.com/en/java/';
      } else if (lowerTitle.includes('tutorial') && lowerTitle.includes('python')) {
        return 'https://www.python.org/about/gettingstarted/';
      } else if (lowerTitle.includes('practice') || lowerTitle.includes('exercise')) {
        return 'https://leetcode.com/';
      } else if (lowerTitle.includes('algorithm') || lowerTitle.includes('data structure')) {
        return 'https://www.geeksforgeeks.org/';
      } else {
        return `https://www.google.com/search?q=${encodeURIComponent(title)}`;
      }
    };

    const parseLinks = (text) => {
      const links = [];
      const lines = text.split('\n');
      
      lines.forEach(line => {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          let url = extractUrl(trimmedLine);
          let linkText = trimmedLine.replace(/(https?:\/\/[^\s]+)/g, '').trim();
          
          // If no URL found, generate appropriate fallback
          if (!url) {
            linkText = trimmedLine;
          }
          
          // Categorize the link
          let linkData = {
            title: linkText || trimmedLine,
            url: url,
            type: 'general',
            icon: Globe,
            color: 'text-gray-600 bg-gray-100'
          };

          if (trimmedLine.toLowerCase().includes('documentation') || 
              trimmedLine.toLowerCase().includes('docs')) {
            linkData = {
              ...linkData,
              type: 'documentation',
              icon: FileCode,
              color: 'text-blue-600 bg-blue-100',
              url: url || getFallbackUrl(trimmedLine, 'documentation')
            };
          } else if (trimmedLine.toLowerCase().includes('tutorial') || 
                    trimmedLine.toLowerCase().includes('course')) {
            linkData = {
              ...linkData,
              type: 'tutorial',
              icon: Play,
              color: 'text-green-600 bg-green-100',
              url: url || getFallbackUrl(trimmedLine, 'tutorial')
            };
          } else if (trimmedLine.toLowerCase().includes('practice') || 
                    trimmedLine.toLowerCase().includes('exercise')) {
            linkData = {
              ...linkData,
              type: 'practice',
              icon: Award,
              color: 'text-purple-600 bg-purple-100',
              url: url || getFallbackUrl(trimmedLine, 'practice')
            };
          } else if (trimmedLine.toLowerCase().includes('reference') || 
                    trimmedLine.toLowerCase().includes('guide')) {
            linkData = {
              ...linkData,
              type: 'reference',
              icon: BookOpen,
              color: 'text-orange-600 bg-orange-100',
              url: url || getFallbackUrl(trimmedLine, 'reference')
            };
          } else {
            linkData.url = url || getFallbackUrl(trimmedLine, 'general');
          }
          
          links.push(linkData);
        }
      });
      
      return links;
    };

    const links = parseLinks(content);

    // Function to handle link clicks
    const handleLinkClick = (url, title) => {
      if (url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        console.warn(`No URL available for: ${title}`);
      }
    };

    return (
      <div className="space-y-4">
        <div className="grid gap-3">
          {links.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <div 
                key={index}
                onClick={() => handleLinkClick(link.url, link.title)}
                className="group flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
              >
                <div className={`p-2 rounded-lg ${link.color} group-hover:scale-110 transition-transform duration-200`}>
                  <IconComponent size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                    {link.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500 capitalize">{link.type}</span>
                    <ExternalLink size={12} className="text-gray-400 group-hover:text-blue-500" />
                    {link.url && (
                      <span className="text-xs text-blue-500 truncate max-w-32">
                        {link.url.replace('https://', '').replace('http://', '').split('/')[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {links.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No specific learning resources found in the AI response</p>
          </div>
        )}
        
        {/* Curated resources with WORKING LINKS */}
        <div className="border-t border-gray-200 pt-4 mt-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Star size={16} className="text-yellow-500" />
            Recommended Resources
          </h4>
          <div className="grid gap-2">
            <div 
              onClick={() => handleLinkClick('https://docs.python.org/3/', 'Python Official Documentation')}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 cursor-pointer hover:shadow-md transition-all"
            >
              <FileCode size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Python Official Documentation</span>
              <ExternalLink size={12} className="text-blue-500 ml-auto" />
            </div>
            <div 
              onClick={() => handleLinkClick('https://www.learnpython.org/', 'Interactive Python Tutorial')}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 cursor-pointer hover:shadow-md transition-all"
            >
              <Play size={16} className="text-green-600" />
              <span className="text-sm font-medium text-green-800">Interactive Python Tutorial</span>
              <ExternalLink size={12} className="text-green-500 ml-auto" />
            </div>
            <div 
              onClick={() => handleLinkClick('https://leetcode.com/', 'Coding Practice Platform')}
              className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg border border-purple-100 cursor-pointer hover:shadow-md transition-all"
            >
              <Award size={16} className="text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Coding Practice Platform</span>
              <ExternalLink size={12} className="text-purple-500 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CollapsibleSection = ({ 
    title, 
    children, 
    sectionKey, 
    icon: Icon 
  }) => {
    const colors = colorScheme[sectionKey];
    const isExpanded = expandedSections[sectionKey];
    
    return (
      <div className={`${colors.border} border-2 rounded-lg overflow-hidden mb-4 transition-all duration-200`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full px-6 py-4 ${colors.bg} ${colors.hover} flex items-center justify-between transition-colors duration-200`}
        >
          <div className="flex items-center gap-3">
            <Icon size={22} className={colors.icon} />
            <h3 className={`font-semibold text-lg ${colors.text}`}>{title}</h3>
          </div>
          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={20} className={colors.icon} />
          </div>
        </button>
        
        <div className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="p-6 bg-white border-t-2 border-gray-100">
            {children}
          </div>
        </div>
      </div>
    );
  };

  const reviewCode = async () => {
    if (!code.trim()) {
      setError("Please enter some code to review");
      return;
    }

    setIsLoading(true);
    setError("");
    setReview("");
    
    try {
      const response = await fetch("http://localhost:3000/ai/get-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get code review");
      }

      const data = await response.json();
      setReview(sanitizeAIText(data.review));
    } catch (err) {
      setError(err.message || "Failed to get code review");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 1000000) { // 1MB limit
      const reader = new FileReader();
      reader.onload = (e) => setCode(e.target.result);
      reader.readAsText(file);
    } else if (file) {
      setError("File size must be less than 1MB");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    }).catch(() => {
      setError("Failed to copy to clipboard");
    });
  };

  const parsedResponse = review ? parseAIResponse(review) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 tracking-tight">AI Code Assistant</h1>
          </div>
          <p className="text-gray-600 text-lg">Powered by Groq - Get intelligent code reviews</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Code Editor Section */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Code className="text-white" size={22} />
                <span className="text-white font-semibold text-lg">Code Editor</span>
              </div>
              
              <div className="flex gap-3">
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 transition-colors duration-200 font-medium">
                  <Upload size={18} />
                  Upload File
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".py,.js,.java,.c,.cpp,.txt" 
                    onChange={handleFileUpload} 
                  />
                </label>
                
                <button
                  onClick={reviewCode}
                  disabled={isLoading || !code.trim()}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium min-w-[120px]"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Review Code
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="border-b border-gray-200">
              <CodeMirror
                value={code}
                height="450px"
                extensions={[python()]}
                onChange={(val) => setCode(val)}
                basicSetup={{ 
                  lineNumbers: true,
                  foldGutter: true,
                  searchKeymap: true
                }}
                theme="dark"
              />
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-t-2 border-red-200 flex items-center gap-3 text-red-700">
                <AlertCircle size={20} className="flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}
          </div>

          {/* AI Review Section */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-6 py-4">
              <div className="flex items-center gap-3">
                <Bot className="text-white" size={22} />
                <span className="text-white font-semibold text-lg">AI Code Review</span>
                {review && (
                  <div className="ml-auto flex items-center gap-2 text-white text-sm">
                    <Activity size={16} />
                    <span>Analysis Complete</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 max-h-[650px] overflow-y-auto">
              {parsedResponse ? (
                <div className="space-y-6">
                  {/* Suggestions Section */}
                  {parsedResponse.suggestions && (
                    <CollapsibleSection
                      title="Code Improvements & Suggestions"
                      sectionKey="suggestions"
                      icon={Lightbulb}
                    >
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-mono">
                          {parsedResponse.suggestions}
                        </pre>
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Python Code Section */}
                  {parsedResponse.python && (
                    <CollapsibleSection
                      title="Improved Python Implementation"
                      sectionKey="python"
                      icon={FileCode}
                    >
                      <CodeBlock code={parsedResponse.python} language="python" />
                    </CollapsibleSection>
                  )}

                  {/* Java Code Section */}
                  {parsedResponse.java && (
                    <CollapsibleSection
                      title="Java Implementation"
                      sectionKey="java"
                      icon={FileCode}
                    >
                      <CodeBlock code={parsedResponse.java} language="java" />
                    </CollapsibleSection>
                  )}

                  {/* C Code Section */}
                  {parsedResponse.c && (
                    <CollapsibleSection
                      title="C Implementation"
                      sectionKey="c"
                      icon={FileCode}
                    >
                      <CodeBlock code={parsedResponse.c} language="c" />
                    </CollapsibleSection>
                  )}

                  {/* C++ Code Section */}
                  {parsedResponse.cpp && (
                    <CollapsibleSection
                      title="C++ Implementation"
                      sectionKey="cpp"
                      icon={FileCode}
                    >
                      <CodeBlock code={parsedResponse.cpp} language="cpp" />
                    </CollapsibleSection>
                  )}

                  {/* Complexity Analysis */}
                  {parsedResponse.complexity && (
                    <CollapsibleSection
                      title="Performance Analysis"
                      sectionKey="complexity"
                      icon={Zap}
                    >
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <Clock size={18} className="text-red-600" />
                          <span className="font-semibold text-red-800">Time & Space Complexity</span>
                        </div>
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed text-gray-800 font-mono">
                          {parsedResponse.complexity}
                        </pre>
                      </div>
                    </CollapsibleSection>
                  )}

                  {/* Fixed Learning Links Section */}
                  {parsedResponse.links && (
                    <CollapsibleSection
                      title="Learning Resources & References"
                      sectionKey="links"
                      icon={BookOpen}
                    >
                      <LearningResourcesSection content={parsedResponse.links} />
                    </CollapsibleSection>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <div className="mb-6">
                    <Bot size={64} className="mx-auto text-gray-300" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-600">Ready for Code Review</h3>
                  <p className="text-gray-500 mb-1">Your AI-powered analysis will appear here</p>
                  <p className="text-sm text-gray-400">Upload code or paste it in the editor, then click Review Code</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
