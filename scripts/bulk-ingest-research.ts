/**
 * Bulk Research Ingestion Script
 * 
 * Ingests all research papers from research-papers/to-ingest/
 * Supports .txt and .pdf files
 * Auto-extracts metadata from filename or PDF content
 */

// Load environment first
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import * as fs from 'fs/promises';
import * as path from 'path';
import pdfParse from 'pdf-parse';

const TO_INGEST_DIR = path.join(process.cwd(), 'research-papers', 'to-ingest');
const INGESTED_DIR = path.join(process.cwd(), 'research-papers', 'ingested');

interface PaperMetadata {
  title: string;
  authors: string[];
  year: number;
  type: 'paper' | 'article' | 'book' | 'report' | 'thesis';
  filename: string;
}

/**
 * Extract metadata from filename
 * Format: Author_Year_Title.txt
 * Example: Nishii_2016_StrategicAlignment.txt
 */
function extractMetadataFromFilename(filename: string): Partial<PaperMetadata> {
  const nameWithoutExt = filename.replace(/\.(txt|pdf)$/i, '');
  const parts = nameWithoutExt.split('_');
  
  if (parts.length >= 3) {
    const author = parts[0].replace(/([A-Z])/g, ' $1').trim(); // Handle CamelCase
    const year = parseInt(parts[1]);
    const title = parts.slice(2).join(' ').replace(/([A-Z])/g, ' $1').trim();
    
    if (!isNaN(year) && year > 1900 && year < 2100) {
      return {
        authors: [author],
        year,
        title,
      };
    }
  }
  
  // Fallback: try to extract year from anywhere in filename
  const yearMatch = nameWithoutExt.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return {
      year: parseInt(yearMatch[0]),
      title: nameWithoutExt.replace(yearMatch[0], '').replace(/_/g, ' ').trim(),
    };
  }
  
  return {
    title: nameWithoutExt.replace(/_/g, ' '),
  };
}

/**
 * Extract text from PDF file
 */
async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error: any) {
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
}

/**
 * Infer metadata from content (first few lines)
 */
function inferMetadataFromContent(content: string): Partial<PaperMetadata> {
  const lines = content.split('\n').slice(0, 20).map(l => l.trim()).filter(Boolean);
  
  // Look for title (usually first line or first heading)
  const title = lines[0] || 'Unknown Title';
  
  // Look for authors (often line 2 or after title)
  const authorsLine = lines.find(l => 
    l.match(/^([A-Z][a-z]+,?\s*)+(&|and)?\s*([A-Z][a-z]+)/) &&
    !l.match(/^(Abstract|Introduction|Keywords)/i)
  );
  
  let authors: string[] = [];
  if (authorsLine) {
    // Parse author names
    authors = authorsLine
      .split(/,|&|and/)
      .map(a => a.trim())
      .filter(a => a.length > 0 && a.length < 50);
  }
  
  // Look for year
  const yearMatch = content.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? parseInt(yearMatch[0]) : new Date().getFullYear();
  
  return { title, authors: authors.length > 0 ? authors : undefined, year };
}

