/**
 * Banyan Google Docs Workspace Add-on
 * 
 * This add-on integrates Banyan's AI-powered document generation into Google Docs.
 * It handles text selection, generation, and insertion with proper Named Ranges for stability.
 */

// ============================================================================
// Constants
// ============================================================================

const BANYAN_API_BASE = 'https://your-banyan-deployment.vercel.app'; // TODO: Update with actual URL
const NAMED_RANGE_PREFIX = 'BANYAN_TMP_RANGE';
const MAX_RETRIES = 3;
const RETRY_DELAYS = [250, 500, 1000]; // ms, exponential backoff

// ============================================================================
// Add-on Entry Points
// ============================================================================

/**
 * Runs when the add-on is installed or the document is opened.
 */
function onOpen(e) {
  DocumentApp.getUi()
    .createAddonMenu()
    .addItem('Start Banyan', 'showSidebar')
    .addToUi();
}

/**
 * Runs when the add-on is installed.
 */
function onInstall(e) {
  onOpen(e);
}

/**
 * Opens the add-on sidebar.
 */
function showSidebar() {
  const html = HtmlService.createHtmlOutputFromFile('Sidebar')
    .setTitle('Banyan AI Writer');
  DocumentApp.getUi().showSidebar(html);
}

/**
 * Homepage for the add-on card interface.
 */
function onHomepage(e) {
  return buildInputCard_();
}

// ============================================================================
// Card UI Builders
// ============================================================================

/**
 * Builds the main input card for collecting user parameters.
 */
function buildInputCard_() {
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Banyan AI Writer')
      .setSubtitle('Generate strategic documents'))
    .addSection(CardService.newCardSection()
      .setHeader('Document Details')
      .addWidget(CardService.newTextInput()
        .setFieldName('title')
        .setTitle('Title')
        .setHint('e.g., Product Strategy Q1 2025'))
      .addWidget(CardService.newTextInput()
        .setFieldName('audience')
        .setTitle('Audience')
        .setHint('e.g., Executive team, investors'))
      .addWidget(CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.DROPDOWN)
        .setFieldName('tone')
        .setTitle('Tone')
        .addItem('Professional', 'professional', true)
        .addItem('Casual', 'casual', false)
        .addItem('Technical', 'technical', false)
        .addItem('Executive', 'executive', false))
      .addWidget(CardService.newTextInput()
        .setFieldName('context')
        .setTitle('Additional Context')
        .setMultiline(true)
        .setHint('Any specific requirements or background information')))
    .addSection(CardService.newCardSection()
      .setHeader('Output Destination')
      .addWidget(CardService.newSelectionInput()
        .setType(CardService.SelectionInputType.RADIO_BUTTON)
        .setFieldName('destination')
        .setTitle('Where should the content go?')
        .addItem('Insert at cursor', 'insert_here', true)
        .addItem('Replace selected text', 'replace_selection', false)
        .addItem('Create new document', 'new_doc', false)))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Generate')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('handleGenerate')
            .setLoadIndicator(CardService.LoadIndicator.SPINNER)))));

  return card.build();
}

/**
 * Builds a preview card showing generated content before insertion.
 */
function buildPreviewCard_(spec, destination) {
  const preview = generatePreviewText_(spec);
  
  const card = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Preview')
      .setSubtitle('Review before inserting'))
    .addSection(CardService.newCardSection()
      .setHeader('Generated Content')
      .addWidget(CardService.newTextParagraph()
        .setText('<b>Title:</b> ' + (spec.title || 'Untitled')))
      .addWidget(CardService.newTextParagraph()
        .setText('<font color="#666666">' + preview.substring(0, 500) + 
                 (preview.length > 500 ? '...' : '') + '</font>')))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newButtonSet()
        .addButton(CardService.newTextButton()
          .setText('Insert into Doc')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('handleInsert')
            .setLoadIndicator(CardService.LoadIndicator.SPINNER))
          .setTextButtonStyle(CardService.TextButtonStyle.FILLED))
        .addButton(CardService.newTextButton()
          .setText('Cancel')
          .setOnClickAction(CardService.newAction()
            .setFunctionName('handleCancel')))));

  return card.build();
}

