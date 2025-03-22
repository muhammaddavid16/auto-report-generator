export type TOCEntry = {
    title: string;
    page: number;
};

export type ReportGeneratorOptions = {
    filePath?: string;
    logoPath?: string;
};

export type Project = {
    name: string;
    module: string;
    activity: string;
    tool: string;
    author: string;
    scenarioId: string;
};

export type TestStep = {
    title: string;
    description: string;
    image_url: string;
    status: "Done" | "Passed" | "Failed";
    device: "web" | "mobile";
};
