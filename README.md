# Bubble by Mill Pond Research

Bubble is a modern, intuitive thought-capturing application designed to help you organize and manage your ideas efficiently. Available as both a web app and a desktop application.

![Bubble Application Screenshot](img/Bubble.PNG)

## Features

- **Create and Edit Thoughts**: Easily add new thoughts or edit existing ones using a rich text editor.
- **Tag System**: Organize your thoughts with tags for easy categorization and retrieval.
- **Search Functionality**: Quickly find specific thoughts using the search feature.
- **Flexible Layouts**: View your thoughts in list or grid layout.
- **Sorting Options**: Sort your thoughts by date (newest/oldest), title (A-Z/Z-A), or custom order.
- **Dark Mode**: Toggle between light and dark modes for comfortable viewing.
- **Drag and Drop**: Reorder thoughts or combine them by dragging and dropping.
- **Markdown Support**: Write your thoughts in Markdown and see them rendered beautifully.
- **Local Storage**: All your thoughts are saved locally as Markdown files.
- **Thought Elaboration**: Automatically expand and enhance your thoughts using AI-powered elaboration.
- **Desktop App**: Run Bubble as a native desktop application with easy access to your local files.

## Getting Started

### Web Application
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   cd server && npm install && cd ..
   ```
3. Start the application (both server and web app):
   ```
   npm run dev:all
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser to view the app.

### Desktop Application
1. Install dependencies if you haven't already:
   ```
   npm install
   cd server && npm install && cd ..
   ```
2. Run the desktop application with server in development mode:
   ```
   npm run dev:all
   ```
3. To build the desktop application:
   ```
   npm run electron:build
   ```

## Usage

- **Adding a Thought**: Click the "New Thought" button to create a new thought. Enter a title, body, and tags.
- **Editing a Thought**: Click on a thought card to open the editor and modify its content.
- **Deleting a Thought**: Click the delete icon on a thought card to remove it.
- **Searching**: Use the search bar in the header to find specific thoughts.
- **Filtering by Tag**: Click on a tag in the sidebar to view all thoughts with that tag.
- **Changing Layout**: Use the layout toggle in the header to switch between grid and list views.
- **Sorting Thoughts**: Use the sort dropdown to change the order of your thoughts.
- **Dark Mode**: Toggle the sun/moon icon in the header to switch between light and dark modes.
- **Elaborating Thoughts**: Click the "Elaborate" button when editing a thought to expand its content using AI.
- **Accessing Local Files**: In the desktop app, click the folder icon to open the directory where your markdown files are stored.

## Technologies Used

- React
- Redux Toolkit
- TypeScript
- Tailwind CSS
- React DnD
- React Quill
- Vite
- Electron
- Express (for backend API)
- Anthropic Claude API (for thought elaboration)

## Contributing

We welcome contributions to Bubble! Please feel free to submit issues, fork the repository and send pull requests!

## License

This project is licensed under the MIT License.

---

Developed with ❤️ by Mill Pond Research