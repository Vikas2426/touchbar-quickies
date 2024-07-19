
'use strict';

import * as vscode from 'vscode';

// this method is called when your extension is activated
export function activate(context: vscode.ExtensionContext) {
  let cmdP = vscode.commands.registerCommand(
    'extension.touchbarCommandPalette',
    () => {
      // Open Command Pallete
      vscode.commands.executeCommand('workbench.action.showCommands');
    }
  );

  let quickOpen = vscode.commands.registerCommand(
    'extension.touchbarQuickOpen',
    () => {
      // Open Quick Open
      vscode.commands.executeCommand('workbench.action.quickOpen');
    }
  );

  let terminalToggle = vscode.commands.registerCommand(
    'extension.touchbarTerminal',
    () => {
      // Toggle Terminal
      vscode.commands.executeCommand(
        'workbench.action.terminal.toggleTerminal'
      );
    }
  );

  let sidebarToggle = vscode.commands.registerCommand(
    'extension.touchbarSidebar',
    () => {
      // Toggle Sidebar
      vscode.commands.executeCommand(
        'workbench.action.toggleSidebarVisibility'
      );
    }
  );

  // Push onto context
  context.subscriptions.push(cmdP);
  context.subscriptions.push(quickOpen);

   // Command: Delete Line (Cmd+Shift+K)
   let deleteLineDisposable = vscode.commands.registerCommand('extension.deleteLine', () => {
    vscode.commands.executeCommand('editor.action.deleteLines');
});
context.subscriptions.push(deleteLineDisposable);

// Command: Console.log Selected Word (Cmd+Shift+L)
let logSelectedWord = vscode.commands.registerCommand('extension.logSelectedWord', async () => {
  // The code you place here will be executed every time your command is executed
  const editor = vscode.window.activeTextEditor;

  if (!editor) return;

  const quote = vscode.workspace.getConfiguration("console-flash").get("double-quotes") ? '"' : "'";
  const semiColon = vscode.workspace.getConfiguration("console-flash").get("semi-colon") ? ";" : "";

  if (editor.selection.isEmpty) {
    const position = editor.selection.active;

    const textContent = editor.document.getText();

    const currentLine = textContent.split("\n")[position.line];

    if (currentLine.trim()) {
      await vscode.commands.executeCommand("editor.action.insertLineAfter");
    }

    const valid = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_";
    const index = position.character;

    function findNext(original: string, final: string, i: number, change: -1 | 1): string {
      if (typeof original[i] === "undefined") return final;
      if (!valid.includes(original[i])) return final;

      return findNext(original, final + original[i], i + change, change);
    }

    if (!valid.includes(currentLine[index])) {
      editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, `console.log()${semiColon}`);
      });
    } else {
      const left = findNext(currentLine.slice(0, index), "", index - 1, -1)
        .split("")
        .reverse()
        .join("");
      const right = findNext(currentLine.slice(index + 1), "", 0, 1);
      const result = `${left}${currentLine[index]}${right}`;

      editor.edit((editBuilder) => {
        editBuilder.insert(editor.selection.active, `console.log(${quote}${result}: ${quote}, ${result})${semiColon}`);
      });
    }
  } else {
    const selection = editor.selection;
    const text = editor.document.getText(selection);
    await vscode.commands.executeCommand("editor.action.insertLineAfter");

    editor.edit((editBuilder) => {
      editBuilder.insert(editor.selection.active, `console.log(${quote}${text}: ${quote}, ${text})${semiColon}`);
    });
  }
});
context.subscriptions.push(logSelectedWord);

// Command: Go to Line (Ctrl+G)
let gotoLineDisposable = vscode.commands.registerCommand('extension.gotoLine', async () => {
    let lineNumber = await vscode.window.showInputBox({
        prompt: "Enter line number to go to",
        placeHolder: "Line Number"
    });

    if (lineNumber) {
        let lineNum = +lineNumber;
        if (!isNaN(lineNum) && lineNum > 0) {
            let editor = vscode.window.activeTextEditor;
            if (editor) {
                let newSelection = new vscode.Selection(lineNum - 1, 0, lineNum - 1, 0);
                editor.selection = newSelection;
                editor.revealRange(newSelection);
            }
        } else {
            vscode.window.showErrorMessage("Invalid line number");
        }
    }
});
context.subscriptions.push(gotoLineDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
