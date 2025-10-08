# Personal Website Generator - Setup Guide

## What I've Created

I've added a comprehensive drag-and-drop page editor with the following features:

### 🎨 **18 Draggable UI Elements for Business Pages:**

1. **Heading** - Large titles for sections
2. **Text** - Paragraph text content
3. **Button** - Call-to-action buttons
4. **Image** - Image placeholders
5. **Input Field** - Single-line text inputs
6. **Text Area** - Multi-line text inputs
7. **Link** - Clickable hyperlinks
8. **Divider** - Horizontal separators
9. **Card** - Content cards
10. **Form** - Contact forms
11. **Testimonial** - Customer reviews
12. **Pricing Box** - Pricing tables
13. **Gallery** - Image galleries
14. **Video** - Video embeds
15. **Map** - Location maps
16. **Social Icons** - Social media links
17. **Contact Info** - Contact details
18. **Logo** - Brand logo placeholder

### ✨ **Editor Features:**

- **Drag & Drop**: Simply drag elements from the left palette onto the canvas
- **Multi-Select**: Hold Shift or Ctrl to select multiple elements
- **Visual Feedback**: Selected elements are highlighted with a blue outline
- **AI Assistant**: Integrated AI chat that responds to your editing requests
- **3 Options System**: AI provides 3 different solutions for each request
- **Clean UI**: Minimal, elegant design with rounded corners and smooth transitions
- **Responsive**: Works on different screen sizes

### 🤖 **AI Agent Capabilities:**

The AI Assistant now:
- Shows which elements are selected
- Provides context-aware responses
- Offers 3 different solutions for each request
- Handles color changes, sizing, positioning, fonts, and more
- Has a clean chat interface with user/AI message distinction

## Prerequisites

Before running this project, you need to install:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
   - This includes npm (Node Package Manager)

## Installation Steps

1. **Install Node.js**
   - Download from https://nodejs.org/
   - Run the installer
   - Restart PowerShell/Terminal after installation

2. **Install Dependencies**
   ```powershell
   cd c:\Users\Bogdan\Zpi_front\personal-website-generator
   npm install
   ```

3. **Start Development Server**
   ```powershell
   npm start
   ```

4. **Open in Browser**
   - The app will automatically open at http://localhost:3000
   - If not, manually navigate to that URL

## Project Structure

```
personal-website-generator/
├── src/
│   ├── components/
│   │   ├── Editor/
│   │   │   ├── Editor.tsx         # Main editor with drag-drop
│   │   │   ├── Editor.css         # Editor styling
│   │   │   ├── AIAgent.tsx        # AI Assistant chat
│   │   │   └── EditorToolbar.tsx  # Top toolbar
│   │   ├── Templates/             # Template selection
│   │   ├── Modules/               # Page modules (Calendar, etc.)
│   │   ├── Studio/                # User's site management
│   │   └── WelcomePage/           # Landing page
│   ├── hooks/                     # Custom React hooks
│   ├── services/                  # API services
│   ├── types/                     # TypeScript types
│   └── utils/                     # Utility functions
├── public/                        # Static files
└── package.json                   # Dependencies
```

## How to Use the Editor

1. **Add Elements**:
   - Drag any element from the left palette
   - Drop it anywhere on the white canvas

2. **Select Elements**:
   - Click to select one element
   - Shift+Click or Ctrl+Click to select multiple

3. **Use AI Assistant**:
   - Type what you want to change (e.g., "make this button bigger")
   - AI will show 3 options to choose from
   - Click an option to apply it

4. **Edit Elements**:
   - Selected elements show with blue outline
   - AI knows what you have selected
   - Request changes through the chat

## Next Steps

To complete the project based on your requirements:

1. ✅ **Done**: Drag-and-drop editor with business elements
2. ✅ **Done**: AI Agent integration
3. ✅ **Done**: Multi-select functionality
4. ✅ **Done**: Clean, minimalist UI

### Still To Do:

- [ ] Welcome Page component
- [ ] Template Selector with customization menu
- [ ] Module selection (Calendar, About Me, Home Page)
- [ ] Export/Save as .page file format
- [ ] Version control system (main branch)
- [ ] Studio component for managing multiple sites
- [ ] Mobile/Desktop view toggle in toolbar
- [ ] Actual AI backend integration
- [ ] Element property editor (color picker, etc.)
- [ ] Calendar module with Google Calendar integration
- [ ] Authentication system
- [ ] Backend infrastructure (Big Backend + Small Backends)

## Troubleshooting

### "npm is not recognized"
- Install Node.js from https://nodejs.org/
- Restart your terminal/PowerShell

### TypeScript Errors
- Run `npm install` to install all dependencies
- Errors should disappear after installation

### Port Already in Use
- Change the port in package.json or
- Kill the process using port 3000

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **React DnD** - Drag and drop (planned)
- **CSS3** - Modern styling with animations

## Design Philosophy

Following your requirements:
- ✅ Minimalist and simple
- ✅ Elegant and modern design
- ✅ Intuitive for non-technical users
- ✅ No overwhelming options
- ✅ Professional appearance
- ✅ Smooth, rounded UI elements