/**
 * Builds an error card with retry option.
 */
function buildErrorCard_(message, canRetry) {
  const section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph()
      .setText('<font color="#d32f2f">⚠️ ' + message + '</font>'));

  if (canRetry) {
    section.addWidget(CardService.newButtonSet()
      .addButton(CardService.newTextButton()
        .setText('Try Again')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('handleRetry')
          .setLoadIndicator(CardService.LoadIndicator.SPINNER)))
      .addButton(CardService.newTextButton()
        .setText('Back')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('handleCancel'))));
  } else {
    section.addWidget(CardService.newButtonSet()
      .addButton(CardService.newTextButton()
        .setText('Back')
        .setOnClickAction(CardService.newAction()
          .setFunctionName('handleCancel'))));
  }

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Error')
      .setSubtitle('Something went wrong'))
    .addSection(section)
    .build();
}

/**
 * Builds a progress card showing generation status.
 */
function buildProgressCard_(stage) {
  const stages = {
    'analyzing': 'Analyzing your request...',
    'generating': 'Generating content...',
    'formatting': 'Formatting document...',
    'finalizing': 'Almost done...'
  };

  return CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader()
      .setTitle('Generating')
      .setSubtitle('Banyan is working'))
    .addSection(CardService.newCardSection()
      .addWidget(CardService.newTextParagraph()
        .setText('⏳ ' + (stages[stage] || 'Processing...'))))
    .build();
}

// ============================================================================
// Action Handlers
// ============================================================================

/**
 * Handles the Generate button click.
 * Validates input, marks selection if needed, and calls Banyan API.
 */
function handleGenerate(e) {
  try {
    // Extract form values
    const formInput = e.formInput || {};
    const title = formInput.title || 'Untitled Document';
    const audience = formInput.audience || '';
    const tone = formInput.tone || 'professional';
    const context = formInput.context || '';
    const destination = formInput.destination || 'insert_here';

    // Validate required fields
    if (!title.trim()) {
      return buildErrorCard_('Please provide a title for your document.', false);
    }

    // Store destination preference
    const up = PropertiesService.getUserProperties();
    up.setProperty('destination', destination);

    // If replacing selection, mark it with a Named Range
    if (destination === 'replace_selection') {
      try {
        const mark = getDocsSelectionAndMark_();
        up.setProperty('banyan_tmp_range_name', mark.name);
        up.setProperty('banyan_tmp_range_id', mark.id);
      } catch (err) {
        return buildErrorCard_('Please select text in the document before choosing "Replace selected text".', false);
      }
    }

    // Store the document ID
    const docId = DocumentApp.getActiveDocument().getId();
    up.setProperty('banyan_doc_id', docId);

    // Call Banyan API with retry logic
    const spec = callBanyanAPI_({
      title: title,
      audience: audience,
      tone: tone,
      context: context
    }, 0);

    // Store the generated spec
    up.setProperty('banyan_spec', JSON.stringify(spec));

    // Return preview card
    return buildPreviewCard_(spec, destination);

  } catch (err) {
    Logger.log('Error in handleGenerate: ' + err.toString());
    const canRetry = err.toString().includes('429') || err.toString().includes('5');
    return buildErrorCard_(err.toString(), canRetry);
  }
}

/**
 * Handles retry after an error.
 */
function handleRetry(e) {
  return handleGenerate(e);
}

/**
 * Handles the Insert button click.
 * Writes the generated content to the document.
 */
