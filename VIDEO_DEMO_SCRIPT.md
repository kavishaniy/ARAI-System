# ARAI System - Video Demonstration Script (5-10 minutes)

## Project: AI-Powered UX Design Critique System
**Duration:** 8-10 minutes  
**Presenter:** [Your Name]

---

## 📋 SCRIPT OUTLINE

### **SEGMENT 1: INTRODUCTION (1 minute)**

**[Screen: Show project title slide or homepage]**

**Voice-over:**

> "Hello! My name is [Your Name], and today I'm excited to demonstrate ARAI - an AI-Powered UX Design Critique system that I've developed for my final year project.
>
> ARAI stands for Accessibility, Readability, and Attention Index. It's a comprehensive web application that uses artificial intelligence to automatically evaluate user interface designs across three critical dimensions: accessibility compliance, readability metrics, and visual attention prediction.
>
> The goal of this project is to help designers identify potential usability issues early in the design process, ensuring that digital products are accessible, readable, and effectively guide user attention.
>
> Let me walk you through the key features I've implemented so far."

---

### **SEGMENT 2: SYSTEM ARCHITECTURE & TECHNOLOGY STACK (1 minute)**

**[Screen: Show project folder structure or architecture diagram if available]**

**Voice-over:**

> "Before diving into the demo, let me briefly explain the technical architecture.
>
> The system follows a modern full-stack architecture with a clear separation of concerns:
>
> On the **frontend**, I'm using React with modern routing and state management. The interface is built with Tailwind CSS for responsive design and includes dedicated components for authentication, dashboard, and analysis results.
>
> On the **backend**, I've implemented a FastAPI Python server that handles all the AI analysis. This includes three main AI modules:
> - A comprehensive WCAG 2.1 accessibility analyzer for checking color contrast, color blindness simulation, and alternative text requirements
> - A readability analyzer that evaluates typography, vocabulary complexity, and text structure
> - And a visual attention analyzer using a deep learning saliency model to predict where users will look
>
> The application uses Supabase for authentication and database management, with cloud storage for uploaded designs. The backend is deployed on Render, and the frontend is hosted on Vercel."

---

### **SEGMENT 3: USER AUTHENTICATION (1 minute)**

**[Screen: Navigate to login page]**

**Voice-over:**

> "Let's start by looking at the authentication system.
>
> The application implements secure user authentication using Supabase Auth. Users must create an account and log in to access the analysis features."

**[Action: Show the signup page]**

> "New users can register with their email and password. The system validates input and creates a secure user account."

**[Action: Navigate to login page and log in]**

> "Existing users can log in with their credentials. Once authenticated, the system generates a JWT token that's used for all subsequent API requests. This ensures that each user's designs and analyses remain private and secure.
>
> Notice the authentication state is maintained across page refreshes using localStorage, and users are automatically redirected to the dashboard upon successful login."

---

### **SEGMENT 4: DASHBOARD & UPLOAD INTERFACE (1.5 minutes)**

**[Screen: Show dashboard after login]**

**Voice-over:**

> "After logging in, users land on the main dashboard, which serves as the central hub for design analysis.
>
> The dashboard has two primary sections: the upload section and the analysis history."

**[Action: Highlight the upload area]**

> "The upload section allows users to submit their UI designs for analysis. The system accepts common image formats including PNG, JPEG, and WebP files, with a maximum file size of 10 megabytes to ensure reasonable processing times.
>
> Users can either drag and drop their design files or click to browse and select a file from their computer."

**[Action: Show the analysis history section]**

> "Below the upload area, users can see their complete analysis history. Each entry shows:
> - The design thumbnail
> - The file name and upload date
> - The overall ARAI score, which is the weighted composite score
> - Status indicators showing whether the analysis is complete
> - And action buttons to view detailed results or delete analyses
>
> This history is persisted in the database, so users can return anytime to review previous analyses."

---

### **SEGMENT 5: UPLOADING & PROCESSING A DESIGN (1 minute)**

**[Screen: Prepare to upload a design]**

**Voice-over:**

> "Now let me demonstrate the actual analysis process by uploading a sample UI design."

**[Action: Drag and drop or select a design file]**

> "I'm uploading this [describe the design - e.g., 'mobile app login screen' or 'e-commerce product page']. 
>
> Once the file is selected, the system immediately begins processing. You can see the upload progress indicator here."

**[Action: Show the processing/loading state]**

