# 📄 Auto Report Generator

**Auto Report Generator** is a **Node.js** library that enables automatic PDF report generation from QA Automation test results. This library is designed to help **testers & developers** generate clean, structured, and easy-to-read test reports without handling manual rendering complexities.

## ✨ Key Features

-   ✅ **Automated Reports** – Convert automated test results into a PDF report.
-   ✅ **Customizable Templates** – Add test details, status, screenshots, and other elements.
-   ✅ **Multi-Framework Support** – Compatible with Selenium, Cypress, Playwright, and more.
-   ✅ **Easy Export** – Save reports as files or send them via email.
-   ✅ **Test Summary & Details** – Provides test statistics, pass/fail status, and error details.
-   ✅ **Fast Performance** – Built for high efficiency to generate PDFs within seconds.

## 🔧 Installation

Use npm to install this library:

```sh
npm install @muhammaddavid16/auto-report-generator
```

## 🚀 Usage Example

```typescript
import { ReportGenerator, Project, TestCase } from "@muhammaddavid16/auto-report-generator";

const project: Project = {
    name: "Oracle HRM",
    module: "Login",
    activity: "Regression Testing",
    tool: "Playwright",
    author: "AUTOMATION_TEAM",
    scenarioId: "SCN_Login",
};

const testCases: TestCase[] = [
    {
        name: "SCN_001_TC_001",
        steps: [
            {
                title: "Open Browser",
                description: "Open Chrome browser.",
                imageUrl: "images/step-1.jpg",
                status: "Passed",
                device: "web",
            },
        ],
    },
    {
        name: "SCN_001_TC_002",
        steps: [
            {
                title: "Input login data",
                description: "Enter username and password.",
                imageUrl: "images/step-2.jpg",
                status: "Done",
                device: "web",
            },
            {
                title: "Login",
                description: "System successfully logs in.",
                imageUrl: "images/step-3.jpg",
                status: "Passed",
                device: "web",
            },
        ],
    },
];
const reportGenerator = new ReportGenerator(project, testCases, { filePath: `example.pdf` });
reportGenerator.generateReport();
```

## 📌 When Should You Use This Library?

-   To automatically generate **UI Automation** test reports.
-   To create **regression testing reports** in PDF format.
-   To document **automated test results** with a standardized format.

## 🛠 API

### `generatePDF(data, outputFilePath)`

| Parameter   | Type   | Description                                  |
| ----------- | ------ | -------------------------------------------- |
| `project`   | Object | Basic information about the test project.    |
| `testSteps` | Object | Test steps along with their statuses.        |
| `options`   | Object | Additional options for report configuration. |

## 📢 Contribution & Support

This library is **open-source**, and we always welcome contributions from the community! If you find any bugs or want to add new features, please create an **issue** or **pull request** on [GitHub](https://github.com/muhammaddavid16/auto-report-generator).

## 📜 License

This library is released under the **MIT** license. Feel free to use and modify it as needed.

---

🚀 **Start using Auto Report Generator now and generate reports effortlessly!**