function handleInsert(e) {
  try {
    const up = PropertiesService.getUserProperties();
    const spec = JSON.parse(up.getProperty('banyan_spec') || '{}');
    const destination = up.getProperty('destination') || 'insert_here';
    const docId = up.getProperty('banyan_doc_id');

    let selectionRange = null;

    // If replacing selection, resolve the Named Range to indexes
    if (destination === 'replace_selection') {
      const rangeName = up.getProperty('banyan_tmp_range_name');
      if (rangeName) {
        selectionRange = getRangeIndexesFromNamedRange_(docId, rangeName);
      }
    }

    // Write to document
    if (destination === 'new_doc') {
      const newDoc = DocumentApp.create(spec.title || 'Untitled');
      writeSpecToDoc_(newDoc.getId(), spec, null);
      
      // Clean up
      up.deleteAllProperties();
      
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification()
          .setText('Created new document: ' + newDoc.getName()))
        .setNavigation(CardService.newNavigation().popCard())
        .build();
    } else {
      writeSpecToDoc_(docId, spec, selectionRange);
      
      // Clean up Named Range
      if (destination === 'replace_selection') {
        try {
          const doc = DocumentApp.openById(docId);
          const rangeName = up.getProperty('banyan_tmp_range_name');
          doc.getNamedRanges(rangeName).forEach(nr => nr.remove());
        } catch (cleanupErr) {
          Logger.log('Error cleaning up Named Range: ' + cleanupErr.toString());
        }
      }
      
      // Clean up properties
      up.deleteAllProperties();
      
      return CardService.newActionResponseBuilder()
        .setNotification(CardService.newNotification()
          .setText(selectionRange ? 'Replaced selection.' : 'Inserted content.'))
        .setNavigation(CardService.newNavigation().popCard())
        .build();
    }

  } catch (err) {
    Logger.log('Error in handleInsert: ' + err.toString());
    return buildErrorCard_('Failed to insert content: ' + err.toString(), false);
  }
}

/**
 * Handles cancel button - returns to input card.
 */
function handleCancel(e) {
  // Clean up any stored properties
  PropertiesService.getUserProperties().deleteAllProperties();
  
  return CardService.newActionResponseBuilder()
    .setNavigation(CardService.newNavigation().popToRoot())
    .build();
}

// ============================================================================
// Selection & Named Range Handling
// ============================================================================

/**
 * Gets the current selection and marks it with a temporary Named Range.
 * @returns {Object} Object with name and id of the created Named Range
 * @throws {Error} If no selection exists
 */
function getDocsSelectionAndMark_() {
  const doc = DocumentApp.getActiveDocument();
  const sel = doc.getSelection();
  
  if (!sel) {
    throw new Error('No selection in the document.');
  }

  // Generate unique name for this session
  const name = NAMED_RANGE_PREFIX + '_' + new Date().getTime();
  
  // Clean up any old ranges with our prefix
  doc.getNamedRanges().forEach(nr => {
    if (nr.getName().startsWith(NAMED_RANGE_PREFIX)) {
      nr.remove();
    }
  });

  // Create new Named Range for this selection
  const nr = doc.addNamedRange(name, sel.getRangeElements()[0].getElement());
  
  return { 
    name: name, 
    id: nr.getId() 
  };
}

/**
 * Resolves a Named Range to actual document indexes using Docs API.
 * @param {string} docId - The document ID
 * @param {string} namedRangeName - The name of the Named Range
 * @returns {Object} Object with startIndex, endIndex, and segmentId
 * @throws {Error} If Named Range cannot be found
 */
function getRangeIndexesFromNamedRange_(docId, namedRangeName) {
  const url = `https://docs.googleapis.com/v1/documents/${docId}?fields=namedRanges`;
  
  try {
    const response = UrlFetchApp.fetch(url, {
      headers: { 
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken() 
      },
      muteHttpExceptions: true
    });
    
    if (response.getResponseCode() !== 200) {
      throw new Error('Failed to fetch document: ' + response.getContentText());
    }
    
    const doc = JSON.parse(response.getContentText());
    const namedRanges = doc.namedRanges?.[namedRangeName]?.namedRanges || [];
    
    if (namedRanges.length === 0) {
      throw new Error('Named range not found in document.');
    }

    // Use the first range
    const range = namedRanges[0].ranges[0];
    
    return {
      startIndex: range.startIndex || 0,
      endIndex: range.endIndex || 0,
      segmentId: range.segmentId || null
    };
    
  } catch (err) {
    Logger.log('Error in getRangeIndexesFromNamedRange_: ' + err.toString());
    throw new Error('Failed to resolve selection range: ' + err.toString());
  }
}

