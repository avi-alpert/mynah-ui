# Mynah UI
> *A Data & Event Driven Chat Interface Library for Browsers and Webviews*

[![PR](https://github.com/aws/mynah-ui/actions/workflows/new_pr.yml/badge.svg?branch=main)](https://github.com/aws/mynah-ui/actions/workflows/new_pr.yml)
[![Beta](https://github.com/aws/mynah-ui/actions/workflows/beta.yml/badge.svg?branch=main)](https://github.com/aws/mynah-ui/actions/workflows/beta.yml)
[![Publish](https://github.com/aws/mynah-ui/actions/workflows/publish.yml/badge.svg?branch=main)](https://github.com/aws/mynah-ui/actions/workflows/publish.yml)
[![Deploy](https://github.com/aws/mynah-ui/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/aws/mynah-ui/actions/workflows/deploy.yml)

**AWS Mynah UI** is a powerful, **_data and event-driven_** chat interface library designed for browsers and webviews on IDEs or any platform supporting modern web technologies. It serves as the foundation for [Amazon Q](https://aws.amazon.com/q/) chat interfaces in [VSCode](https://marketplace.visualstudio.com/items?itemName=AmazonWebServices.aws-toolkit-vscode) and [JetBrains](https://plugins.jetbrains.com/plugin/11349-aws-toolkit) extensions.

Built to be framework-agnostic, Mynah UI seamlessly integrates into any web-based project without dependencies on React, Vue, Angular, or other UI frameworks. This design choice ensures maximum flexibility for theming, customization, and integration into diverse environments—from IDE extensions to standalone web applications.

## Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Quick Links](#quick-links)
- [Installation](#installation)
- [Basic Usage](#basic-usage)
  - [Quick Start Example](#quick-start-example)
  - [Handling Events](#handling-events)
  - [Managing Chat Messages](#managing-chat-messages)
- [Configuration Options](#configuration-options)
- [Development Setup](#development-setup)
  - [Prerequisites](#prerequisites)
  - [Setting Up Your Environment](#setting-up-your-environment)
  - [Project Structure](#project-structure)
- [Build and Test](#build-and-test)
  - [Building the Project](#building-the-project)
  - [Running Tests](#running-tests)
  - [Linting and Formatting](#linting-and-formatting)
- [Contributing](#contributing)
- [Documentation](#documentation)
- [Browser Support](#browser-support)
- [Security](#security)
- [License](#license)

## Overview

Mynah UI is a standalone chat interface solution that requires only a designated rendering location within the DOM. Its architecture is built on three core pillars:

- **Data Store**: Manages state for multiple tabs and chat items
- **Global Event Handler**: Facilitates communication between components
- **DOM Builder**: Handles all HTML element generation and manipulation

This architecture enables a reactive, event-driven approach where the UI automatically updates based on data changes, and user interactions trigger events that your application can handle.

## Key Features

### 🎨 **Framework Independent**
- No dependencies on React, Vue, Angular, or other UI frameworks
- Pure TypeScript implementation
- Integrates seamlessly into any web project

### 🎯 **Event-Driven Architecture**
- Comprehensive event system for user interactions
- Easy integration with your application logic
- Support for custom event handlers

### 📑 **Multi-Tab Support**
- Manage multiple chat sessions simultaneously
- Independent state management per tab
- Customizable tab actions and behaviors

### 💬 **Rich Chat Experience**
- Markdown rendering with syntax highlighting
- Code block support with copy-to-clipboard functionality
- Insert code at cursor position (IDE integration)
- Streaming responses for real-time updates
- Follow-up suggestions and actions
- Source citations and reference links

### 🎨 **Highly Customizable**
- Extensive theming capabilities via CSS variables
- Configurable UI text and labels
- Custom buttons and actions
- Feedback and rating system

### 🔧 **Developer Friendly**
- TypeScript support with full type definitions
- Comprehensive API documentation
- Well-documented data models
- Example implementations included

### 📦 **Production Ready**
- Used in production by Amazon Q extensions
- Comprehensive test coverage (unit and E2E)
- Active maintenance and updates
- Apache 2.0 licensed

## Quick Links
* 🚀 [Live Demo](https://aws.github.io/mynah-ui/)
* 📚 [API Documentation](https://aws.github.io/mynah-ui/api-doc/index.html)
* 💻 [GitHub Repository](https://github.com/aws/mynah-ui)

## Installation

Install Mynah UI via npm:

```bash
npm install @aws/mynah-ui
```

Or using yarn:

```bash
yarn add @aws/mynah-ui
```

Or using pnpm:

```bash
pnpm add @aws/mynah-ui
```

## Basic Usage

### Quick Start Example

Here's a minimal example to get you started:

```typescript
import { MynahUI } from '@aws/mynah-ui';

// Create a new Mynah UI instance
const mynahUI = new MynahUI({
    // Specify where to render the UI (optional, defaults to document.body)
    rootSelector: '#mynah-ui-container',
    
    // Configure the UI (optional)
    config: {
        maxTabs: 5,
        showPromptField: true,
        autoFocus: true,
    },
    
    // Set up initial tabs (optional)
    tabs: {
        'tab-1': {
            isSelected: true,
            store: {
                tabTitle: 'My First Chat',
                chatItems: []
            }
        }
    }
});
```

### Handling Events

Mynah UI provides a rich set of events to handle user interactions:

```typescript
const mynahUI = new MynahUI({
    // Handle chat prompts from the user
    onChatPrompt: (tabId, prompt, eventId) => {
        console.log(`User sent: ${prompt.prompt}`);
        
        // Process the prompt and add a response
        mynahUI.addChatItem(tabId, {
            type: 'answer-stream',
            body: 'Processing your request...',
        });
    },
    
    // Handle follow-up clicks
    onFollowUpClicked: (tabId, messageId, followUp) => {
        console.log(`Follow-up clicked: ${followUp.prompt}`);
    },
    
    // Handle voting (thumbs up/down)
    onVote: (tabId, messageId, vote) => {
        console.log(`Vote: ${vote}`);
    },
    
    // Handle code copy actions
    onCopyCodeToClipboard: (tabId, messageId, code, type, referenceTrackerInfo, eventId, codeBlockIndex, totalCodeBlocks) => {
        // Copy code to clipboard
        navigator.clipboard.writeText(code);
    },
    
    // Handle link clicks
    onLinkClick: (tabId, messageId, link, mouseEvent) => {
        console.log(`Link clicked: ${link}`);
    },
    
    // Handle tab changes
    onTabChange: (tabId) => {
        console.log(`Switched to tab: ${tabId}`);
    }
});
```

### Managing Chat Messages

Add and update chat messages dynamically:

```typescript
// Add a user message
mynahUI.addChatItem('tab-1', {
    type: 'prompt',
    body: 'How do I create a REST API?'
});

// Add an AI response with streaming
const messageId = mynahUI.addChatItem('tab-1', {
    type: 'answer-stream',
    body: 'To create a REST API, you need to...',
});

// Update the streaming response
mynahUI.updateChatAnswerWithMessageId('tab-1', messageId, {
    body: 'To create a REST API, you need to:\n\n1. Choose a framework\n2. Define your endpoints...'
});

// End the stream
mynahUI.endMessageStream('tab-1', messageId);

// Add code blocks with actions
mynahUI.addChatItem('tab-1', {
    type: 'answer',
    body: 'Here\'s an example:\n\n```python\nfrom flask import Flask\napp = Flask(__name__)\n\n@app.route("/api")\ndef hello():\n    return {"message": "Hello World"}\n```',
    codeReference: [{
        information: 'Flask framework example',
        recommendationContentSpan: {
            start: 0,
            end: 100
        }
    }]
});

// Add follow-up suggestions
mynahUI.addChatItem('tab-1', {
    type: 'answer',
    followUp: {
        text: 'Would you like to know more?',
        options: [
            { prompt: 'Show me error handling', text: 'How to add error handling?' },
            { prompt: 'Add authentication', text: 'How to secure the API?' }
        ]
    }
});
```

## Configuration Options

Mynah UI offers extensive configuration options:

```typescript
const mynahUI = new MynahUI({
    config: {
        // Maximum number of tabs (set to 1 to hide tabs)
        maxTabs: 10,
        
        // Maximum characters in user input
        maxUserInput: 10000,
        
        // Character threshold for warning
        userInputLengthWarningThreshold: 8000,
        
        // Enable/disable code actions
        codeCopyToClipboardEnabled: true,
        codeInsertToCursorEnabled: true,
        
        // Auto-focus input after actions
        autoFocus: true,
        
        // Show/hide prompt input field
        showPromptField: true,
        
        // Customize UI text
        texts: {
            mainTitle: 'My AI Assistant',
            copy: 'Copy',
            insertAtCursorLabel: 'Insert at cursor',
            stopGenerating: 'Stop',
            feedbackFormTitle: 'Feedback',
            // ... and many more
        },
        
        // Feedback options
        feedbackOptions: [
            { label: 'Inaccurate', value: 'inaccurate' },
            { label: 'Not helpful', value: 'not-helpful' },
            { label: 'Offensive', value: 'offensive' }
        ],
        
        // Custom tab bar buttons
        tabBarButtons: [
            {
                id: 'clear',
                description: 'Clear chat',
                icon: MynahIcons.REFRESH,
            }
        ]
    }
});
```

For complete configuration details, see the [Configuration Guide](./docs/CONFIG.md).

## Development Setup

### Prerequisites

- **Node.js**: Version 14.x or higher
- **npm**: Version 6.x or higher (comes with Node.js)
- **Git**: For version control

### Setting Up Your Environment

1. **Clone the repository**:
```bash
git clone https://github.com/aws/mynah-ui.git
cd mynah-ui
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start development environment**:
```bash
npm run dev
```

This command will:
- Clean previous build artifacts
- Install all dependencies
- Build the project
- Start the example project with live reload
- Open the demo at `http://localhost:9000`

4. **Start developing**:
   - The project uses `watch` mode, so changes are automatically compiled
   - The example project updates in real-time as you modify the source code
   - Check the browser console for any errors

### Project Structure

```
mynah-ui/
├── src/                    # Source code
│   ├── components/         # UI components
│   ├── helper/            # Helper functions and utilities
│   ├── styles/            # SCSS styles
│   ├── main.ts            # Main entry point
│   └── static.ts          # Static assets and constants
├── example/               # Example implementation
│   ├── src/              # Example source code
│   └── dist/             # Built example (generated)
├── docs/                  # Documentation
│   ├── STARTUP.md        # Getting started guide
│   ├── CONFIG.md         # Configuration reference
│   ├── DATAMODEL.md      # Data model documentation
│   ├── USAGE.md          # Usage guide
│   ├── STYLING.md        # Styling guide
│   ├── ARCHITECTURE.md   # Architecture overview
│   └── DEVELOPER.md      # Developer guidelines
├── ui-tests/             # End-to-end tests
├── dist/                 # Built library (generated)
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── webpack.config.js     # Webpack configuration
└── jest.config.js        # Jest test configuration
```

## Build and Test

### Building the Project

**Development build with watch mode**:
```bash
npm run watch
```

**Production build**:
```bash
npm run build
```

**Build example project**:
```bash
npm run packdemo
```

**Clean build artifacts**:
```bash
npm run clean
```

### Running Tests

**Run unit tests**:
```bash
npm run tests:unit
```

**Run end-to-end tests**:
```bash
npm run tests:e2e
```

**Run tests with coverage**:
```bash
npm run tests:unit -- --coverage
```

### Linting and Formatting

**Check code style**:
```bash
npm run lint
```

**Auto-fix linting issues**:
```bash
npm run lint-fix
```

**Check code formatting**:
```bash
npm run format:check
```

**Auto-format code**:
```bash
npm run format:write
```

### Generate API Documentation

```bash
npm run api-docs
```

The generated documentation will be available in the `api-docs` directory.

## Contributing

We welcome contributions from the community! Here's how to get started:

1. **Read the guidelines**: Check [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/DEVELOPER.md](docs/DEVELOPER.md)
2. **Fork the repository**: Create your own fork on GitHub
3. **Create a branch**: `git checkout -b feature/my-new-feature`
4. **Make your changes**: Follow the coding standards and add tests
5. **Run tests**: Ensure all tests pass with `npm run tests:unit`
6. **Commit your changes**: Use clear, descriptive commit messages
7. **Push to your fork**: `git push origin feature/my-new-feature`
8. **Open a Pull Request**: Describe your changes and link any related issues

### Code of Conduct

This project adheres to the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct). By participating, you are expected to uphold this code.

### Development Workflow

- All code must pass linting and formatting checks
- Unit tests are required for new features
- End-to-end tests should be added for UI changes
- Documentation should be updated for API changes

## Documentation

Comprehensive documentation is available in the `docs/` directory:

- **[Startup Guide](./docs/STARTUP.md)** - Quick introduction and first steps
- **[Constructor Properties](./docs/PROPERTIES.md)** - Complete reference of initialization options
- **[Configuration](./docs/CONFIG.md)** - Configuration options and customization
- **[Data Model](./docs/DATAMODEL.md)** - Data structures and message types
- **[Usage Guide](./docs/USAGE.md)** - Detailed usage examples and patterns
- **[Styling Guide](./docs/STYLING.md)** - Theming and style customization
- **[Architecture](./docs/ARCHITECTURE.md)** - Internal architecture and design
- **[Developer Guidelines](./docs/DEVELOPER.md)** - Contribution guidelines

### Additional Resources

- **[Live Demo](https://aws.github.io/mynah-ui/)** - Interactive demonstration
- **[API Documentation](https://aws.github.io/mynah-ui/api-doc/index.html)** - Complete API reference
- **[Example Implementation](./example)** - Full working example with IDE-like interface

### Preview
![Preview](./docs/img/splash.gif)

## Browser Support

**Mynah UI** supports all modern evergreen browsers:

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ WebKit-based WebUI renderers (for IDE extensions)

> **Note**: Due to its extensive use of modern CSS features, Mynah UI does not support Internet Explorer or older browser versions.

## Security

Security is a top priority for AWS. If you discover a potential security issue:

- **Do NOT** create a public GitHub issue
- Report it via [AWS Vulnerability Reporting](http://aws.amazon.com/security/vulnerability-reporting/)
- See [CONTRIBUTING.md](CONTRIBUTING.md#security-issue-notifications) for more details

## License

This project is licensed under the [Apache License 2.0](LICENSE).

See [THIRD-PARTY-LICENSES](THIRD-PARTY-LICENSES) for licenses of third-party dependencies.

---

<div align="center">

**Built with ❤️ by AWS**

[Documentation](./docs) • [API Reference](https://aws.github.io/mynah-ui/api-doc/index.html) • [Live Demo](https://aws.github.io/mynah-ui/) • [Report Bug](https://github.com/aws/mynah-ui/issues) • [Request Feature](https://github.com/aws/mynah-ui/issues)

</div>
