# Dual Text Paste

A Stream Deck plugin that pastes one configurable text string on a short press and a different configurable text string on a long press.

## Features

- Configure separate short-press and long-press text for each Stream Deck key
- Store the text in the Stream Deck action settings instead of hard-coding it in the plugin
- Set the long-press threshold in milliseconds
- Paste text through the Windows clipboard
- Supports punctuation and multiline text
- Each key can be configured independently

## Installation

1. Install the Stream Deck software.
2. Download `com.kbowery.dualtextpaste.streamDeckPlugin`.
3. Double-click `com.kbowery.dualtextpaste.streamDeckPlugin`.
4. Stream Deck will install the plugin.
5. Open the Stream Deck application.
6. Find **Dual Text Paste** in the action list.
7. Drag **Dual Text Paste** onto a Stream Deck key.

> The `.streamDeckPlugin` file must be created with the Elgato Stream Deck CLI before it can be downloaded and installed. See the **Packaging** section below.

## Configuring Text

After adding the action to a key:

1. Select the key in Stream Deck.
2. Enter the desired message in **Short-press text**.
3. Enter the alternate message in **Long-press text**.
4. Adjust **Long-press threshold (ms)** if desired.

Each key stores its own settings, so different keys can paste different messages.

## Using the Key

### Short Press

Tap the key and release it before the long-press threshold is reached. The plugin pastes the configured short-press text.

### Long Press

Hold the key until the long-press threshold is reached, then release it. The plugin pastes the configured long-press text instead of the short-press text.

The default threshold is **600 milliseconds**. The setting can be adjusted in the Stream Deck action properties.

## Packaging

To build the plugin from source on Windows:

1. Install Node.js and the Elgato Stream Deck CLI.
2. Open PowerShell in the project directory.
3. Build the plugin:

   ```powershell
   npm.cmd run build
   ```

4. Validate the plugin bundle:

   ```powershell
   streamdeck.cmd validate .\com.kbowery.dualtextpaste.sdPlugin
   ```

5. Package the plugin installer:

   ```powershell
   streamdeck.cmd pack .\com.kbowery.dualtextpaste.sdPlugin
   ```

The CLI should produce a `.streamDeckPlugin` installer. Confirm the output filename and location reported by the CLI before sharing or committing a release.

## Requirements

- Windows 10 or later
- Stream Deck software 7.1 or later
- Stream Deck hardware
- Node.js and the Elgato Stream Deck CLI to build and package from source

## Notes

- This version is designed for Windows. It uses PowerShell to set the clipboard and send `Ctrl+V` to the currently focused application.
- Pasting replaces the current clipboard contents.
- The target application must be focused and able to receive pasted text.
- A key press selects one of the two configured strings based on how long the key is held. The text is pasted when the key is released.
- If a text field is empty, the plugin does not paste text for that press.

## Version

**0.1.0.0**

## Author

**kBowery**
