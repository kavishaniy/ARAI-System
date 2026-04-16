# Project Management Feature - Complete Implementation Guide

## 📋 Overview

The Project Management feature allows users to:
- ✅ **Create Projects** with name and optional description
- ✅ **Search Projects** by name or description
- ✅ **View Project Dashboard** with analyses and statistics
- ✅ **Manage Analyses** within projects
- ✅ **Edit Project Details** (name and description)
- ✅ **Delete Projects** and associated analyses
- ✅ **View Project Statistics** (analysis count, dates, performance metrics)

## 🏗️ Architecture

### Backend Components

#### 1. **API Routes** (`app/api/projects.py`)
- `POST /projects` - Create new project
- `GET /projects` - List all user projects (with search)
- `GET /projects/{id}` - Get project details with analyses
- `PUT /projects/{id}` - Update project information
- `DELETE /projects/{id}` - Delete project
- `POST /projects/{id}/analyses/{analysis_id}` - Link analysis to project

#### 2. **Database Functions** (`app/core/database.py`)
```python
- create_project(user_id, name, description)
- get_user_projects(user_id, limit)
- get_project_by_id(project_id, user_id)
- update_project(project_id, user_id, **kwargs)
- delete_project(project_id, user_id)
- get_project_analyses(project_id)
- link_analysis_to_project(analysis_id, project_id, user_id)
```

#### 3. **Schemas** (`app/models/schemas.py`)
```python
- ProjectCreate(name, description)
- ProjectUpdate(name, description)
- Project(id, user_id, name, description, analysis_count, ...)
- ProjectList(projects, total)
```

### Frontend Components

#### 1. **Pages**
- **Projects.jsx** - Main projects listing page with search and creation
- **ProjectDashboard.jsx** - Detailed project view with analytics
- **CreateProjectModal.jsx** - Modal for creating new projects

#### 2. **Services**
- **projects.js** - API service for project operations

#### 3. **Styles**
- **Projects.css** - Projects listing page styles
- **CreateProjectModal.css** - Modal styles
- **ProjectDashboard.css** - Dashboard styles

## 🚀 Getting Started

### 1. Database Setup

Follow the comprehensive guide in `DATABASE_SETUP_PROJECTS.md`:

```sql
-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add project_id to analyses
ALTER TABLE analyses ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;

-- Enable RLS and create policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ... (see full guide for policies)
```

### 2. Backend Setup

The backend is already configured in:
- `app/api/projects.py` - All endpoints implemented
- `app/core/database.py` - Database functions updated
- `app/main.py` - Routes registered

**Start the backend:**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

### 3. Frontend Setup

The frontend components are ready:
- Navigate to `/projects` to see the projects page
- Create a new project with the "New Project" button
- Click on a project card to view its dashboard

## 📱 UI Features

### Projects Listing Page

**Search Functionality:**
- Real-time search with debouncing (500ms)
- Searches in project name and description
- Clear button to reset search

**Project Cards:**
- Project name and description (truncated to 2 lines)
- Analysis count badge
- Creation date
- Click to view detailed dashboard
- Delete button with confirmation

**Empty State:**
- Beautiful empty state when no projects exist
- CTA button to create first project

### Create Project Modal

**Form Validation:**
- Project name required (1-255 characters)
- Description optional (0-1000 characters)
- Character counters
- Form-level error messages
- Disabled state while creating

**User Experience:**
- Modal overlay with smooth animations
- Auto-focus on project name input
- Clear visual hierarchy
- Loading state with spinner

### Project Dashboard

**Overview Tab:**
- Project information (name, description)
- Total analyses count
- Creation and update dates
- Quick statistics (avg scores)

**Analyses Tab:**
- List of all project analyses
- Score badges (Accessibility, Readability, Attention, Overall)
- Creation dates
- Links to detailed analysis view

**Edit Mode:**
- Edit project name and description inline
- Save and cancel buttons
- Validation before saving

**Stats Section:**
- Total analyses
- Project creation date
- Last update date

## 💻 API Usage Examples

### Create Project
```javascript
const newProject = await projectService.createProject(
  "Mobile App Design",
  "Analysis of mobile app UI/UX designs"
);
```

### Get All Projects
```javascript
const { projects, total } = await projectService.getProjects(
  "design",  // optional search term
  100        // optional limit
);
```

### Get Project Details
```javascript
const projectDetail = await projectService.getProjectDetail(projectId);
// Contains: id, name, description, analyses, stats, dates
```

### Update Project
```javascript
await projectService.updateProject(projectId, {
  name: "Updated Name",
  description: "Updated description"
});
```

### Delete Project
```javascript
await projectService.deleteProject(projectId);
// Deletes project and all associated analyses
```

### Link Analysis to Project
```javascript
await projectService.linkAnalysisToProject(projectId, analysisId);
```

