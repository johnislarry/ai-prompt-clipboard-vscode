/* eslint-disable @typescript-eslint/naming-convention */
import * as vscode from "vscode";
import axios, { Axios, AxiosError } from "axios";

function prependSpaces(strings: string[]): string[] {
  // Find the length of the longest string
  const maxLength = strings.reduce((max, str) => Math.max(max, str.length), 0);

  // Prepend spaces to each string
  const paddedStrings = strings.map((str) => str.padStart(maxLength, " "));

  return paddedStrings;
}

function sendTextToServer(query: string, project_path: string) {
  axios
    .post("http://localhost:5000/query", {
      query,
      project_path,
    })
    .then(function (response) {
      console.log(response);
      const { prompt, new_embeddings, included_files } = response.data as {
        prompt: string;
        new_embeddings: number;
        included_files: string[];
      };

      const padded_included_files = prependSpaces(included_files);
      vscode.env.clipboard.writeText(prompt).then(() => {
        vscode.window
          .showInformationMessage(
            `✨ Prompt copied to clipboard!\n\n🧮 Regenerated ${new_embeddings} new embeddings.\n\n📚 Prompt includes contents from ${
              included_files.length
            } file${
              included_files.length === 1 ? "" : "s"
            }:\n\n${padded_included_files.join("\n")}`,
            { modal: true },
            "Open ChatGPT"
          )
          .then((value) => {
            if (value !== "Open ChatGPT") {
              return;
            }
            const configuration = vscode.workspace.getConfiguration();
            const chatGptUrl = configuration.get<string>(
              "ai-prompt-clipboard.chatGptUrl"
            );
            if (chatGptUrl === undefined) {
              vscode.window.showErrorMessage(
                "No chatGPT URL configured. Please set ai-prompt-clipboard.chatGptUrl in your settings."
              );
              return;
            }
            vscode.env.openExternal(vscode.Uri.parse(chatGptUrl));
          });
      });
    })
    .catch(function (error: any) {
      vscode.window.showErrorMessage(
        `Prompt generator error: ${error.message}`
      );
    });
}

async function sendInitToServer(project_path: string) {
  const configuration = vscode.workspace.getConfiguration();
  const openai_key = configuration.get("ai-prompt-clipboard.openaiKey");
  const response = await axios.post("http://localhost:5000/init", {
    project_path,
    openai_key,
  });
  return response.data;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showErrorMessage("No workspace folder found");
    return;
  }
  const project_path = workspaceFolder.uri.fsPath;
  console.log(project_path);

  let disposable = vscode.commands.registerCommand(
    "ai-prompt-clipboard.generatePrompt",
    async () => {
      const promptHistory =
        context.globalState.get<string[]>("promptHistory") || [];

      const quickPick = vscode.window.createQuickPick();
      quickPick.placeholder = "Enter a chatGPT prompt or pick from history";
      quickPick.canSelectMany = false;

      quickPick.items = promptHistory.map((label) => ({
        label,
        buttons: [
          {
            iconPath: new vscode.ThemeIcon("clippy"),
            tooltip: "Copy prompt to clipboard",
          },
        ],
      }));

      quickPick.onDidTriggerItemButton(
        (e: vscode.QuickPickItemButtonEvent<vscode.QuickPickItem>) => {
          vscode.env.clipboard.writeText(e.item.label);
          vscode.window.showInformationMessage("Copied prompt to clipboard!");
          quickPick.hide();
        }
      );

      quickPick.onDidAccept(async () => {
        const prompt = quickPick.selectedItems[0]?.label || quickPick.value;

        if (!prompt) {
          return;
        }

        promptHistory.unshift(prompt);
        await context.globalState.update("promptHistory", promptHistory);

        try {
          const initResult = await sendInitToServer(project_path);
          console.log(`Init result ${JSON.stringify(initResult)}`);
          sendTextToServer(prompt, project_path);

          quickPick.hide();
        } catch (error) {
          let err = error as AxiosError;
          if (err.response?.status === 403) {
            vscode.window.showErrorMessage(
              "Could not connect to server. Is it running?"
            );
          } else {
            vscode.window.showErrorMessage(
              `Prompt generator error: ${err.message}`
            );
          }
        }
      });

      quickPick.show();
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
