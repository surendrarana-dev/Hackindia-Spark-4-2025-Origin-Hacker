const fs = require('fs').promises;
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const natural = require('natural');
const OpenAI = require('openai');

// Initialize NLP tools
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const stemmer = natural.PorterStemmer;

// Initialize OpenAI (if API key is provided)
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Common skills for detection
const commonSkills = [
  // Programming Languages
  'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'go', 'rust',
  'typescript', 'scala', 'perl', 'r', 'matlab', 'bash', 'shell', 'powershell',
  
  // Web Technologies
  'html', 'css', 'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
  'asp.net', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less', 'webpack', 'babel', 'graphql',
  'rest', 'soap', 'json', 'xml', 'ajax',
  
  // Databases
  'sql', 'mysql', 'postgresql', 'mongodb', 'oracle', 'sqlite', 'redis', 'cassandra', 'dynamodb',
  'firebase', 'elasticsearch', 'mariadb', 'neo4j', 'couchdb',
  
  // Cloud & DevOps
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'circleci', 'travis', 'terraform',
  'ansible', 'puppet', 'chef', 'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence',
  
  // AI & Data Science
  'machine learning', 'deep learning', 'ai', 'data science', 'tensorflow', 'pytorch', 'keras',
  'scikit-learn', 'pandas', 'numpy', 'scipy', 'hadoop', 'spark', 'tableau', 'power bi', 'nlp',
  
  // Soft Skills
  'leadership', 'communication', 'teamwork', 'problem-solving', 'critical thinking', 'time management',
  'creativity', 'adaptability', 'collaboration', 'project management', 'agile', 'scrum', 'kanban'
];

// Extract text from PDF
async function extractTextFromPDF(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

// Extract text from DOCX
async function extractTextFromDOCX(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to extract text from DOCX');
  }
}

// Extract text from TXT
async function extractTextFromTXT(filePath) {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error) {
    console.error('Error extracting text from TXT:', error);
    throw new Error('Failed to extract text from TXT');
  }
}

// Extract skills from text
function extractSkills(text) {
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const stemmedTokens = tokens.map(token => stemmer.stem(token));
  
  const tfidf = new TfIdf();
  tfidf.addDocument(tokens);
  
  const skills = new Set();
  
  // Check for skills in the text
  commonSkills.forEach(skill => {
    const skillWords = skill.toLowerCase().split(' ');
    
    // For multi-word skills
    if (skillWords.length > 1) {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        skills.add(skill);
      }
    } 
    // For single-word skills
    else {
      const stemmedSkill = stemmer.stem(skill);
      if (stemmedTokens.includes(stemmedSkill) || tokens.includes(skill)) {
        skills.add(skill);
      }
    }
  });
  
  return Array.from(skills);
}

// Extract experience details
function extractExperience(text) {
  // Basic experience extraction
  const experienceSection = extractSectionContent(text, ['experience', 'work experience', 'professional experience']);
  const educationSection = extractSectionContent(text, ['education', 'academic background', 'academic experience']);
  
  // Identify strengths and weaknesses
  const strengths = [];
  const weaknesses = [];
  
  // Check for quantifiable achievements
  if (/\d+%|\d+ years|increased|decreased|improved|reduced|lead|managed|developed/i.test(experienceSection)) {
    strengths.push("Quantified achievements with metrics");
  } else {
    weaknesses.push("Lacks quantifiable achievements");
  }
  
  // Check for technology mentions
  if (/using|utilized|implemented|developed with|built with/i.test(experienceSection)) {
    strengths.push("Clear description of technologies used in roles");
  } else {
    weaknesses.push("Technology usage not clearly described");
  }
  
  // Check for progression
  if (/promoted|advanced|progressed|senior|lead|manager/i.test(experienceSection)) {
    strengths.push("Shows career progression");
  }
  
  // Check for gaps (very basic)
  if (/2020|2021|2022|2023/.test(text) && /2017|2018|2019/.test(text)) {
    // No obvious gaps in recent years
  } else {
    weaknesses.push("Potential time gaps in experience");
  }
  
  return {
    strengths,
    weaknesses
  };
}

