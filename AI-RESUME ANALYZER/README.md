# AI Resume Analyzer

A full-stack application that analyzes resumes using AI and natural language processing techniques. Upload your resume and get instant feedback on your skills, experience, and suggestions for improvement.

## Features

- Support for PDF, DOCX, DOC, and TXT file formats
- Drag and drop file upload
- Advanced text extraction and analysis
- Skill detection based on industry keywords
- Experience analysis and evaluation
- Personalized improvement suggestions
- Responsive design for all devices
- Optional OpenAI GPT integration for enhanced analysis

## Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express
- **Libraries**:
  - PDF parsing: pdf-parse
  - DOCX parsing: mammoth
  - NLP: natural (Node.js NLP library)
  - Optional AI: OpenAI API

## Setup and Installation

### Prerequisites

- Node.js (v14+ recommended)
- npm (comes with Node.js)

### Installation Steps

1. Clone the repository:
   ```
   git clone <repository-url>
   cd ai-resume-analyzer
   ```

2. Install backend dependencies:
   ```
   cd backend
   npm install
   ```

3. Configure environment variables:
   - Rename `.env.example` to `.env` (or create a new `.env` file)
   - Optional: Add your OpenAI API key if you want enhanced AI analysis

4. Start the server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5000`

## API Endpoints

- **POST /api/resume/analyze**: Upload and analyze a resume
  - Request: Form data with 'resume' file
  - Response: JSON with analysis results

## How It Works

1. **Text Extraction**: Extracts plain text from uploaded resume documents
2. **Skill Analysis**: Identifies skills by matching against a curated list of technical and soft skills
3. **Experience Analysis**: Evaluates career history and identifies strengths and weaknesses
4. **Summary Generation**: Generates an overall summary of the resume
5. **Suggestion Creation**: Creates personalized improvement suggestions

## License

MIT License

## Author

Surendra Rana