> "Behind the scenes, several processes are happening:
> - First, the file is validated for format and size
> - Then it's uploaded to Supabase storage with a unique identifier
> - Simultaneously, three AI analyzers begin working in parallel:
>   - The WCAG analyzer checks accessibility compliance
>   - The readability analyzer evaluates text and typography
>   - And the attention analyzer generates a saliency heatmap using our trained deep learning model
>
> The processing typically takes 15 to 30 seconds depending on the design complexity."

---

### **SEGMENT 6: ANALYSIS RESULTS - OVERVIEW (1.5 minutes)**

**[Screen: Show the completed analysis results page]**

**Voice-over:**

> "And here we have the comprehensive analysis results!
>
> The results page is organized into a clean, intuitive interface with several key sections."

**[Action: Scroll through the main score cards at the top]**

> "At the top, we have the **ARAI Score Dashboard** which displays:
> - The overall ARAI score - this is a weighted composite index where accessibility accounts for 40%, readability for 30%, and attention for 30%
> - Individual scores for each analysis dimension
> - A clear pass/fail indicator - designs scoring 70 or above are considered passing
>
> In this example, we can see the overall score is [X out of 100], with individual breakdowns for accessibility, readability, and attention."

**[Action: Scroll down to show the three main report sections]**

> "Below the score cards, the interface is divided into three expandable sections, each providing detailed insights:
> - **Accessibility Report** 
> - **Readability Report**
> - **Attention Report**
>
> Let me dive into each one."

---

### **SEGMENT 7: ACCESSIBILITY ANALYSIS DETAILS (1 minute)**

**[Screen: Expand and show Accessibility Report section]**

**Voice-over:**

> "The **Accessibility Report** implements comprehensive WCAG 2.1 compliance checking.
>
> Let me expand this section to show you what we analyze."

**[Action: Show color contrast results]**

> "First, we have **Color Contrast Analysis**. The system automatically detects text elements and their backgrounds, calculating contrast ratios according to WCAG AA and AAA standards. 
>
> Any contrast issues are flagged with specific recommendations. For example, here it shows [describe any issues found] with suggestions like 'Increase contrast' or 'Use darker text color.'"

**[Action: Show color blindness simulation if available]**

> "Second, the system includes **Color Blindness Simulation**. We simulate how the design appears to users with different types of color vision deficiency - protanopia, deuteranopia, and tritanopia. This helps designers ensure their color choices work for all users."

**[Action: Show alternative text analysis]**

> "Third, we analyze **Alternative Text Requirements**. The AI detects images and graphical elements that need alt text descriptions for screen reader users, highlighting potential accessibility barriers."

---

### **SEGMENT 8: READABILITY ANALYSIS DETAILS (1 minute)**

**[Screen: Show Readability Report section]**

**Voice-over:**

> "Moving to the **Readability Report**, this section evaluates how easy the text content is to read and understand."

**[Action: Show readability metrics]**

> "The system calculates multiple readability metrics:
> - **Flesch Reading Ease score** - where higher scores indicate easier readability
> - **Flesch-Kincaid Grade Level** - showing what education level is needed to understand the text
> - **Average word and sentence length** metrics
>
> These are industry-standard metrics used in content accessibility guidelines."

**[Action: Show typography analysis]**

> "We also analyze **Typography**, checking:
> - Font sizes to ensure they meet minimum legibility standards
> - Line spacing and length for comfortable reading
> - Whether font choices are web-safe and readable
>
> The system provides specific recommendations when issues are detected, such as 'Increase font size for body text' or 'Reduce line length for better readability.'"

**[Action: Show inclusive language check if present]**

> "Additionally, the analyzer flags potential **inclusive language** issues, helping designers create more welcoming and accessible content."

---

### **SEGMENT 9: ATTENTION ANALYSIS DETAILS (1.5 minutes)**

**[Screen: Show Attention Report section]**

**Voice-over:**

> "Finally, we have the **Attention Report**, which is powered by a deep learning saliency prediction model."

**[Action: Show the saliency heatmap]**

> "The centerpiece is the **Saliency Heatmap**. This is generated by a neural network that I trained on eye-tracking datasets including SALICON and MIT Saliency Benchmark.
>
> The heatmap uses color to indicate predicted visual attention:
> - **Red and yellow areas** indicate high attention zones - where users are most likely to look first
> - **Green and blue areas** show lower attention
>
> This overlay helps designers understand if their important elements - like call-to-action buttons, headlines, or key information - are actually drawing user attention as intended."

**[Action: Show visual hierarchy analysis]**

> "We also evaluate **Visual Hierarchy**:
> - The system checks if the most important elements have the highest predicted attention
> - It identifies if there's a clear focal point or if attention is too scattered
> - And it provides recommendations like 'Strengthen visual hierarchy by increasing contrast on primary CTAs' or 'Reduce visual clutter in the header area.'"