// ============================================================================
// Banyan API Integration
// ============================================================================

/**
 * Calls the Banyan API to generate document content.
 * Implements exponential backoff retry for 429 and 5xx errors.
 * 
 * @param {Object} params - Generation parameters
 * @param {number} retryCount - Current retry attempt
 * @returns {Object} Generated document specification
 * @throws {Error} If generation fails after all retries
 */
function callBanyanAPI_(params, retryCount) {
  const url = BANYAN_API_BASE + '/api/generate'; // Adjust endpoint as needed
  
  const payload = {
    title: params.title,
    audience: params.audience,
    tone: params.tone,
    context: params.context,
    format: 'document' // Request structured output
  };

  try {
    const response = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });

    const statusCode = response.getResponseCode();
    
    // Handle rate limiting and server errors with retry
    if ((statusCode === 429 || statusCode >= 500) && retryCount < MAX_RETRIES) {
      Utilities.sleep(RETRY_DELAYS[retryCount]);
      return callBanyanAPI_(params, retryCount + 1);
    }
    
    if (statusCode !== 200) {
      throw new Error('API error (' + statusCode + '): ' + response.getContentText());
    }

    const result = JSON.parse(response.getContentText());
    
    // Transform API response to our spec format
    return transformBanyanResponse_(result);
    
  } catch (err) {
    if (retryCount < MAX_RETRIES && 
        (err.toString().includes('429') || err.toString().includes('timed out'))) {
      Utilities.sleep(RETRY_DELAYS[retryCount]);
      return callBanyanAPI_(params, retryCount + 1);
    }
    
    Logger.log('Error calling Banyan API: ' + err.toString());
    throw new Error('Failed to generate content: ' + err.toString());
  }
}

/**
 * Transforms Banyan API response to internal spec format.
 * @param {Object} response - Raw API response
 * @returns {Object} Normalized spec object
 */
function transformBanyanResponse_(response) {
  // This is a placeholder - adjust based on actual Banyan API response format
  return {
    title: response.title || 'Untitled',
    blocks: response.blocks || response.content || []
  };
}

// ============================================================================
// Document Writing with Cursor-Based Indexing
// ============================================================================

/**
 * Writes the generated spec to a Google Doc using cursor-based indexing.
 * Handles headings, paragraphs, bullets, and tables.
 * 
 * @param {string} docId - The document ID
 * @param {Object} spec - The document specification
 * @param {Object|null} selectionRange - Optional range to replace (from Named Range)
 */
