import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { REPORT_CONFIG as config } from "../config/reportConfig";
import { IReportGenerator } from "../interfaces/reportGeneratorInterface";
import { Project, ReportGeneratorOptions, TestCase, TOCEntry } from "../types/reportGeneratorType";
import { globalUtil } from "../utils/globalUtil";
import path from "path";

export class newReportGenerator implements IReportGenerator {
    private doc: jsPDF;
    private tocEntries: TOCEntry[];
    private totalTOCPage: number;
    private totalDocumentSummaryPage: number;

    constructor(private project: Project, private testCases: TestCase[], private options?: ReportGeneratorOptions) {
        this.doc = new jsPDF({ orientation: "p", unit: "mm", format: [config.pageWidth, config.pageHeight] });

        this.tocEntries = [
            { title: "Table of Content", page: 1 },
            { title: "Document Summary", page: 2 },
        ];

        this.totalTOCPage = 1;
        this.totalDocumentSummaryPage = 1;
    }

    private addImage(
        url: string,
        dimension: "width" | "height",
        size: number,
        x: number,
        y: number,
    ): { w: number; h: number } {
        const imageBytes = globalUtil.readFileSync(url);
        const { width: oldWidth, height: oldHeight, fileType: format } = this.doc.getImageProperties(imageBytes);

        if (dimension === "height") {
            const newWidth = (oldWidth * size) / oldHeight;
            this.doc.addImage(imageBytes, format, x, y, newWidth, size);
            return { w: newWidth, h: size };
        }

        const newHeight = (oldHeight * size) / oldWidth;
        this.doc.addImage(imageBytes, format, x, y, size, newHeight);
        return { w: size, h: newHeight };
    }

    private addTestStepImage(
        url: string,
        dimension: "width" | "height",
        size: number,
        y: number,
    ): { w: number; h: number } {
        const imageBytes = globalUtil.readFileSync(url);
        const { width: oldWidth, height: oldHeight, fileType: format } = this.doc.getImageProperties(imageBytes);

        if (dimension === "height") {
            const newWidth = (oldWidth * size) / oldHeight;
            this.doc.addImage(imageBytes, format, (config.pageWidth - newWidth) / 2, y, newWidth, size);
            return { w: newWidth, h: size };
        }

        const newHeight = (oldHeight * size) / oldWidth;
        this.doc.addImage(imageBytes, format, config.marginX, y, size, newHeight);
        return { w: size, h: newHeight };
    }

    private createHeader(): void {
        const body = [
            ["Title", this.project.name],
            ["Author", this.project.author],
            ["Tools", this.project.tool],
            ["Scenario Id", this.project.scenarioId],
        ];
        autoTable(this.doc, {
            body,
            theme: "grid",
            startY: config.marginY,
            margin: { horizontal: config.marginX },
            styles: {
                font: "times",
                fontStyle: "italic",
                fontSize: 10,
                cellPadding: { horizontal: 2.5, vertical: 0.2 },
                lineColor: [0, 0, 0],
            },
            columnStyles: { 0: { cellWidth: 30 } },
            didParseCell: (data) => {
                if (data.row.index === 0 && data.column.index === 1) {
                    data.cell.styles.fontStyle = "bolditalic";
                }
            },
        });
    }

    private addPage(): void {
        this.doc.addPage();
        this.createHeader();
    }

    private createAllPage(): void {
        for (let i = 0; i < this.totalTOCPage + this.totalDocumentSummaryPage; i++) {
            this.addPage();
        }
    }

    private generateFormattedLine(content: string, pageWidth: number, char = " ", pageNumber?: number): string {
        const contentWidth = this.doc.getTextWidth(content);
        if (pageNumber) {
            const pageNumberWidth = this.doc.getTextWidth(pageNumber.toString());
            const padding = pageWidth - contentWidth - pageNumberWidth;
            const charWidth = this.doc.getTextWidth(char);
            const charCount = Math.floor(padding / charWidth);
            const charString = char.repeat(charCount);
            return content + charString + pageNumber;
        } else {
            const padding = pageWidth - contentWidth;
            const charWidth = this.doc.getTextWidth(char);
            const charCount = Math.floor(padding / charWidth);
            const charString = char.repeat(charCount);
            return content + charString;
        }
    }