**[Action: Show cognitive load metrics if visible]**

> "The **Cognitive Load Assessment** measures how complex the design is:
> - It counts the number of distinct elements
> - Evaluates color complexity and diversity
> - And estimates how much mental effort users need to process the interface
>
> The goal is to help designers find the right balance - engaging but not overwhelming."

---

### **SEGMENT 10: EXPORT & NEXT STEPS (30 seconds)**

**[Screen: Show export options or action buttons]**

**Voice-over:**

> "Users can export the complete analysis report for documentation or sharing with team members.
>
> They can also delete analyses they no longer need, keeping their dashboard organized."

**[Action: Navigate back to dashboard to show updated history]**

> "Returning to the dashboard, we can see the new analysis has been added to the history with all the computed scores and metrics available for future reference."

---

### **SEGMENT 11: CONCLUSION & FUTURE WORK (1 minute)**

**[Screen: Return to dashboard or show a summary slide]**

**Voice-over:**

> "To summarize, I've successfully implemented the core features of the ARAI system:
>
> ✅ **User authentication** with secure account management  
> ✅ **File upload and storage** with validation  
> ✅ **Three comprehensive AI analysis modules**: accessibility, readability, and attention prediction  
> ✅ **A composite ARAI scoring system** that provides actionable insights  
> ✅ **An intuitive results interface** that presents complex data in an understandable format  
> ✅ **Analysis history** with persistent storage  
>
> The system is fully deployed and accessible online, with the frontend on Vercel and backend on Render.
>
> **Looking ahead**, the next development phases include:
> - Enhancing the AI models with more training data for improved accuracy
> - Adding collaborative features so design teams can share and discuss analyses
> - Implementing comparative analysis to track design iterations over time
> - Expanding export options to include PDF reports and integration with design tools like Figma
> - Adding real-time feedback as users adjust their designs
>
> Thank you for watching this demonstration. I'm excited to continue developing ARAI into a comprehensive tool that helps create more accessible, readable, and user-friendly digital experiences."

---

## 🎬 FILMING TIPS

### Before Recording:
1. **Prepare sample designs** (2-3 good examples that show varied results)
2. **Clear browser cache** and have a fresh login ready
3. **Test the demo flow** at least once before recording
4. **Close unnecessary browser tabs** and applications
5. **Use a high-quality microphone** for clear audio
6. **Record in a quiet environment**

### During Recording:
1. **Speak clearly and at a moderate pace** (not too fast)
2. **Use natural pauses** between sections
3. **Zoom in on important UI elements** when demonstrating
4. **Use cursor/pointer to highlight** features you're discussing
5. **Show actual processing** - don't cut the waiting time entirely (just speed it up if needed)

### Screen Recording Settings:
- **Resolution:** 1920x1080 or 1280x720
- **Frame rate:** 30 fps minimum
- **Include cursor in recording**
- **Recommended tools:** OBS Studio, QuickTime (Mac), or Loom

### Video Structure:
- **0:00-1:00** - Introduction
- **1:00-2:00** - Architecture overview
- **2:00-3:00** - Authentication demo
- **3:00-4:30** - Dashboard & upload
- **4:30-5:30** - Processing demo
- **5:30-7:00** - Results overview
- **7:00-9:00** - Detailed analysis sections
- **9:00-10:00** - Conclusion

### Voice-over Tips:
✅ Enthusiastic but professional tone  
✅ Use "I," "we," and "the system" appropriately  
✅ Explain **WHAT** you're showing and **WHY** it matters  
✅ Connect features to user benefits  
✅ Show confidence in your work  

---

## 📝 CUSTOMIZATION NOTES

- **Replace [Your Name]** with your actual name
- **Replace [X out of 100]** with actual scores from your demo
- **Describe specific design** you upload (e.g., "e-commerce checkout page")
- **Adjust timing** based on your speaking pace
- **Add or remove sections** to fit 5-10 minute requirement

---

## ✅ FINAL CHECKLIST

Before submitting your video:
- [ ] Video is 5-10 minutes long
- [ ] Voice-over is continuous and clear throughout
- [ ] All major features are demonstrated
- [ ] Technical terms are explained
- [ ] Video quality is good (720p minimum)
- [ ] Audio is clear and without background noise
- [ ] No personal/sensitive information is visible
- [ ] Project objectives are clearly stated
- [ ] Future work is mentioned
- [ ] Your name is stated at the beginning

Good luck with your video demonstration! 🎥✨