// Extract a specific section's content
function extractSectionContent(text, sectionHeaders) {
  const lines = text.split('\n');
  let inSection = false;
  let sectionContent = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim().toLowerCase();
    
    // Check if this line starts a section we're looking for
    if (!inSection) {
      for (const header of sectionHeaders) {
        if (line.includes(header) && (line.length < header.length + 10)) {
          inSection = true;
          break;
        }
      }
    } 
    // Check if we're leaving the current section (another section starts)
    else if (line.length > 0 && line.length < 30 && 
             /^[a-z\s]+:?$/.test(line) && 
             !sectionHeaders.some(header => line.includes(header))) {
      break;
    } 
    // Add content if we're in the right section
    else if (inSection && line.length > 0) {
      sectionContent += line + ' ';
    }
  }
  
  return sectionContent;
}

// Generate improvement suggestions
function generateSuggestions(text, skills, experience) {
  const suggestions = [];
  
  // Check for quantifiable achievements
  if (!text.match(/increased|decreased|improved|reduced|by \d+%|\d+ percent/gi)) {
    suggestions.push("Add more quantifiable achievements to demonstrate impact");
  }
  
  // Check for certifications
  if (!text.match(/certified|certification|certificate|exam|qualified/gi)) {
    suggestions.push("Include relevant certifications to strengthen technical credentials");
  }
  
  // Check for leadership
  if (skills.includes('leadership') && !text.match(/lead|led|managed|supervised|directed|oversaw|team/gi)) {
    suggestions.push("Elaborate on leadership experience with specific examples");
  }
  
  // Check for summary/objective
  if (!text.match(/^.*?(summary|objective|profile|about me).*?$/mi)) {
    suggestions.push("Consider adding a brief personal statement at the top");
  }
  
  // Always suggest tailoring
  suggestions.push("Tailor skills section to match the job description more closely");
  
  return suggestions;
}

// AI-powered analysis using OpenAI (if available)
async function aiAnalysis(text) {
  if (!openai) {
    return null; // Skip if OpenAI is not configured
  }
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a professional resume analyzer. Analyze the following resume text and provide a concise summary, key skills identified, experience analysis (strengths and weaknesses), and improvement suggestions."
        },
        {
          role: "user",
          content: `Here is the resume text to analyze:\n\n${text.substring(0, 4000)}`  // Limit text length
        }
      ],
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    console.error('Error with AI analysis:', error);
    return null; // Return null to fall back to rule-based analysis
  }
}

// Main function to analyze resume
async function analyzeResume(filePath, fileExtension) {
  try {
    // Extract text based on file type
    let text;
    
    switch (fileExtension) {
      case '.pdf':
        text = await extractTextFromPDF(filePath);
        break;
      case '.docx':
      case '.doc':
        text = await extractTextFromDOCX(filePath);
        break;
      case '.txt':
        text = await extractTextFromTXT(filePath);
        break;
      default:
        throw new Error('Unsupported file type');
    }
    
    // Try AI analysis first (if configured)
    const aiResult = await aiAnalysis(text);
    
    if (aiResult) {
      return aiResult;
    }
    
    // Fallback to rule-based analysis
    const skills = extractSkills(text);
    const experience = extractExperience(text);
    const suggestions = generateSuggestions(text, skills, experience);
    
    // Create a summary using basic NLP
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const importantSentences = sentences
      .filter(s => /experience|skill|education|project|achievement/i.test(s))
      .slice(0, 3);
    
    const summary = importantSentences.join(' ').substring(0, 300) + 
      "... Resume shows " + skills.length + " key skills and " + 
      (experience.strengths.length > experience.weaknesses.length ? 
        "strong" : "some") + " professional experience.";
    
    return {
      summary,
      skills,
      experience,
      suggestions
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}

module.exports = {
  analyzeResume
}; 