    private addPageNumber(): void {
        // Add page number
        const totalPage = this.doc.getNumberOfPages();
        for (let i = 2; i <= totalPage; i++) {
            this.doc.setPage(i);
            this.doc.setFont(config.fontFamily.times, config.fontStyle.italic);
            this.doc.setFontSize(config.fontSize.sm);

            // Add confidential
            const confidential = "Confidential";
            this.doc.text(confidential, config.marginX, config.pageHeight - config.marginY);

            // Add project
            const { w: projectWidth, h: projectHeight } = this.doc.getTextDimensions(this.project.name);
            this.doc.text(this.project.name, (config.pageWidth - projectWidth) / 2, config.pageHeight - config.marginY);

            // Add page number
            const currentPage = this.doc.getCurrentPageInfo().pageNumber - 1;
            const totalPage = this.doc.getNumberOfPages() - 1;
            const pages = `Page ${currentPage} of ${totalPage}`;
            const { w: pagesWidth } = this.doc.getTextDimensions(pages);
            this.doc.text(pages, config.pageWidth - config.marginX - pagesWidth, config.pageHeight - config.marginY);

            // Add lane
            this.doc.setDrawColor(0, 0, 0);
            this.doc.line(
                config.marginX,
                config.pageHeight - config.marginY - projectHeight - config.lineHeight,
                config.pageWidth - config.marginX,
                config.pageHeight - config.marginY - projectHeight - config.lineHeight,
            );
        }
    }

    private generateCover(): void {
        // Add logo
        if (this.options?.logoPath) {
            const logoWidth = config.logo.size;
            this.addImage(
                this.options.logoPath,
                config.logo.dimension,
                logoWidth,
                config.pageWidth - config.marginX - logoWidth,
                20,
            );
        }

        // Add title
        this.doc.setFont(config.fontFamily.times, config.fontStyle.bold);
        this.doc.setFontSize(config.fontSize.title);
        const { w: titleWidth, h: titleHeight } = this.doc.getTextDimensions(this.project.name);
        this.doc.text(
            this.project.name,
            config.pageWidth - config.marginX - titleWidth,
            (config.pageHeight - titleHeight) / 2,
        );

        // Add activity
        this.doc.setFont(config.fontFamily.times, config.fontStyle.italic);
        this.doc.setFontSize(config.fontSize.subtitle);
        const { w: activityWidth } = this.doc.getTextDimensions(this.project.activity);
        this.doc.text(
            this.project.activity,
            config.pageWidth - config.marginX - activityWidth,
            (config.pageHeight - titleHeight) / 2 + titleHeight,
        );

        // Add author
        this.doc.setFont(config.fontFamily.times, config.fontStyle.normal);
        this.doc.setFontSize(config.fontSize.text);
        const author = globalUtil.padText("Author", 14) + `: ${this.project.author}`;
        const { h: authorHeight } = this.doc.getTextDimensions(author);
        this.doc.text(author, 65, config.pageHeight - 30 - authorHeight - config.lineHeight);

        // Add scenario id
        const scenarioId = `Scenario Id : ${this.project.scenarioId}`;
        this.doc.text(scenarioId, 65, config.pageHeight - 30);

        // Add new page
        this.addPage();
    }

    private generateTOC(): void {
        let page = 2;
        this.doc.setPage(page);

        // Title: Table of Content
        const title = "Table of Content";
        this.doc.setFont(config.fontFamily.helvetica, config.fontStyle.bold);
        this.doc.setFontSize(config.fontSize.subtitle);
        const { w: titleWidth, h: titleHeight } = this.doc.getTextDimensions(title);
        this.doc.text(title, (config.pageWidth - titleWidth) / 2, 37);

        // Add table of content
        this.doc.setFont(config.fontFamily.times, config.fontStyle.normal);
        this.doc.setFontSize(config.fontSize.text);
        const { h: tocHeight } = this.doc.getTextDimensions(title);

        let numberIndex = 1;
        this.tocEntries.forEach((entry: TOCEntry) => {
            const padding = config.pageWidth - config.marginX * 2;
            const listContent = this.generateFormattedLine(entry.title, padding, ".", entry.page);
            const currentLine = (page === 2 ? 35 + titleHeight : 34) + (tocHeight + config.lineHeight) * numberIndex;
            this.doc.textWithLink(listContent, config.marginX, currentLine, {
                pageNumber: entry.page + 1,
            });

            if (currentLine > config.pageHeight - config.marginY - 13) {
                page++;
                numberIndex = 1;

                // Change page
                this.doc.setPage(page);
            }
            numberIndex++;
        });
    }

