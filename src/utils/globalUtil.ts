import { addDays } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { existsSync, mkdirSync, readFileSync } from "fs";

export class globalUtil {
    public static padText(text: string, length: number, char = " ", align = "left"): string {
        if (text.length >= length) return text;

        const padding = length - text.length;
        switch (align) {
            case "right":
                return char.repeat(padding) + text;
            case "center":
                const padLeft = Math.floor((length - text.length) / 2);
                const padRight = length - text.length - padLeft;
                return char.repeat(padLeft) + text + char.repeat(padRight);
            default:
                return text + char.repeat(padding);
        }
    }

    public static generateDate(
        days = 0,
        pattern = "dd/MM/yyyy",
        options: generateDateOptions = { timezone: "Asia/Jakarta" },
    ): string {
        const date = new Date();
        const formatDate = addDays(date, days);

        return formatInTimeZone(formatDate, options.timezone, pattern);
    }

    public static mkdirSync(path: string, options: { recursive: boolean } = { recursive: false }) {
        if (!existsSync(path)) {
            mkdirSync(path, { recursive: options.recursive });
        }
    }

    public static readFileSync(path: string): Buffer {
        return readFileSync(path);
    }
}

type generateDateOptions = {
    timezone: string;
};
