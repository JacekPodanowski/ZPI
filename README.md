# Personal Website Generator

A minimalist personal website builder designed for solo entrepreneurs and individuals running one-person businesses. Create professional websites without coding or web design experience through an intuitive drag-and-drop interface.

## 🚧 Project Status

**Currently in Active Development** - The visual editor/creator is the primary focus. Other features like API integration, template management, and deployment are planned but not yet implemented.

### ✅ Completed Features
- **Visual Drag-and-Drop Editor** - Fully functional canvas-based editor
- **Element Library** - 18+ pre-built elements (headings, buttons, cards, forms, etc.)
- **Live Element Editing** - Right-click context menu for element configuration
- **Property Editor** - Customize colors, fonts, sizes, padding, and more
- **Element Management** - Duplicate, delete, and reposition elements freely
- **Responsive Canvas** - Scroll-aware drag-and-drop with smooth positioning

### 🔨 In Development
- AI Assistant integration
- Template saving and loading
- Studio/preview mode
- Export functionality

### 📋 Planned Features
- API backend integration
- Google Calendar integration
- User authentication
- Template marketplace
- Deployment tools
- Version control for pages

## Features

### Visual Editor
- **Drag-and-Drop Interface**: Intuitive canvas-based editor with real-time positioning
- **18+ UI Elements**: Headings, paragraphs, buttons, images, forms, cards, testimonials, pricing boxes, and more
- **Right-Click Configuration**: Context menu for quick access to element properties
- **Live Property Editing**: 
  - Content/text editing
  - Font size and weight
  - Text and background colors
  - Padding and border radius
  - Element duplication and deletion
- **Multi-Select Support**: Select multiple elements with Shift/Ctrl+Click
- **Scroll-Aware Positioning**: Elements stay under cursor even when canvas is scrolled

### Planned Modules
- **Homepage Builder**: Create landing pages with customizable sections
- **About Me Section**: Personal bio and introduction
- **Calendar Integration**: Event management and appointment scheduling
- **Contact Forms**: Customizable contact forms

## Project Structure

```
personal-website-generator
├── public
│   ├── index.html
│   └── favicon.ico
├── src
│   ├── components
│   │   ├── Editor          # Main visual editor (✅ Active)
│   │   │   ├── Editor.tsx
│   │   │   ├── EditorToolbar.tsx
│   │   │   └── AIAgent.tsx
│   │   ├── Templates       # Template management (🔨 Planned)
│   │   ├── Modules         # Pre-built modules (📋 Planned)
│   │   ├── Studio          # Preview mode (📋 Planned)
│   │   └── WelcomePage     # Landing page (✅ Active)
│   ├── hooks               # Custom React hooks
│   ├── services            # API services (📋 Not implemented)
│   ├── types               # TypeScript type definitions
│   ├── utils               # Utility functions
│   ├── App.tsx
│   ├── App.css
│   └── index.tsx
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites
- **Node.js**: v18.20.4 or compatible version
- **npm**: v9.2.0 or higher

### Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd personal-website-generator
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run the Application**:
   ```bash
   NODE_OPTIONS=--openssl-legacy-provider npm start
   ```
   
   > **Note**: The `NODE_OPTIONS` flag is required for Node.js v17+ due to OpenSSL compatibility with react-scripts 4.0.3

4. **Open in Browser**:
   Navigate to `http://localhost:3000` to view the application.

## Usage

### Accessing the Editor
1. Start the application with `npm start`
2. Navigate to `http://localhost:3000/editor`
3. Drag elements from the left palette onto the canvas
4. Click to select elements, drag to reposition
5. Right-click any element to edit properties

### Editing Elements
- **Left-Click**: Select element
- **Drag**: Move element on canvas
- **Right-Click**: Open context menu with options:
  - ✏️ Edit Properties (color, size, font, etc.)
  - 📋 Duplicate element
  - 🗑️ Delete element
- **Shift/Ctrl+Click**: Multi-select elements

### Property Editor
When editing an element, you can configure:
- **Content**: Change text/label
- **Font Size**: Adjust text size (px)
- **Text Color**: Color picker for text
- **Background Color**: Color picker for background
- **Font Weight**: Normal, Bold, Semi-bold, Lighter
- **Padding**: Internal spacing (px)
- **Border Radius**: Corner rounding (px)

## Technology Stack

- **React** 17.0.2
- **TypeScript** 4.1.2
- **React Router DOM** 5.3.4
- **Axios** (for future API integration)
- **CSS3** for styling

## Known Issues

- TypeScript linting warnings with JSX elements (does not affect functionality)
- Template saving/loading not yet implemented
- API services are placeholder only
- AI Agent is UI-only (no actual AI integration yet)

## Troubleshooting

### Error: "digital envelope routines::unsupported"
**Solution**: Use the `NODE_OPTIONS=--openssl-legacy-provider` flag when running npm start

### Missing CSS files
**Solution**: All required CSS files should be auto-generated. If issues persist, check the components directory.

## Development Roadmap

### Phase 1: Core Editor (Current)
- [x] Drag-and-drop interface
- [x] Element library
- [x] Property editing
- [x] Element management

### Phase 2: Templates & Persistence
- [ ] Save/load functionality
- [ ] Template management
- [ ] Local storage integration
- [ ] Export to HTML/CSS

### Phase 3: Backend Integration
- [ ] API development
- [ ] User authentication
- [ ] Database integration
- [ ] Cloud storage

### Phase 4: Advanced Features
- [ ] AI assistant integration
- [ ] Google Calendar API
- [ ] Deployment automation
- [ ] Template marketplace

## Contributing

Contributions are welcome! Since this project is in active development, please:

1. Check existing issues before creating new ones
2. Focus on the editor functionality (current priority)
3. Follow the existing code style
4. Test thoroughly before submitting PRs

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contact

For questions or suggestions, please open an issue on the repository.