    private generateDocumentSummary(): void {
        let page = 1 + this.totalTOCPage + 1;
        this.doc.setPage(page);

        // Title: Document Summary
        const title = "Document Summary";
        this.doc.setFont(config.fontFamily.helvetica, config.fontStyle.bold);
        this.doc.setFontSize(config.fontSize.subtitle);
        const { w: titleWidth, h: titleHeight } = this.doc.getTextDimensions(title);
        this.doc.text(title, (config.pageWidth - titleWidth) / 2, 37);

        // Add status table
        const statusHeader = [["Total Passed", "Total Failed", "Total Done", "Total"]];
        const passedTotal = 10;
        const failedTotal = 10;
        const doneTotal = 10;
        const total = 10;
        const statusBody = [[passedTotal, failedTotal, doneTotal, total]];
        autoTable(this.doc, {
            head: statusHeader,
            body: statusBody,
            horizontalPageBreak: true,
            startY: 37 + titleHeight,
            margin: { horizontal: config.marginX },
            theme: "grid",
            headStyles: {
                fillColor: [130, 130, 130],
                textColor: [255, 255, 255],
                lineColor: [0, 0, 0],
            },
            styles: {
                font: "times",
                fontStyle: "bold",
                fontSize: 10,
                halign: "center",
                cellPadding: { horizontal: 2.5, vertical: 0.5 },
                lineColor: [0, 0, 0],
            },
            didParseCell: (data) => {
                if (data.section === "body" && data.column.index === 0) {
                    data.cell.styles.textColor = [0, 128, 0];
                } else if (data.section === "body" && data.column.index === 1) {
                    data.cell.styles.textColor = [255, 0, 0];
                }
            },
        });

        // Add step table
        const stepHeader = [["Test Case Name", "TC Step Name", "Status"]];
        const stepBody = this.testCases.flatMap((testCase) =>
            testCase.step.map((step, i) => [i === 0 ? testCase.name : "", `${i + 1}. ${step.title}`, step.status]),
        );
        autoTable(this.doc, {
            head: stepHeader,
            body: stepBody,
            startY: 37 + titleHeight + 15,
            margin: { horizontal: config.marginX, top: 34, bottom: config.marginY + 10 },
            theme: "grid",
            headStyles: {
                fillColor: [130, 130, 130],
                textColor: [255, 255, 255],
                fontStyle: "bold",
                halign: "center",
                lineColor: [0, 0, 0],
            },
            styles: {
                textColor: [0, 0, 0],
                font: "times",
                fontStyle: "normal",
                fontSize: 10,
                cellPadding: { horizontal: 1.5, vertical: 0.5 },
                lineColor: [0, 0, 0],
            },
            columnStyles: { 0: { cellWidth: 60 }, 2: { cellWidth: 25 } },
            didParseCell: (data) => {
                // Set status color
                if (data.section === "body" && data.column.index === 2) {
                    data.cell.styles.fontStyle = "bold";
                    data.cell.styles.halign = "center";
                    if (data.cell.raw === "Passed") data.cell.styles.textColor = [0, 128, 0];
                    else if (data.cell.raw === "Failed") data.cell.styles.textColor = [255, 0, 0];
                }
            },
            didDrawPage: (data) => {
                // Create header
                if (data.pageNumber > 1) {
                    this.createHeader();
                }
            },
        });
    }

    // private generateTestCase(): void {
    //     let currentY = 40;
    //     let stepCount = 0;
    //     const maxWidth = config.pageWidth - config.marginX * 2;

    //     this.testCases.forEach((testCase, i) => {
    //         if (stepCount > 1) {
    //             this.addPage();
    //             currentY = 40;
    //             stepCount = 0;
    //         }

    //         // Highlight status
    //         if (testCase.status === "Passed") this.doc.setTextColor(0, 128, 0);
    //         if (testCase.status === "Failed") this.doc.setTextColor(255, 0, 0);

    //         // Set title font
    //         this.doc.setFont(config.fontFamily.times, config.fontStyle.bold);
    //         this.doc.setFontSize(config.fontSize.text);

    //         // Add title
    //         this.doc.text(`${i + 1}. ${testCase.title}`, config.marginX, currentY, { maxWidth });
    //         const { h: titleHeight } = this.doc.getTextDimensions(testCase.title);
    //         currentY += titleHeight;

    //         // Add image
    //         switch (testCase.device) {
    //             case "mobile":
    //                 const height = 88;
    //                 const newImageMobileSize = this.addTestStepImage(testCase.image_url, "height", height, currentY);
    //                 currentY += newImageMobileSize.h + 5;
    //                 break;
    //             default:
    //                 const newImageWebSize = this.addTestStepImage(
    //                     testCase.image_url,
    //                     "width",
    //                     config.pageWidth - config.marginX * 2,
    //                     currentY,
    //                 );
    //                 currentY += newImageWebSize.h + 5;
    //                 break;
    //         }

    //         // Add description
    //         this.doc.setTextColor(0, 0, 0);
    //         this.doc.setFont(config.fontFamily.times, config.fontStyle.normal);
    //         this.doc.setFontSize(config.fontSize.sm);
    //         this.doc.text(testCase.description, config.marginX, currentY, { maxWidth });

    //         currentY += 20;
    //         stepCount++;
    //     });
    // }

    private generatePdf(): void {
        if (this.options?.filePath) {
            globalUtil.mkdirSync(path.dirname(this.options.filePath));
        }
        this.doc.save(this.options?.filePath);
    }

    public generateReport(): void {
        this.generateCover();
        this.createAllPage();
        // this.generateTestCase();
        this.generateTOC();
        this.generateDocumentSummary();
        this.addPageNumber();
        this.generatePdf();
    }
}