## 🎨 Styling & Theme

The components use CSS variables for theming:
- `--bg-base`, `--bg-secondary` - Background colors
- `--text-primary`, `--text-secondary` - Text colors
- `--border-color` - Border colors
- Primary gradient: `#667eea` to `#764ba2`

### Responsive Design

- **Desktop** (1024px+): Full grid layout, side-by-side content
- **Tablet** (768px-1023px): Adjusted grid, stacked modals
- **Mobile** (<768px): Single column layout, optimized touch targets

## 🔒 Security & Validation

### Backend Security
- JWT token validation on all endpoints
- User ID verification (users can only access their own projects)
- RLS policies enforce data isolation at database level
- Dependency injection for authentication

### Frontend Security
- Authorization headers with Bearer token
- Input validation before API calls
- Confirmation dialogs for destructive actions
- Secure error handling

### Data Validation
- Project name: 1-255 characters
- Description: 0-1000 characters
- UUID validation for IDs
- Proper HTTP status codes and error messages

## 📊 Database Schema

### Projects Table
```
id (UUID) - Primary Key
user_id (UUID) - FK to auth.users
name (VARCHAR 255) - Project name
description (TEXT) - Optional description
created_at (TIMESTAMP) - Creation timestamp
updated_at (TIMESTAMP) - Last update timestamp
```

### Analyses Table (Updated)
```
... existing columns ...
project_id (UUID) - FK to projects (optional, nullable)
```

## 🔄 User Workflows

### Workflow 1: Create and Analyze
1. User clicks "New Project" button
2. Fills in project name (required) and description (optional)
3. Clicks "Create Project"
4. Gets redirected to project dashboard
5. Uploads or analyzes designs within the project
6. Views analyses in the project dashboard

### Workflow 2: Search and Access
1. User on projects page sees all their projects
2. Uses search bar to find specific project
3. Clicks on project card to open dashboard
4. Views project details and associated analyses
5. Can click on any analysis to view full report

### Workflow 3: Manage Projects
1. User edits project by clicking "Edit" button
2. Updates name/description and saves
3. Can delete project (with confirmation)
4. Deletion also removes all associated analyses

## 🧪 Testing

### Manual Testing Checklist
- [ ] Create a project with name only
- [ ] Create a project with name and description
- [ ] Search projects by name
- [ ] Search projects by description
- [ ] Click on project to view dashboard
- [ ] Edit project name and description
- [ ] Delete project with confirmation
- [ ] Cancel delete operation
- [ ] View analyses in project dashboard
- [ ] Click analysis to view details
- [ ] Verify empty state when no projects

### API Testing
```bash
# Test create project
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","description":"Test project"}'

# Test list projects
curl -X GET "http://localhost:8000/api/v1/projects?search=Test" \
  -H "Authorization: Bearer TOKEN"

# Test get project
curl -X GET http://localhost:8000/api/v1/projects/PROJECT_ID \
  -H "Authorization: Bearer TOKEN"
```

## 🐛 Troubleshooting

### Common Issues

**Projects list is empty**
- Check if database table exists
- Verify RLS policies allow user to see projects
- Check network tab for API errors

**Can't create project**
- Verify backend is running
- Check authorization token is valid
- Check name is not empty

**Dashboard not loading**
- Verify project exists in database
- Check if analyses query is working
- Look for errors in browser console

**Styles not applying**
- Clear browser cache
- Check if CSS files are imported
- Verify CSS variables are defined

## 📝 Notes

- Analyses can exist without a project (backward compatible)
- Projects are soft-deleted (via CASCADE constraint)
- All operations require authentication
- Projects are private to the user (RLS enforced)
- Search is case-insensitive

## 🚀 Future Enhancements

1. **Project Templates** - Create projects from templates
2. **Team Collaboration** - Share projects with team members
3. **Project Settings** - Additional configuration options
4. **Activity Logs** - Track changes in projects
5. **Batch Operations** - Bulk delete, bulk move analyses
6. **Project Export** - Export project data and analyses
7. **Custom Tags** - Tag and filter projects
8. **Favorites** - Star/favorite projects for quick access

## 📚 Documentation Files

- `DATABASE_SETUP_PROJECTS.md` - Database setup and RLS policies
- `PROJECTS_FEATURE_README.md` - This file

## 🤝 Integration Points

### With Analysis Feature
- Analyses can be linked to projects
- Project dashboard displays analyses
- Deleting project cascades to analyses

### With Authentication
- Uses JWT tokens for authentication
- User ID from Supabase auth

### With Dashboard
- Can navigate from dashboard to projects
- Can navigate from projects to analysis details

## 📞 Support

For issues or questions:
1. Check troubleshooting section
2. Review API documentation in `projects.py`
3. Check database setup guide
4. Review browser console for errors
5. Check backend logs for API errors
