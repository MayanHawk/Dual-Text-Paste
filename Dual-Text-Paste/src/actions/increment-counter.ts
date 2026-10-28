
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

        const text = heldFor >= threshold
            ? settings.longText
            : settings.shortText;

        if (typeof text !== "string" || text.length === 0) {
            return;
        }

        try {
            await pasteText(text);
        } catch (error) {
            console.error("Dual Text Paste failed:", error);
        }
    }
}

function pasteText(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Base64 keeps quotes, newlines, and special characters safe
        // when passing the configured text into PowerShell.
        const textBase64 = Buffer.from(text, "utf8").toString("base64");

        const script = [
            "Add-Type -AssemblyName System.Windows.Forms",
            `$text = [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String('${textBase64}'))`,
            "Set-Clipboard -Value $text",
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
