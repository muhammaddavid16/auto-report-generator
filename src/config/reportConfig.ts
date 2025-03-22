type ReportConfig = {
    pageWidth: number;
    pageHeight: number;
    marginX: number;
    marginY: number;
    lineHeight: number;
    fontSize: {
        title: number;
        subtitle: number;
        text: number;
        sm: number;
    };
    fontFamily: {
        helvetica: string;
        times: string;
    };
    fontStyle: {
        normal: string;
        bold: string;
        italic: string;
        boldItalic: string;
    };
    logo: { dimension: "width" | "height"; size: number };
};

export const REPORT_CONFIG: ReportConfig = {
    pageWidth: 210,
    pageHeight: 297,
    marginX: 20,
    marginY: 10,
    lineHeight: 1,
    fontSize: {
        title: 26,
        subtitle: 16,
        text: 12,
        sm: 10,
    },
    fontFamily: {
        helvetica: "helvetica",
        times: "times",
    },
    fontStyle: {
        normal: "normal",
        bold: "bold",
        italic: "italic",
        boldItalic: "bolditalic",
    },
    logo: { dimension: "width", size: 30 },
};
