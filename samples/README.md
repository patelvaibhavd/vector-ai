# Sample Files for Testing Vector AI

This folder contains sample documents and questions for testing the Vector AI application.

## 📁 Files Included

| File | Description |
|------|-------------|
| `sample-document.txt` | Plain text version of the sample document |
| `sample-document.html` | HTML version (open in browser, print to PDF) |
| `SAMPLE_QUESTIONS.md` | 30+ test questions with expected answers |

## 🚀 Quick Start

### Step 1: Create PDF

**Option A: From HTML (Recommended)**
1. Open `sample-document.html` in your browser
2. Press `Ctrl+P` (or `Cmd+P` on Mac)
3. Select "Save as PDF"
4. Save as `sample-document.pdf`

**Option B: From Text**
1. Open `sample-document.txt` in any text editor
2. Print/Export as PDF
3. Or use online converter: [iLovePDF](https://www.ilovepdf.com/txt_to_pdf)

### Step 2: Upload to Vector AI

1. Start the backend: `npm run dev`
2. Start the frontend: `cd frontend && npm start`
3. Open http://localhost:4200
4. Drag & drop the PDF file

### Step 3: Test with Questions

**Option A: Use the UI (Recommended)** 🎯
1. In the "Ask Questions" section, click **"Sample Questions"** button
2. Browse questions by difficulty (Easy, Medium, Complex)
3. Click any question to auto-fill and search

**Option B: Manual Testing**
Open `SAMPLE_QUESTIONS.md` and try questions like:

```
Who founded TechVision Innovations?
What was the total revenue in 2024?
How many employees does TechVision have?
What is the company's recycling rate?
```

## 📋 Sample Questions Preview

### Easy Questions
- Who founded TechVision Innovations?
- What is the total revenue in 2024?
- How many employees work at TechVision?

### Medium Questions  
- What percentage of revenue comes from Cloud Services?
- How many languages does AI Assistant Pro support?
- What is the employee satisfaction score?

### Complex Questions
- Compare the revenue from different product segments
- What are the company's sustainability goals?
- Summarize the 2025 strategic priorities

## 📄 Document Content Overview

The sample document is a **fictional company annual report** containing:

- Company overview and history
- Financial data (revenue, profits, ratios)
- Product descriptions (4 products)
- R&D information and patents
- Customer case studies
- Employee statistics and benefits
- Sustainability initiatives
- Future outlook and projections
- Board of directors information
- Contact details

**Total content:** ~3,000 words with varied factual information perfect for RAG testing.

## ✅ Expected Results

When properly indexed, Vector AI should:
- Find specific facts (names, numbers, dates)
- Locate relevant sections for topical questions
- Provide context-aware answers (with Groq/Gemini/OpenAI)
- Return extractive answers (with local mode)

---

Happy Testing! 🎉

