document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const uploadBox = document.getElementById('upload-box');
    const fileInput = document.getElementById('file-input');
    const fileInfo = document.getElementById('file-info');
    const analyzeBtn = document.getElementById('analyze-btn');
    const analysisSection = document.getElementById('analysis-section');
    const loader = document.getElementById('loader');
    const results = document.getElementById('results');
    const newAnalysisBtn = document.getElementById('new-analysis-btn');
    
    // Result content elements
    const summaryResult = document.getElementById('summary-result');
    const skillsResult = document.getElementById('skills-result');
    const experienceResult = document.getElementById('experience-result');
    const suggestionsResult = document.getElementById('suggestions-result');
    
    let selectedFile = null;
    
    // Event Listeners
    uploadBox.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    uploadBox.addEventListener('dragover', handleDragOver);
    uploadBox.addEventListener('dragleave', handleDragLeave);
    uploadBox.addEventListener('drop', handleDrop);
    analyzeBtn.addEventListener('click', analyzeResume);
    newAnalysisBtn.addEventListener('click', resetAnalyzer);
    
    // Handle file selection via the file input
    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            validateAndProcessFile(file);
        }
    }
    
    // Handle drag over effect
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.add('dragover');
    }
    
    // Handle drag leave effect
    function handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('dragover');
    }
    
    // Handle file drop
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        uploadBox.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            validateAndProcessFile(file);
        }
    }
    
    // Validate the file type and size
    function validateAndProcessFile(file) {
        const validTypes = ['.pdf', '.docx', '.doc', '.txt'];
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(fileExtension)) {
            fileInfo.textContent = 'Error: Invalid file type. Please upload PDF, DOCX, DOC, or TXT file.';
            fileInfo.style.color = '#e74c3c';
            analyzeBtn.disabled = true;
            return;
        }
        
        if (file.size > maxSize) {
            fileInfo.textContent = 'Error: File size exceeds 5MB. Please upload a smaller file.';
            fileInfo.style.color = '#e74c3c';
            analyzeBtn.disabled = true;
            return;
        }
        
        // Valid file
        selectedFile = file;
        fileInfo.textContent = `File selected: ${file.name}`;
        fileInfo.style.color = '#2ecc71';
        analyzeBtn.disabled = false;
    }
    
    // Analyze the resume
    async function analyzeResume() {
        if (!selectedFile) return;
        
        // Show analysis section and loader
        analysisSection.style.display = 'block';
        loader.style.display = 'flex';
        results.style.display = 'none';
        
        // Scroll to analysis section
        analysisSection.scrollIntoView({ behavior: 'smooth' });
        
        try {
            // Create form data for file upload
            const formData = new FormData();
            formData.append('resume', selectedFile);
            
            // Call backend API
            const response = await fetch('/api/resume/analyze', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Server responded with an error');
            }
            
            const analysisData = await response.json();
            
            // Hide loader and show results
            loader.style.display = 'none';
            results.style.display = 'block';
            
            // Display the analysis results
            displayResults(analysisData);
        } catch (error) {
            console.error('Error analyzing resume:', error);
            
            // Show error message in results
            loader.style.display = 'none';
            results.style.display = 'block';
            
            // Display fallback results with error message
            displayErrorResults();
        }
    }
    
    // Display error results when API fails
    function displayErrorResults() {
        summaryResult.innerHTML = '<p class="error-message">Sorry, we encountered an error analyzing your resume. Please try again later.</p>';
        skillsResult.innerHTML = '<p class="error-message">Unable to extract skills.</p>';
        experienceResult.innerHTML = '<p class="error-message">Unable to analyze experience.</p>';
        suggestionsResult.innerHTML = '<p class="error-message">Unable to generate suggestions.</p>';
    }
    
    // Display the analysis results
    function displayResults(analysis) {
        // Display summary
        summaryResult.textContent = analysis.summary;
        
        // Display skills
        skillsResult.innerHTML = '';
        analysis.skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.textContent = skill;
            skillsResult.appendChild(skillTag);
        });
        
        // Display experience analysis
        experienceResult.innerHTML = '<h4>Strengths:</h4><ul>';
        analysis.experience.strengths.forEach(strength => {
            experienceResult.innerHTML += `<li>${strength}</li>`;
        });
        experienceResult.innerHTML += '</ul><h4>Areas for Improvement:</h4><ul>';
        analysis.experience.weaknesses.forEach(weakness => {
            experienceResult.innerHTML += `<li>${weakness}</li>`;
        });
        experienceResult.innerHTML += '</ul>';
        
        // Display suggestions
        suggestionsResult.innerHTML = '';
        analysis.suggestions.forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = suggestion;
            suggestionsResult.appendChild(suggestionItem);
        });
    }
    
    // Reset the analyzer for a new resume
    function resetAnalyzer() {
        // Reset file selection
        selectedFile = null;
        fileInput.value = '';
        fileInfo.textContent = 'Supported formats: PDF, DOCX, DOC, TXT (Max size: 5MB)';
        fileInfo.style.color = '#7f8c8d';
        analyzeBtn.disabled = true;
        
        // Hide analysis section
        analysisSection.style.display = 'none';
        
        // Scroll to upload section
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
}); 