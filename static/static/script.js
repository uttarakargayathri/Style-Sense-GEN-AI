document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const previewContainer = document.getElementById('preview-container');
    const imagePreview = document.getElementById('image-preview');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resetBtn = document.getElementById('reset-btn');
    const resultsSection = document.getElementById('results-section');
    const analysisContent = document.getElementById('analysis-content');
    const loader = document.getElementById('loader');

    let currentFile = null;

    // Drag and Drop handlers
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        currentFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
            dropZone.classList.add('hidden');
            previewContainer.classList.remove('hidden');
            resultsSection.classList.add('hidden');
            analysisContent.innerHTML = '';
        };
        reader.readAsDataURL(file);
    }

    resetBtn.addEventListener('click', () => {
        currentFile = null;
        fileInput.value = '';
        previewContainer.classList.add('hidden');
        dropZone.classList.remove('hidden');
        resultsSection.classList.add('hidden');
    });

    analyzeBtn.addEventListener('click', async () => {
        if (!currentFile) return;

        // Show Loader
        resultsSection.classList.remove('hidden');
        loader.classList.remove('hidden');
        analysisContent.classList.add('hidden');

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        const formData = new FormData();
        formData.append('file', currentFile);

        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Analysis failed');
            }

            const data = await response.json();

            // Render basic markdown (or plain text if simple)
            // Using marked.js if available, else plain text
            const htmlContent = window.marked ? marked.parse(data.analysis) : data.analysis;

            loader.classList.add('hidden');
            analysisContent.classList.remove('hidden');
            analysisContent.innerHTML = htmlContent;

        } catch (error) {
            console.error(error);
            loader.classList.add('hidden');
            analysisContent.classList.remove('hidden');
            analysisContent.innerHTML = `<p style="color: #f87171;">Error: ${error.message}. Please try again.</p>`;
        }
    });
});
