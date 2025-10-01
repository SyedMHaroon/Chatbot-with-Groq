# Research Assistant - FastAPI + React

A full-stack research assistant application that combines FastAPI backend with React frontend to provide intelligent research capabilities using LangChain and Groq AI.

## 🚀 Features

### Core Functionalities
- **Intelligent Research**: AI-powered research assistant using Groq's Llama model
- **Web Search Integration**: DuckDuckGo search capabilities for real-time information
- **Wikipedia Integration**: Access to Wikipedia articles for comprehensive research
- **Structured Output**: Returns organized research data with topic, summary, sources, and tools used
- **Real-time Chat Interface**: Interactive React-based chat UI
- **CORS-enabled API**: Cross-origin requests supported for frontend-backend communication

### Technical Features
- **FastAPI Backend**: High-performance async API with automatic documentation
- **React Frontend**: Modern, responsive UI with Tailwind CSS styling
- **Pydantic Models**: Type-safe data validation and serialization
- **LangChain Integration**: Advanced AI agent orchestration
- **Tool Calling**: Extensible tool system for different research methods
- **Error Handling**: Comprehensive error handling with debug logging

## 🛠️ Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Modern, fast web framework
- **LangChain** - AI application framework
- **LangChain-Groq** - Groq AI integration
- **Pydantic** - Data validation
- **Uvicorn** - ASGI server
- **Python-dotenv** - Environment variable management

### Frontend
- **React 18** - UI library
- **JavaScript (ES6+)** - Programming language
- **Tailwind CSS** - Utility-first CSS framework
- **Fetch API** - HTTP client

### AI & Tools
- **Groq AI (Llama 3.1 8B)** - Language model
- **DuckDuckGo Search** - Web search tool
- **Wikipedia API** - Knowledge base access

## 📋 Prerequisites

- Python 3.11 or higher
- Node.js 16 or higher
- npm or yarn package manager
- Groq API key (get from [Groq Console](https://console.groq.com/))

## 🔧 Environment Setup

### 1. Clone and Navigate
```bash
git clone <your-repo-url>
cd Fast2
```

### 2. Backend Setup

#### Install Python Dependencies
```bash
pip install -r requirements.txt
```

#### Environment Variables
Create a `.env` file in the project root:
```env
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Frontend Setup

#### Install Node Dependencies
```bash
npm install
```

## 🚀 Running the Application

### Start Backend Server
```bash
# Option 1: Using uvicorn directly (if in PATH)
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Option 2: Using Python module (recommended)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API Base**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

### Start Frontend Development Server
```bash
npm start
```

The React app will be available at: http://localhost:3000

## 📖 How to Use

### 1. Basic Usage
1. Start both backend and frontend servers
2. Open http://localhost:3000 in your browser
3. Type a research topic in the input field
4. Press Enter or click "Send"
5. View the structured research response

### 2. API Endpoints

#### POST `/research`
Research a topic and get structured results.

**Request:**
```json
{
  "query": "What is the capital of France?"
}
```

**Response:**
```json
{
  "topic": "Capital of France",
  "summary": "The capital of France is Paris...",
  "sources": ["Wikipedia", "Britannica"],
  "tool_used": "Google Search"
}
```

#### GET `/`
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Research Agent API running"
}
```

### 3. Frontend Features
- **Real-time Chat**: Interactive conversation interface
- **Auto-scroll**: Messages automatically scroll to bottom
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on desktop and mobile

## 🎨 Customization

### Backend Customization

#### 1. Modify AI Model
Edit `main.py` to change the Groq model:
```python
llm = ChatGroq(
    model="llama-3.1-70b-versatile",  # Change model here
    temperature=0.0,
)
```

#### 2. Add New Tools
Create tools in `tools.py` and add to the tools list:
```python
# In main.py
tools = [search_tool, wiki_tool, your_new_tool]
```

#### 3. Customize Research Prompt
Modify the system prompt in `main.py`:
```python
prompt = ChatPromptTemplate.from_messages([
    ("system", "Your custom research instructions here..."),
    # ... rest of the template
])
```

#### 4. Change Response Structure
Update the `ResearchResponse` model in `main.py`:
```python
class ResearchResponse(BaseModel):
    topic: str
    summary: str
    sources: list[str]
    tool_used: str
    confidence_score: float  # Add new fields
    related_topics: list[str]
```

### Frontend Customization

#### 1. Styling
The app uses Tailwind CSS. Modify classes in `src/App.js`:
```jsx
// Change colors, spacing, etc.
<div className="bg-blue-500 text-white">  // Customize here
```

#### 2. API Endpoint
Change the API URL in `src/App.js`:
```javascript
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";
```

#### 3. UI Components
- Modify the chat interface layout
- Add new input types (file upload, voice, etc.)
- Customize message rendering
- Add user authentication

#### 4. Environment Variables
Create `.env` file in the React app root:
```env
REACT_APP_API_URL=http://your-api-url:8000
```

### Advanced Customization

#### 1. Add Authentication
- Implement JWT tokens in FastAPI
- Add login/logout in React
- Protect API endpoints

#### 2. Database Integration
- Add SQLAlchemy for data persistence
- Store research history
- User management

#### 3. Additional AI Features
- Image analysis
- Document processing
- Multi-language support
- Voice input/output

#### 4. Deployment
- Docker containerization
- Cloud deployment (AWS, GCP, Azure)
- CI/CD pipeline setup

## 🐛 Troubleshooting

### Common Issues

#### 1. "uvicorn not recognized"
```bash
# Use Python module instead
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 2. CORS Errors
Ensure CORS middleware is properly configured in `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 3. Groq API Key Issues
- Verify your API key in `.env` file
- Check Groq API quota and limits
- Ensure the key has proper permissions

#### 4. React Build Errors
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript syntax in `.js` files

#### 5. Port Conflicts
- Backend: Change port in uvicorn command
- Frontend: React will automatically suggest alternative ports

## 📁 Project Structure

```
Fast2/
├── main.py                 # FastAPI application
├── tools.py               # LangChain tools (search, wiki)
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
├── package.json          # Node.js dependencies
├── public/
│   └── index.html        # HTML template
├── src/
│   ├── App.js            # Main React component
│   └── index.js          # React entry point
└── README.md             # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the API documentation at http://localhost:8000/docs
3. Open an issue on GitHub
4. Check Groq documentation for AI model specifics

---

**Happy Researching! 🔬✨**
