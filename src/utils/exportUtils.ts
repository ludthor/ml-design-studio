import domToImage from 'dom-to-image-more';
import { jsPDF } from 'jspdf';
import type { Project } from '../types';
import { generateSummary } from './generateSummary';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadText(text: string, filename: string, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime });
  downloadBlob(blob, filename);
}

export function exportJSON(project: Project) {
  const json = JSON.stringify(project, null, 2);
  downloadText(json, `${slugify(project.projectTitle)}.json`, 'application/json');
}

export function exportSummaryText(project: Project) {
  const summary = generateSummary(project);
  downloadText(summary, `${slugify(project.projectTitle)}-summary.txt`);
}

export async function exportPNG(canvasElement: HTMLElement): Promise<Blob> {
  const blob = await domToImage.toBlob(canvasElement, {
    bgcolor: '#f8fafc',
    style: {
      transform: 'none',
    },
  });
  return blob;
}

export async function downloadPNG(canvasElement: HTMLElement, title: string) {
  const blob = await exportPNG(canvasElement);
  downloadBlob(blob, `${slugify(title)}.png`);
}

export async function exportPDF(
  canvasElement: HTMLElement,
  project: Project
) {
  const imgBlob = await exportPNG(canvasElement);
  const imgUrl = URL.createObjectURL(imgBlob);

  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = imgUrl;
    });

    const pdf = new jsPDF({
      orientation: img.width > img.height ? 'landscape' : 'portrait',
      unit: 'pt',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;

    // Title
    pdf.setFontSize(20);
    pdf.text(project.projectTitle, margin, margin + 20);
    pdf.setFontSize(10);
    pdf.text(
      `Generated: ${new Date().toLocaleDateString()}`,
      margin,
      margin + 38
    );

    // Canvas image — fit to page width
    const imgAspect = img.width / img.height;
    const availWidth = pageWidth - margin * 2;
    const imgDisplayWidth = availWidth;
    const imgDisplayHeight = availWidth / imgAspect;
    const imgY = margin + 52;

    if (imgDisplayHeight + imgY < pageHeight - margin) {
      pdf.addImage(imgUrl, 'PNG', margin, imgY, imgDisplayWidth, imgDisplayHeight);
    } else {
      // Scale down to fit
      const maxH = pageHeight - imgY - margin;
      const scale = maxH / imgDisplayHeight;
      pdf.addImage(
        imgUrl,
        'PNG',
        margin,
        imgY,
        imgDisplayWidth * scale,
        imgDisplayHeight * scale
      );
    }

    // Summary on next page
    pdf.addPage();
    pdf.setFontSize(14);
    pdf.text('Project Summary', margin, margin + 20);
    pdf.setFontSize(10);

    const summary = generateSummary(project);
    const lines = pdf.splitTextToSize(summary, pageWidth - margin * 2);
    let y = margin + 40;
    for (const line of lines) {
      if (y > pageHeight - margin) {
        pdf.addPage();
        y = margin + 20;
      }
      pdf.text(line, margin, y);
      y += 14;
    }

    pdf.save(`${slugify(project.projectTitle)}.pdf`);
  } finally {
    URL.revokeObjectURL(imgUrl);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    || 'project';
}
