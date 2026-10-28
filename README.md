
# Dual Text Paste

A Stream Deck plugin that pastes configurable text when a key is tapped or held. It supports optional HTML clipboard content for rich formatting in compatible applications such as Google Chat.

## Features

- Configure separate short-press and long-press content for each Stream Deck key
- Configure messages in the Stream Deck action properties instead of hard-coding text
- Optional HTML fields for rich formatting, including colors, bold text, and line breaks
- Copies both HTML and plain-text clipboard formats when HTML is configured
- Configurable long-press threshold
- Each key can be configured independently
- Uses the Windows clipboard and paste shortcut

## Installation

1. Install the Stream Deck software.
2. Download the packaged `.streamDeckPlugin` installer.
3. Double-click the installer.
4. Stream Deck will install the plugin.
5. Open the Stream Deck application.
6. Find **Dual Text Paste** in the action list.
7. Drag **Dual Text Paste** onto a Stream Deck key.

## Configuring a Key

After adding the action to a key:

1. Select the key in Stream Deck.
2. Enter the desired plain text in **Short-press text (fallback)**.
3. Optionally enter formatted HTML in **Short-press HTML (optional)**.
4. Enter the desired plain text in **Long-press text (fallback)**.
5. Optionally enter formatted HTML in **Long-press HTML (optional)**.
6. Adjust **Long-press threshold (ms)** if desired.

Each key stores its own settings, so different keys can paste different messages.

### Example HTML

This example makes the first line green and bold:

```html
<div>
  <span style="color:#4caf50"><b>GREEN TEXT</b></span>
  <br>
  <b>ckecks okay.</b>
  <br>
  <b>what's being run</b>
</div>
```

Enter the corresponding plain-text version in the fallback field as well. Applications that accept HTML clipboard data can preserve rich formatting; applications that only accept plain text can use the fallback.

## Using the Key

### Short Press

Tap the key and release it before the long-press threshold is reached. The plugin pastes the configured short-press content.

### Long Press

Hold the key until the long-press threshold is reached, then release it. The plugin pastes the configured long-press content instead of the short-press content.

The default threshold is **600 milliseconds**. Adjust it in the Stream Deck action properties.

## Packaging from Source

To build and package the plugin on Windows:

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

5. Package the installer:

   ```powershell
   streamdeck.cmd pack .\com.kbowery.dualtextpaste.sdPlugin
   ```

6. Locate the generated `.streamDeckPlugin` file using the path reported by the CLI.
7. Install and test the package before distributing it.

## Requirements

- Windows 10 or later
- Stream Deck software 7.1 or later
- Stream Deck hardware
- Node.js and the Elgato Stream Deck CLI to build and package from source

## Notes

- This version is designed for Windows. It uses PowerShell to set the clipboard and send `Ctrl+V` to the currently focused application.
- Pasting replaces the current clipboard contents.
- The target application must be focused and able to receive pasted text.
- When HTML is configured, the plugin provides both plain-text and HTML clipboard data. The receiving application determines whether and how to preserve HTML formatting.
- Enter HTML in the HTML field and a plain-text fallback in the matching text field.
- The selected content is pasted when the key is released.
- If the selected plain-text field is empty, the plugin does not paste text for that press.

## Version

**0.2.0.0**

## Author

**kBowery**
