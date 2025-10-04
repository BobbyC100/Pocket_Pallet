import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { VisionFramework } from '@/lib/vision-framework-schema';

/**
 * Export Vision Framework to PDF
 */
export const exportToPDF = async (framework: VisionFramework, filename?: string) => {
  try {
    // Create a temporary container for the PDF content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '210mm'; // A4 width
    container.style.backgroundColor = 'white';
    container.style.color = 'black';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.padding = '20mm';
    container.style.lineHeight = '1.6';
    
    // Generate HTML content for the PDF
    container.innerHTML = generatePDFHTML(framework);
    
    // Add to DOM temporarily
    document.body.appendChild(container);
    
    // Convert to canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width in pixels at 96 DPI
      height: container.scrollHeight
    });
    
    // Remove temporary container
    document.body.removeChild(container);
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;
    
    // Add image to PDF
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Save the PDF
    const finalFilename = filename || `${framework.companyId}-vision-framework.pdf`;
    pdf.save(finalFilename);
    
    return { success: true, filename: finalFilename };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Generate HTML content for PDF export
 */
const generatePDFHTML = (framework: VisionFramework): string => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `
    <div style="max-width: 100%; font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #2563eb; padding-bottom: 20px;">
        <h1 style="color: #2563eb; font-size: 28px; margin: 0 0 10px 0;">Vision Framework</h1>
        <p style="color: #666; font-size: 16px; margin: 0;">${framework.companyId} • Generated ${formatDate(framework.updatedAt)}</p>
      </div>

      <!-- Vision Section -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2563eb; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 10px;">Vision</h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">Purpose</h3>
          <p style="margin: 0; font-size: 14px;">${framework.vision.purpose}</p>
        </div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
          <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">End State</h3>
          <p style="margin: 0; font-size: 14px;">${framework.vision.endState}</p>
        </div>
      </div>

      <!-- Mission Section -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2563eb; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 10px;">Mission</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">What We Do</h3>
            <p style="margin: 0; font-size: 14px;">${framework.mission.whatWeDo}</p>
          </div>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">Who For</h3>
            <p style="margin: 0; font-size: 14px;">${framework.mission.whoFor}</p>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">How We Win</h3>
          <p style="margin: 0; font-size: 14px;">${framework.mission.howWeWin}</p>
        </div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
          <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">Success Signals</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
            ${framework.mission.successSignals.map(signal => `<li>${signal}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- Operating Principles Section -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2563eb; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 10px;">Operating Principles</h2>
        ${framework.operatingPrinciples.map(principle => `
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">${principle.name}</h3>
            <p style="margin: 0 0 10px 0; font-size: 14px;">${principle.description}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div>
                <h4 style="color: #059669; font-size: 14px; margin: 0 0 5px 0;">Behaviors</h4>
                <ul style="margin: 0; padding-left: 15px; font-size: 12px;">
                  ${principle.behaviors.map(behavior => `<li>${behavior}</li>`).join('')}
                </ul>
              </div>
              <div>
                <h4 style="color: #dc2626; font-size: 14px; margin: 0 0 5px 0;">Anti-Behaviors</h4>
                <ul style="margin: 0; padding-left: 15px; font-size: 12px;">
                  ${principle.antiBehaviors.map(antiBehavior => `<li>${antiBehavior}</li>`).join('')}
                </ul>
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Objectives Section -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2563eb; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 10px;">Objectives</h2>
        ${framework.objectives.map(objective => `
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <h3 style="color: #374151; font-size: 16px; margin: 0;">${objective.statement}</h3>
              <div style="display: flex; gap: 10px; font-size: 12px; color: #666;">
                <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${objective.timespan}</span>
                <span style="background: #e5e7eb; padding: 4px 8px; border-radius: 4px;">${objective.owner}</span>
              </div>
            </div>
            <div>
              <h4 style="color: #374151; font-size: 14px; margin: 0 0 8px 0;">Key Results</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                ${objective.keyResults.map(kr => `
                  <div style="background: white; padding: 8px; border-radius: 4px; border: 1px solid #e5e7eb;">
                    <div style="font-weight: bold; font-size: 12px;">${kr.metric}</div>
                    <div style="font-size: 12px; color: #666;">${kr.target}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Brand Brief Section -->
      <div style="margin-bottom: 30px;">
        <h2 style="color: #2563eb; font-size: 20px; margin-bottom: 15px; border-left: 4px solid #2563eb; padding-left: 10px;">Brand Brief</h2>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
          <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">One Liner</h3>
          <p style="margin: 0; font-size: 14px; font-weight: bold;">${framework.brandBrief.oneLiner}</p>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">Positioning</h3>
            <p style="margin: 0; font-size: 14px;">${framework.brandBrief.positioning}</p>
          </div>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">Audience</h3>
            <p style="margin: 0; font-size: 14px;">${framework.brandBrief.audience}</p>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">Tone</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
              ${framework.brandBrief.tone.map(tone => `
                <span style="background: #2563eb; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${tone}</span>
              `).join('')}
            </div>
          </div>
          <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
            <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">Visual Cues</h3>
            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
              ${framework.brandBrief.visualCues.map(cue => `
                <span style="background: #059669; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${cue}</span>
              `).join('')}
            </div>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px;">
          <h3 style="color: #374151; font-size: 16px; margin: 0 0 8px 0;">Brand Story</h3>
          <p style="margin: 0; font-size: 14px;">${framework.brandBrief.story}</p>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px;">
        <p style="margin: 0;">Generated by Banyan • ${formatDate(framework.updatedAt)}</p>
      </div>
    </div>
  `;
};

/**
 * Export Vision Framework to Markdown
 */
export const exportToMarkdown = (framework: VisionFramework): string => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return `# Vision Framework

**Company:** ${framework.companyId}  
**Generated:** ${formatDate(framework.updatedAt)}

---

## Vision

### Purpose
${framework.vision.purpose}

### End State
${framework.vision.endState}

---

## Mission

### What We Do
${framework.mission.whatWeDo}

### Who For
${framework.mission.whoFor}

### How We Win
${framework.mission.howWeWin}

### Success Signals
${framework.mission.successSignals.map(signal => `- ${signal}`).join('\n')}

---

## Operating Principles

${framework.operatingPrinciples.map(principle => `
### ${principle.name}
${principle.description}

**Behaviors:**
${principle.behaviors.map(behavior => `- ${behavior}`).join('\n')}

**Anti-Behaviors:**
${principle.antiBehaviors.map(antiBehavior => `- ${antiBehavior}`).join('\n')}
`).join('\n')}

---

## Objectives

${framework.objectives.map(objective => `
### ${objective.statement}
**Timespan:** ${objective.timespan} | **Owner:** ${objective.owner}

**Key Results:**
${objective.keyResults.map(kr => `- **${kr.metric}:** ${kr.target}`).join('\n')}
`).join('\n')}

---

## Brand Brief

### One Liner
${framework.brandBrief.oneLiner}

### Positioning
${framework.brandBrief.positioning}

### Audience
${framework.brandBrief.audience}

### Tone
${framework.brandBrief.tone.map(tone => `- ${tone}`).join('\n')}

### Visual Cues
${framework.brandBrief.visualCues.map(cue => `- ${cue}`).join('\n')}

### Brand Story
${framework.brandBrief.story}

---

*Generated by Banyan • ${formatDate(framework.updatedAt)}*
`;
};
