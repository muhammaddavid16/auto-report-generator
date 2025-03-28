export type TOCEntry = {
    title?: string;
    step?: string;
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

export type TestStatus = "Done" | "Passed" | "Failed";

export type TestCase = {
    name: string;
    step: TestStep[];
};

export type TestStep = {
    title: string;
    description: string;
    image_url: string;
    status: TestStatus;
    device: "web" | "mobile";
};
