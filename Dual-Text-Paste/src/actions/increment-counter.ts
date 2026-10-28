
import { spawn } from "node:child_process";
import {
    action,
    type KeyDownEvent,
    type KeyUpEvent,
    SingletonAction,
} from "@elgato/streamdeck";

type DualTextPasteSettings = {
    shortText?: string;
    longText?: string;
    shortHtml?: string;
    longHtml?: string;
    longPressMs?: number;
};

@action({ UUID: "com.kbowery.dualtextpaste.paste" })
export class DualTextPaste extends SingletonAction<DualTextPasteSettings> {
    private readonly pressStartedAt = new Map<string, number>();

    override onKeyDown(ev: KeyDownEvent<DualTextPasteSettings>): void {
        this.pressStartedAt.set(ev.action.id, Date.now());
    }

    override async onKeyUp(ev: KeyUpEvent<DualTextPasteSettings>): Promise<void> {
        const startedAt = this.pressStartedAt.get(ev.action.id);
        this.pressStartedAt.delete(ev.action.id);

        if (startedAt === undefined) {
            return;
        }

        const settings = ev.payload.settings;
        const heldFor = Date.now() - startedAt;
        const threshold = Math.min(
            5000,
            Math.max(200, Number(settings.longPressMs) || 600),
        );

        const isLongPress = heldFor >= threshold;
        const text = isLongPress ? settings.longText : settings.shortText;
        const html = isLongPress ? settings.longHtml : settings.shortHtml;

        if (typeof text !== "string" || text.length === 0) {
            return;
        }

        try {
            await pasteText(text, html);
        } catch (error) {
            console.error("Dual Text Paste failed:", error);
        }
    }
}

/**
 * Wrap an HTML fragment in the Windows CF_HTML clipboard format.
 * The offsets are byte offsets, not JavaScript character positions.
 */
function buildCfHtml(fragment: string): string {
    const prefix = "<html><body><!--StartFragment-->";
    const suffix = "<!--EndFragment--></body></html>";

    const headerTemplate =
        "Version:0.9\r\n" +
        "StartHTML:0000000000\r\n" +
        "EndHTML:0000000000\r\n" +
        "StartFragment:0000000000\r\n" +
        "EndFragment:0000000000\r\n";

    const startHTML = Buffer.byteLength(headerTemplate, "utf8");
    const startFragment =
        startHTML + Buffer.byteLength(prefix, "utf8");
    const endFragment =
        startFragment + Buffer.byteLength(fragment, "utf8");
    const endHTML =
        endFragment + Buffer.byteLength(suffix, "utf8");

    const header = headerTemplate
        .replace("StartHTML:0000000000", `StartHTML:${String(startHTML).padStart(10, "0")}`)
        .replace("EndHTML:0000000000", `EndHTML:${String(endHTML).padStart(10, "0")}`)
        .replace("StartFragment:0000000000", `StartFragment:${String(startFragment).padStart(10, "0")}`)
        .replace("EndFragment:0000000000", `EndFragment:${String(endFragment).padStart(10, "0")}`);

    return header + prefix + fragment + suffix;
}

function pasteText(text: string, html?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const textBase64 = Buffer.from(text, "utf8").toString("base64");
        const hasHtml = typeof html === "string" && html.trim().length > 0;
        const htmlBase64 = hasHtml
            ? Buffer.from(buildCfHtml(html!), "utf8").toString("base64")
            : "";

        const script = [
            "Add-Type -AssemblyName System.Windows.Forms",
            `$text = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${textBase64}'))`,
            "$data = New-Object System.Windows.Forms.DataObject",
            "$data.SetData([System.Windows.Forms.DataFormats]::UnicodeText, $text)",
            ...(hasHtml
                ? [
                    `$html = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${htmlBase64}'))`,
                    "$data.SetData([System.Windows.Forms.DataFormats]::Html, $html)",
                ]
                : []),
            "[System.Windows.Forms.Clipboard]::SetDataObject($data, $true)",
            "[System.Windows.Forms.SendKeys]::SendWait('^v')",
        ].join("\r\n");

        const encodedScript = Buffer.from(script, "utf16le").toString("base64");

        const child = spawn(
            "powershell.exe",
            [
                "-NoProfile",
                "-STA",
                "-NonInteractive",
                "-EncodedCommand",
                encodedScript,
            ],
            { windowsHide: true },
        );

        let stderr = "";

        child.stderr.on("data", (data: Buffer) => {
            stderr += data.toString();
        });

        child.on("error", reject);

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(stderr || `PowerShell exited with code ${code}`));
            }
        });
    });
}