function writeSpecToDoc_(docId, spec, selectionRange) {
  const requests = [];
  let cursor = null;

  // If replacing selection, delete the content first and set cursor
  if (selectionRange) {
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: selectionRange.startIndex,
          endIndex: selectionRange.endIndex,
          segmentId: selectionRange.segmentId
        }
      }
    });
    cursor = { index: selectionRange.startIndex };
  }

  // Helper to insert text and advance cursor
  const insertText = (text) => {
    if (cursor) {
      requests.push({
        insertText: {
          location: cursor,
          text: text
        }
      });
      cursor.index += text.length;
    } else {
      // Insert at end of document
      requests.push({
        insertText: {
          endOfSegmentLocation: {},
          text: text
        }
      });
    }
  };

  // Helper to apply style to a range
  const applyStyle = (startIndex, endIndex, style) => {
    requests.push({
      updateParagraphStyle: {
        range: {
          startIndex: startIndex,
          endIndex: endIndex
        },
        paragraphStyle: style,
        fields: Object.keys(style).join(',')
      }
    });
  };

  // Process each block
  const blocks = spec.blocks || [];
  blocks.forEach(block => {
    const blockType = block.type || 'paragraph';
    
    switch (blockType) {
      case 'heading':
        const headingText = (block.text || '') + '\n';
        const headingStart = cursor ? cursor.index : null;
        insertText(headingText);
        
        if (headingStart !== null) {
          applyStyle(headingStart, cursor.index, {
            namedStyleType: 'HEADING_' + (block.level || 1)
          });
        }
        break;

      case 'paragraph':
        insertText((block.text || '') + '\n');
        break;

      case 'bullets':
      case 'list':
        const items = block.items || [];
        if (items.length > 0) {
          const listText = items.join('\n') + '\n';
          const listStart = cursor ? cursor.index : null;
          insertText(listText);
          
          if (listStart !== null) {
            requests.push({
              createParagraphBullets: {
                range: {
                  startIndex: listStart,
                  endIndex: cursor.index
                },
                bulletPreset: 'BULLET_DISC_CIRCLE_SQUARE'
              }
            });
          }
        }
        break;

      case 'numbered_list':
        const numberedItems = block.items || [];
        if (numberedItems.length > 0) {
          const numberedText = numberedItems.join('\n') + '\n';
          const numberedStart = cursor ? cursor.index : null;
          insertText(numberedText);
          
          if (numberedStart !== null) {
            requests.push({
              createParagraphBullets: {
                range: {
                  startIndex: numberedStart,
                  endIndex: cursor.index
                },
                bulletPreset: 'NUMBERED_DECIMAL_ALPHA_ROMAN'
              }
            });
          }
        }
        break;

      case 'table':
        const rows = block.rows || [];
        if (rows.length > 0 && rows[0].length > 0) {
          const location = cursor || { endOfSegmentLocation: {} };
          requests.push({
            insertTable: {
              location: location,
              rows: rows.length,
              columns: rows[0].length
            }
          });
          
          // Note: Filling table cells requires knowing the exact table structure
          // returned by the API. This is a simplified version.
          // For production, you'd need to query the document after insertion
          // to get cell locations and then insert text into each cell.
        }
        break;

      default:
        // Treat unknown types as paragraphs
        insertText((block.text || '') + '\n');
    }
  });

  // Execute all requests via Docs API
  const batchUpdateUrl = `https://docs.googleapis.com/v1/documents/${docId}:batchUpdate`;
  
  try {
    const response = UrlFetchApp.fetch(batchUpdateUrl, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
      },
      payload: JSON.stringify({ requests: requests }),
      muteHttpExceptions: true
    });

    if (response.getResponseCode() !== 200) {
      throw new Error('Batch update failed: ' + response.getContentText());
    }

    Logger.log('Successfully wrote content to document');
    
  } catch (err) {
    Logger.log('Error in writeSpecToDoc_: ' + err.toString());
    throw new Error('Failed to write to document: ' + err.toString());
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generates a plain-text preview of the spec for the preview card.
 * @param {Object} spec - Document specification
 * @returns {string} Preview text
 */
function generatePreviewText_(spec) {
  const blocks = spec.blocks || [];
  const lines = [];
  
  blocks.forEach(block => {
    switch (block.type) {
      case 'heading':
        lines.push('\n' + (block.text || '') + '\n');
        break;
      case 'paragraph':
        lines.push(block.text || '');
        break;
      case 'bullets':
      case 'list':
        (block.items || []).forEach(item => {
          lines.push('• ' + item);
        });
        break;
      case 'numbered_list':
        (block.items || []).forEach((item, i) => {
          lines.push((i + 1) + '. ' + item);
        });
        break;
      case 'table':
        lines.push('[Table with ' + (block.rows || []).length + ' rows]');
        break;
    }
  });
  
  return lines.join('\n');
}

/**
 * Helper to safely extract form input values.
 * @param {Object} formInput - Form input object
 * @param {string} key - Field name
 * @param {*} defaultValue - Default value if not found
 * @returns {*} Field value or default
 */
function getFormValue_(formInput, key, defaultValue) {
  if (!formInput || !formInput[key]) {
    return defaultValue;
  }
  return formInput[key];
}