async function bulkIngest() {
  console.log('📚 Bulk Research Ingestion\n');
  console.log('='.repeat(60));
  
  // Dynamic import after dotenv loads
  const { ingestFromText } = await import('../src/lib/rgrs/ingestion');
  
  try {
    // Check if directory exists
    try {
      await fs.access(TO_INGEST_DIR);
    } catch {
      console.error(`❌ Directory not found: ${TO_INGEST_DIR}`);
      console.log('\n💡 Create it with: mkdir -p research-papers/to-ingest');
      process.exit(1);
    }
    
    // Get all files
    const files = await fs.readdir(TO_INGEST_DIR);
    const txtFiles = files.filter(f => f.endsWith('.txt') || f.endsWith('.pdf'));
    
    if (txtFiles.length === 0) {
      console.log('📭 No files found in research-papers/to-ingest/');
      console.log('\n💡 Add .txt or .pdf files to that folder and run again.');
      console.log('   Examples:');
      console.log('   - research-papers/to-ingest/Nishii_2016_Strategy.pdf');
      console.log('   - research-papers/to-ingest/Grant_2021_Teams.txt');
      process.exit(0);
    }
    
    const pdfCount = txtFiles.filter(f => f.toLowerCase().endsWith('.pdf')).length;
    const txtCount = txtFiles.length - pdfCount;
    console.log(`\n📄 Found ${txtFiles.length} file(s) to ingest (${pdfCount} PDF, ${txtCount} TXT)\n`);
    
    const results: Array<{
      filename: string;
      status: 'success' | 'error';
      chunks?: number;
      error?: string;
    }> = [];
    
    // Process each file
    for (let i = 0; i < txtFiles.length; i++) {
      const filename = txtFiles[i];
      console.log(`\n[${i + 1}/${txtFiles.length}] Processing: ${filename}`);
      console.log('-'.repeat(60));
      
      try {
        const filePath = path.join(TO_INGEST_DIR, filename);
        const isPDF = filename.toLowerCase().endsWith('.pdf');
        
        // Extract text based on file type
        let content: string;
        if (isPDF) {
          console.log(`  📄 Extracting text from PDF...`);
          content = await extractTextFromPDF(filePath);
        } else {
          content = await fs.readFile(filePath, 'utf-8');
        }
        
        if (content.trim().length < 100) {
          throw new Error('File too short (< 100 chars). Might be empty or corrupted.');
        }
        
        // Extract metadata
        const filenameMetadata = extractMetadataFromFilename(filename);
        const contentMetadata = inferMetadataFromContent(content);
        
        const metadata: PaperMetadata = {
          title: filenameMetadata.title || contentMetadata.title || 'Unknown Title',
          authors: filenameMetadata.authors || contentMetadata.authors || ['Unknown Author'],
          year: filenameMetadata.year || contentMetadata.year || new Date().getFullYear(),
          type: 'paper',
          filename,
        };
        
        console.log(`  Title: ${metadata.title}`);
        console.log(`  Authors: ${metadata.authors.join(', ')}`);
        console.log(`  Year: ${metadata.year}`);
        console.log(`  Size: ${(content.length / 1024).toFixed(1)} KB`);
        
        // Ingest
        const result = await ingestFromText(
          metadata.title,
          metadata.authors,
          content,
          {
            type: metadata.type,
            publishedAt: new Date(`${metadata.year}-01-01`),
            vettingScore: 0.85, // Default moderate score
            metadata: {
              filename: metadata.filename,
              year: metadata.year,
              ingested_at: new Date().toISOString(),
            },
            extractFacts: false, // Skip for speed (can enable later)
          }
        );
        
        console.log(`  ✅ Chunks created: ${result.chunksCreated}`);
        console.log(`  ✅ Facts extracted: ${result.factsExtracted}`);
        
        // Move to ingested folder
        const ingestedPath = path.join(INGESTED_DIR, filename);
        await fs.rename(filePath, ingestedPath);
        console.log(`  ✅ Moved to ingested/`);
        
        results.push({
          filename,
          status: 'success',
          chunks: result.chunksCreated,
        });
        
      } catch (error: any) {
        console.error(`  ❌ Error: ${error.message}`);
        results.push({
          filename,
          status: 'error',
          error: error.message,
        });
        
        // Don't move failed files
      }
    }
    
    // Summary
    console.log('\n\n' + '='.repeat(60));
    console.log('📊 INGESTION SUMMARY');
    console.log('='.repeat(60));
    
    const successful = results.filter(r => r.status === 'success');
    const failed = results.filter(r => r.status === 'error');
    const totalChunks = successful.reduce((sum, r) => sum + (r.chunks || 0), 0);
    
    console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
    console.log(`❌ Failed: ${failed.length}/${results.length}`);
    console.log(`📦 Total chunks created: ${totalChunks}`);
    
    if (successful.length > 0) {
      console.log('\n✅ Successfully ingested:');
      successful.forEach(r => {
        console.log(`   - ${r.filename} (${r.chunks} chunks)`);
      });
    }
    
    if (failed.length > 0) {
      console.log('\n❌ Failed to ingest:');
      failed.forEach(r => {
        console.log(`   - ${r.filename}`);
        console.log(`     Error: ${r.error}`);
      });
    }
    
    console.log('\n🎯 Next steps:');
    console.log('   1. Test in your app - generate a framework');
    console.log('   2. You should now see citations from these papers!');
    console.log('   3. Add more papers to research-papers/to-ingest/ and run again');
    
    if (failed.length > 0) {
      console.log('\n💡 To fix failed files:');
      console.log('   - Check file format (must be .txt)');
      console.log('   - Ensure files have content (not empty)');
      console.log('   - Check filename format: Author_Year_Title.txt');
    }
    
    console.log('\n✨ Done!');
    
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

bulkIngest();

