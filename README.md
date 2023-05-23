# AI Prompt Clipboard

The "AI Prompt Clipboard" is a Visual Studio Code extension that leverages artificial intelligence to streamline the process of incorporating your codebase with chatGPT prompts. It executes a command to display a modal input that solicits a chatGPT prompt from you. The AI then identifies the source files in your project that are most relevant to your query, copies the contents of these files along with your prompt, and stores them in your clipboard for easy pasting into chatGPT.

🚧 This extension is in beta. If you want to help pilot this, then contact me via Twitter at [https://twitter.com/johnislarry](https://twitter.com/johnislarry).

## Features

- **ChatGPT Prompt Modal Input**: Easily input your chatGPT prompts directly in your workspace.
- **AI-Driven Codebase Analysis**: The AI automatically sifts through your source files and selects the ones that best match your prompt.
- **Automatic Clipboard Copy**: Streamlines the process of transferring your project details into chatGPT by copying both the prompt and the relevant source code into your clipboard.
- **Bring your own OpenAI Key**: Configure the extension in settings to use your own API key.

## How to Use

1. Install the AI Prompt Clipboard extension from the VS Code marketplace.
2. Navigate to the Command Palette (`Ctrl+Shift+P` on Windows and `Command+Shift+P` on macOS) and select the 'AI Prompt Clipboard: Generate Prompt' option.
3. A modal input will pop up. Here, enter your chatGPT prompt.
4. The AI will now identify the most relevant source files in your project that pertain to your prompt.
5. Your prompt and the contents of the identified source files are then copied to your clipboard, ready to be pasted into chatGPT.
