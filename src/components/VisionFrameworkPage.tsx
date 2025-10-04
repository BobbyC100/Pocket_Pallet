'use client';

import { useState, useEffect } from 'react';
import { VisionFramework, validateVisionFramework } from '@/lib/vision-framework-schema';
import { exportToPDF as generatePDF, exportToMarkdown as generateMarkdown } from '@/lib/pdf-export';

interface VisionFrameworkPageProps {
  companyId: string;
}

interface EditHistory {
  timestamp: string;
  section: string;
  changes: string;
}

export default function VisionFrameworkPage({ companyId }: VisionFrameworkPageProps) {
  const [framework, setFramework] = useState<VisionFramework | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('vision');
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [alignmentWarnings, setAlignmentWarnings] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [fromBrief, setFromBrief] = useState(false);
  const [autoFilledFields, setAutoFilledFields] = useState<string[]>([]);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [showCompleteView, setShowCompleteView] = useState(false);

  // Load existing framework on mount
  useEffect(() => {
    const loadSpine = async () => {
      try {
        // Check for draft from brief first
        const draftData = sessionStorage.getItem('visionFrameworkDraft');
        if (draftData) {
          try {
            const { framework, fromBrief, autoFilledFields } = JSON.parse(draftData);
            console.log('Loading framework from session storage:', framework);
            setFramework(framework);
            setFromBrief(fromBrief);
            setAutoFilledFields(autoFilledFields || []);
            // Don't clear session storage immediately - keep it for page refreshes
            setIsLoading(false);
            return;
          } catch (error) {
            console.error('Error parsing session storage data:', error);
            sessionStorage.removeItem('visionFrameworkDraft'); // Clear corrupted data
          }
        }

        // Otherwise load from API
        const response = await fetch(`/api/vision-framework/${companyId}`);
        if (response.ok) {
          const data = await response.json();
          setFramework(data);
        } else {
                 // Create comprehensive mock framework for YardBird (construction logistics startup)
                 const mockFramework: VisionFramework = {
                   companyId,
                   updatedAt: new Date().toISOString(),
                   vision: {
                     purpose: "Eliminate construction site delivery delays that waste time and money",
                     endState: "A world where every construction site receives materials exactly when and where needed, eliminating costly delays and improving project efficiency across the industry"
                   },
                   mission: {
                     whatWeDo: "Build a dynamic dispatch layer that ingests PO data, traffic, and crane/lift windows to auto-route box trucks and schedule curb permits",
                     whoFor: "Mid-market general contractors (50-500 employees) in NYC, Chicago, and LA who manage $200M+ annual revenue projects",
                     howWeWin: "Through superior logistics intelligence, real-time coordination, and mobile-first site management that reduces idle crew hours by 27%",
                     successSignals: [
                       "27% reduction in idle crew hours",
                       "118% net revenue retention on pilot add-ons",
                       "1,240+ coordinated drops with 0 safety incidents",
                       "18 active sites across 2 major GCs",
                       "40% month-over-month growth in pilot expansion"
                     ]
                   },
                   operatingPrinciples: [
                     {
                       name: "Safety First",
                       description: "Every delivery is planned with safety as the top priority, never compromising worker wellbeing for speed.",
                       behaviors: ["Pre-route safety checks", "Driver safety training", "Site hazard documentation"],
                       antiBehaviors: ["Rush deliveries", "Skip safety protocols", "Ignore site conditions"]
                     },
                     {
                       name: "Precision Timing",
                       description: "We obsess over timing because every minute of delay costs contractors thousands in crew idle time.",
                       behaviors: ["Real-time traffic monitoring", "Crane window optimization", "Proactive delay communication"],
                       antiBehaviors: ["Accept delays as normal", "Poor communication", "Reactive problem solving"]
                     },
                     {
                       name: "Site Intelligence",
                       description: "We understand construction sites better than anyone because we're built by people who've been there.",
                       behaviors: ["Site-specific routing", "Foreman mobile app", "Vendor chargeback automation"],
                       antiBehaviors: ["One-size-fits-all solutions", "Ignore site complexity", "Manual processes"]
                     },
                     {
                       name: "Vendor Partnership",
                       description: "We succeed when our vendor partners succeed - we're not just another logistics company.",
                       behaviors: ["Driver-friendly tools", "Fair pricing models", "Performance transparency"],
                       antiBehaviors: ["Squeeze vendor margins", "Poor driver experience", "Hidden fees"]
                     }
                   ],
                   objectives: [
                     {
                       id: "q1-pilot-expansion",
                       timespan: "Q1",
                       statement: "Scale from 2 pilot GCs to 5 active customers and achieve $200K ARR",
                       keyResults: [
                         { metric: "Active Customers", target: "5 GCs" },
                         { metric: "ARR", target: "$200K" },
                         { metric: "Sites Active", target: "45+ sites" },
                         { metric: "Drop Volume", target: "3,000+ monthly drops" }
                       ],
                       owner: "CEO"
                     },
                     {
                       id: "q1-product-launch",
                       timespan: "Q1",
                       statement: "Launch mobile app for foremen and complete API integrations with major construction software",
                       keyResults: [
                         { metric: "Mobile App Users", target: "100+ foremen" },
                         { metric: "API Integrations", target: "3 major platforms" },
                         { metric: "App Store Rating", target: "4.5+ stars" },
                         { metric: "Feature Adoption", target: "80% of active users" }
                       ],
                       owner: "CTO"
                     },
                     {
                       id: "q1-team-building",
                       timespan: "Q1",
                       statement: "Build core team and establish operational excellence across all functions",
                       keyResults: [
                         { metric: "Team Size", target: "12 people" },
                         { metric: "Key Hires", target: "VP Sales, Customer Success Lead" },
                         { metric: "Employee NPS", target: "70+" },
                         { metric: "Process Documentation", target: "100% of core processes" }
                       ],
                       owner: "CEO"
                     }
                   ],
                   brandBrief: {
                     oneLiner: "The logistics intelligence platform that eliminates construction site delivery delays",
                     positioning: "The only construction logistics platform built by ex-Procore and Uber Freight veterans who understand both construction sites and logistics operations",
                     audience: "Operations Directors and Site Superintendents at mid-market general contractors who are frustrated with delivery delays costing them thousands daily",
                     tone: ["Expert", "Reliable", "Construction-focused", "Results-driven", "Partnership-oriented"],
                     story: "Founded by a former Procore project manager who watched crews sit idle for hours waiting for materials, and an ex-Uber Freight operations lead who knew logistics could be smarter. We're not just another delivery app - we're construction people solving construction problems with logistics intelligence.",
                     visualCues: ["Construction orange", "Clean site imagery", "Mobile-first design", "Data visualization", "Professional safety gear"]
                   }
                 };
                 setFramework(mockFramework);
        }
      } catch (error) {
        console.error('Error loading vision framework:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSpine();
  }, [companyId]);

  // Calculate completion progress
  // Calculate completion progress whenever framework changes
  useEffect(() => {
    if (!framework) return;
    
    // We count 14 total field groups: 2 vision + 4 mission + 1 principles + 1 objectives + 6 brand
    const totalFields = 14;
    let completedFields = 0;
    const fieldStatus: string[] = [];
    
    // Helper to check if a string field has meaningful content
    const hasContent = (str: string | undefined) => str && str.trim().length > 0;
    
    // Check vision (2 fields)
    if (hasContent(framework.vision.purpose)) {
      completedFields++;
      fieldStatus.push('✅ vision.purpose');
    } else {
      fieldStatus.push('❌ vision.purpose');
    }
    if (hasContent(framework.vision.endState)) {
      completedFields++;
      fieldStatus.push('✅ vision.endState');
    } else {
      fieldStatus.push('❌ vision.endState');
    }
    
    // Check mission (4 fields)
    if (hasContent(framework.mission.whatWeDo)) {
      completedFields++;
      fieldStatus.push('✅ mission.whatWeDo');
    } else {
      fieldStatus.push('❌ mission.whatWeDo');
    }
    if (hasContent(framework.mission.whoFor)) {
      completedFields++;
      fieldStatus.push('✅ mission.whoFor');
    } else {
      fieldStatus.push('❌ mission.whoFor');
    }
    if (hasContent(framework.mission.howWeWin)) {
      completedFields++;
      fieldStatus.push('✅ mission.howWeWin');
    } else {
      fieldStatus.push('❌ mission.howWeWin');
    }
    if (framework.mission.successSignals.length >= 3) {
      completedFields++;
      fieldStatus.push(`✅ mission.successSignals (${framework.mission.successSignals.length})`);
    } else {
      fieldStatus.push(`❌ mission.successSignals (${framework.mission.successSignals.length})`);
    }
    
    // Check operating principles (1 field group)
    if (framework.operatingPrinciples.length >= 3) {
      completedFields++;
      fieldStatus.push(`✅ operatingPrinciples (${framework.operatingPrinciples.length})`);
    } else {
      fieldStatus.push(`❌ operatingPrinciples (${framework.operatingPrinciples.length})`);
    }
    
    // Check objectives (1 field group)
    if (framework.objectives.length >= 2) {
      completedFields++;
      fieldStatus.push(`✅ objectives (${framework.objectives.length})`);
    } else {
      fieldStatus.push(`❌ objectives (${framework.objectives.length})`);
    }
    
    // Check brand brief (6 fields)
    if (hasContent(framework.brandBrief.oneLiner)) {
      completedFields++;
      fieldStatus.push('✅ brandBrief.oneLiner');
    } else {
      fieldStatus.push('❌ brandBrief.oneLiner');
    }
    if (hasContent(framework.brandBrief.positioning)) {
      completedFields++;
      fieldStatus.push('✅ brandBrief.positioning');
    } else {
      fieldStatus.push('❌ brandBrief.positioning');
    }
    if (hasContent(framework.brandBrief.audience)) {
      completedFields++;
      fieldStatus.push('✅ brandBrief.audience');
    } else {
      fieldStatus.push('❌ brandBrief.audience');
    }
    if (framework.brandBrief.tone.length >= 3) {
      completedFields++;
      fieldStatus.push(`✅ brandBrief.tone (${framework.brandBrief.tone.length})`);
    } else {
      fieldStatus.push(`❌ brandBrief.tone (${framework.brandBrief.tone.length})`);
    }
    if (hasContent(framework.brandBrief.story)) {
      completedFields++;
      fieldStatus.push('✅ brandBrief.story');
    } else {
      fieldStatus.push('❌ brandBrief.story');
    }
    if (framework.brandBrief.visualCues.length >= 3) {
      completedFields++;
      fieldStatus.push(`✅ brandBrief.visualCues (${framework.brandBrief.visualCues.length})`);
    } else {
      fieldStatus.push(`❌ brandBrief.visualCues (${framework.brandBrief.visualCues.length})`);
    }
    
    const newProgress = Math.round((completedFields / totalFields) * 100);
    console.log(`📊 Completion: ${completedFields}/${totalFields} fields (${newProgress}%)`);
    console.log('Field breakdown:', fieldStatus.join('\n'));
    setCompletionProgress(newProgress);
  }, [framework]);

  const generateNewSpine = async () => {
    try {
      // This would typically come from the wizard responses
      const mockResponses = {
        problem_now: "Material deliveries to urban job sites are late/misplaced ~30% of the time",
        customer_gtm: "Mid-market GCs (50–500 employees). Direct sales to Ops Directors.",
        traction_proud: "2 paid pilots, 18 active sites, 27% fewer idle crew hours",
        milestone_6mo: "Expand to 3 more metros, achieve $500K ARR",
        risky_assumption: "Municipal permit regulations vary by city",
        vision_purpose: "Eliminate construction site delivery delays",
        vision_endstate: "A world where every construction site receives materials exactly when and where needed, eliminating costly delays and improving project efficiency."
      };

      const response = await fetch('/api/vision-framework/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, responses: mockResponses }),
      });

      if (response.ok) {
        const { framework: generatedSpine } = await response.json();
        setFramework(generatedSpine);
      }
    } catch (error) {
      console.error('Error generating framework:', error);
    }
  };

  const handleSave = async () => {
    if (!framework) return;

    setIsSaving(true);
    try {
      // Validation is already done in real-time, just check if there are any errors
      if (validationErrors.length > 0) {
        return;
      }

      const response = await fetch(`/api/vision-framework/${companyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(framework),
      });

      if (response.ok) {
        const updatedSpine = await response.json();
        setFramework(updatedSpine);
        
        // Clear session storage since we've saved to the server
        sessionStorage.removeItem('visionFrameworkDraft');
        
        // Add to edit history
        setEditHistory(prev => [{
          timestamp: new Date().toISOString(),
          section: activeSection,
          changes: `Updated ${activeSection} section`
        }, ...prev.slice(0, 4)]); // Keep last 5 revisions

        // Check for alignment warnings
        checkAlignmentWarnings(updatedSpine);
      }
    } catch (error) {
      console.error('Error saving vision framework:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const checkAlignmentWarnings = (currentSpine: VisionFramework) => {
    const warnings: string[] = [];
    
    // For now, disable alignment warnings for auto-generated content
    // The objectives are generated from brief data and should be reasonably aligned
    // TODO: Implement smarter alignment checking in the future
    
    setAlignmentWarnings(warnings);
  };

  const handleExportPDF = async () => {
    if (!framework) return;
    
    setIsExporting(true);
    try {
      const result = await generatePDF(framework);
      if (result.success) {
        console.log(`PDF exported successfully: ${result.filename}`);
      } else {
        console.error('PDF export failed:', result.error);
        alert(`PDF export failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error exporting PDF. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportMarkdown = () => {
    if (!framework) return;
    
    try {
      const markdown = generateMarkdown(framework);
      const blob = new Blob([markdown], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${framework.companyId}-vision-framework.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting Markdown:', error);
      alert('Error exporting Markdown. Check console for details.');
    }
  };

  const updateSpine = (updates: Partial<VisionFramework>) => {
    if (!framework) return;
    const updatedSpine = { ...framework, ...updates };
    setFramework(updatedSpine);
    
    // Clear validation errors immediately when user is typing
    setValidationErrors([]);
  };

  // Debounced validation - only runs after user stops typing
  useEffect(() => {
    if (!framework) return;
    
    const timeoutId = setTimeout(() => {
      const validation = validateVisionFramework(framework);
      if (!validation.success) {
        setValidationErrors(validation.errors || []);
      } else {
        setValidationErrors([]);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timeoutId);
  }, [framework]);

  const exportToMarkdown = (section: string) => {
    if (!framework) return;
    
    let content = '';
    switch (section) {
      case 'vision':
        content = `# Vision\n\n**Purpose:** ${framework.vision.purpose}\n\n**End State:** ${framework.vision.endState}`;
        break;
      case 'mission':
        content = `# Mission\n\n**What We Do:** ${framework.mission.whatWeDo}\n\n**Who For:** ${framework.mission.whoFor}\n\n**How We Win:** ${framework.mission.howWeWin}\n\n**Success Signals:**\n${framework.mission.successSignals.map(s => `- ${s}`).join('\n')}`;
        break;
      case 'principles':
        content = `# Operating Principles\n\n${framework.operatingPrinciples.map(p => `## ${p.name}\n\n${p.description}\n\n**Behaviors:**\n${p.behaviors.map(b => `- ${b}`).join('\n')}\n\n**Anti-Behaviors:**\n${p.antiBehaviors.map(a => `- ${a}`).join('\n')}`).join('\n\n')}`;
        break;
      case 'objectives':
        content = `# Objectives\n\n${framework.objectives.map(o => `## ${o.timespan}: ${o.statement}\n\n**Owner:** ${o.owner}\n\n**Key Results:**\n${o.keyResults.map(kr => `- ${kr.metric}: ${kr.target}`).join('\n')}`).join('\n\n')}`;
        break;
      case 'brand':
        content = `# Brand Brief\n\n**One Liner:** ${framework.brandBrief.oneLiner}\n\n**Positioning:** ${framework.brandBrief.positioning}\n\n**Audience:** ${framework.brandBrief.audience}\n\n**Tone:** ${framework.brandBrief.tone.join(', ')}\n\n**Story:** ${framework.brandBrief.story}\n\n**Visual Cues:**\n${framework.brandBrief.visualCues.map(v => `- ${v}`).join('\n')}`;
        break;
    }
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
      a.download = `${companyId}-${section}-vision-framework.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = (section: string) => {
    // This would integrate with a PDF generation library like jsPDF
    console.log(`Exporting ${section} to PDF - implementation needed`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Loading vision framework...</div>
      </div>
    );
  }

  if (!framework) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-400">Failed to load vision framework</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      {fromBrief && (
        <div className="mb-4 flex items-center text-sm text-gray-400">
          <a href="/new" className="hover:text-white transition-colors">← Back to Brief</a>
          <span className="mx-2">•</span>
          <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">From Brief</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Vision Framework</h1>
        <p className="text-gray-300">
          The foundational story and principles that guide all company operations.
        </p>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-300">Completion Progress</span>
            <span className="text-sm text-gray-400">{completionProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionProgress}%` }}
            />
          </div>
          {completionProgress < 100 && (
            <p className="text-xs text-gray-400 mt-1">
              Complete the required fields to finish your Vision Framework
            </p>
          )}
        </div>
      </div>

      {/* Alignment Warnings */}
      {alignmentWarnings.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-center">
            <div className="text-yellow-400 mr-2">⚠️</div>
            <div className="text-yellow-200">
              {alignmentWarnings.map((warning, index) => (
                <div key={index}>{warning}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-600/30 rounded-lg">
          <div className="flex items-center">
            <div className="text-yellow-400 mr-2">⚠️</div>
            <div className="text-yellow-200">
              <div className="font-semibold mb-2">Complete these fields to finish your Vision Framework:</div>
              {validationErrors.map((error, index) => (
                <div key={index} className="text-sm">• {error}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-white mb-4">Sections</h2>
            
            <div className="space-y-2">
              <div className="text-sm text-gray-400 mb-2">Roots</div>
              {['vision', 'mission', 'principles'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    activeSection === section
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                  {autoFilledFields.some(f => f.startsWith(section === 'principles' ? 'operatingPrinciples' : section + '.')) && (
                    <span className="text-xs bg-green-600 text-white px-1 py-0.5 rounded">Auto</span>
                  )}
                </button>
              ))}
              
              <div className="text-sm text-gray-400 mb-2 mt-4">Trunk</div>
              {['objectives', 'brand'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`w-full text-left px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                    activeSection === section
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{section.charAt(0).toUpperCase() + section.slice(1)}</span>
                  {autoFilledFields.some(f => f.startsWith(section === 'brand' ? 'brandBrief' : section + '.')) && (
                    <span className="text-xs bg-green-600 text-white px-1 py-0.5 rounded">Auto</span>
                  )}
                </button>
              ))}
            </div>

            {/* Edit History */}
            {editHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">Recent Changes</h3>
                <div className="space-y-1">
                  {editHistory.slice(0, 5).map((entry, index) => (
                    <div key={index} className="text-xs text-gray-400">
                      <div className="font-medium">{entry.section}</div>
                      <div>{new Date(entry.timestamp).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane - Content Editor */}
        <div className="lg:col-span-3">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
            {/* Section Header with Export Options */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white capitalize">
                {activeSection}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowCompleteView(!showCompleteView)}
                  className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                >
                  {showCompleteView ? 'Edit Mode' : 'View Complete'}
                </button>
                <button
                  onClick={handleExportMarkdown}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors"
                >
                  Export MD
                </button>
                <button
                  onClick={handleExportPDF}
                  disabled={isExporting}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExporting ? 'Exporting...' : 'Export PDF'}
                </button>
              </div>
            </div>

            {/* Complete Framework View */}
            {showCompleteView && framework && (
              <div className="mb-8 p-6 bg-gray-900 rounded-xl border border-gray-600">
                <h3 className="text-xl font-bold text-white mb-4">Complete Vision Framework</h3>
                <div className="prose prose-invert max-w-none">
                  <div className="space-y-6">
                    {/* Vision */}
                    <div>
                      <h4 className="text-lg font-semibold text-blue-400 mb-2">Vision</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400 text-sm">Purpose:</span>
                          <p className="text-white">{framework.vision.purpose}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">End State:</span>
                          <p className="text-white">{framework.vision.endState}</p>
                        </div>
                      </div>
                    </div>

                    {/* Mission */}
                    <div>
                      <h4 className="text-lg font-semibold text-blue-400 mb-2">Mission</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400 text-sm">What We Do:</span>
                          <p className="text-white">{framework.mission.whatWeDo}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Who For:</span>
                          <p className="text-white">{framework.mission.whoFor}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">How We Win:</span>
                          <p className="text-white">{framework.mission.howWeWin}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Success Signals:</span>
                          <ul className="text-white list-disc list-inside">
                            {framework.mission.successSignals.map((signal, index) => (
                              <li key={index}>{signal}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Operating Principles */}
                    <div>
                      <h4 className="text-lg font-semibold text-blue-400 mb-2">Operating Principles</h4>
                      <div className="space-y-4">
                        {framework.operatingPrinciples.map((principle, index) => (
                          <div key={index} className="border-l-2 border-gray-600 pl-4">
                            <h5 className="text-white font-medium">{principle.name}</h5>
                            <p className="text-gray-300 text-sm mb-2">{principle.description}</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-green-400">✓ Behaviors:</span>
                                <ul className="text-gray-300 list-disc list-inside">
                                  {principle.behaviors.map((behavior, i) => (
                                    <li key={i}>{behavior}</li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <span className="text-red-400">✗ Anti-Behaviors:</span>
                                <ul className="text-gray-300 list-disc list-inside">
                                  {principle.antiBehaviors.map((antiBehavior, i) => (
                                    <li key={i}>{antiBehavior}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Objectives */}
                    <div>
                      <h4 className="text-lg font-semibold text-blue-400 mb-2">Objectives</h4>
                      <div className="space-y-4">
                        {framework.objectives.map((objective, index) => (
                          <div key={index} className="border border-gray-600 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="text-white font-medium">{objective.statement}</h5>
                              <span className="text-gray-400 text-sm">{objective.timespan}</span>
                            </div>
                            <div className="text-gray-400 text-sm mb-2">Owner: {objective.owner}</div>
                            <div>
                              <span className="text-gray-400 text-sm">Key Results:</span>
                              <ul className="text-white list-disc list-inside mt-1">
                                {objective.keyResults.map((kr, i) => (
                                  <li key={i}>{kr.metric}: {kr.target}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Brand Brief */}
                    <div>
                      <h4 className="text-lg font-semibold text-blue-400 mb-2">Brand Brief</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-gray-400 text-sm">One Liner:</span>
                          <p className="text-white">{framework.brandBrief.oneLiner}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Positioning:</span>
                          <p className="text-white">{framework.brandBrief.positioning}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Audience:</span>
                          <p className="text-white">{framework.brandBrief.audience}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Tone:</span>
                          <p className="text-white">{framework.brandBrief.tone.join(', ')}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Story:</span>
                          <p className="text-white">{framework.brandBrief.story}</p>
                        </div>
                        <div>
                          <span className="text-gray-400 text-sm">Visual Cues:</span>
                          <p className="text-white">{framework.brandBrief.visualCues.join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Individual Section Editors - Only show when not in complete view */}
            {!showCompleteView && (
              <>
                {/* Vision Section */}
                {activeSection === 'vision' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Purpose (Why we exist)
                  </label>
                  <textarea
                    value={framework.vision.purpose}
                    onChange={(e) => updateSpine({
                      vision: { ...framework.vision, purpose: e.target.value }
                    })}
                    placeholder="1-2 sentences describing why your company exists..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400 h-24"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: About page, onboarding, OKRs
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End State (World we're creating)
                  </label>
                  <textarea
                    value={framework.vision.endState}
                    onChange={(e) => updateSpine({
                      vision: { ...framework.vision, endState: e.target.value }
                    })}
                    placeholder="2-3 vivid sentences describing the world you're creating..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400 h-32"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: Strategic planning, investor presentations
                  </div>
                </div>
              </div>
            )}

            {/* Mission Section */}
            {activeSection === 'mission' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    What We Do
                  </label>
                  <textarea
                    value={framework.mission.whatWeDo}
                    onChange={(e) => updateSpine({
                      mission: { ...framework.mission, whatWeDo: e.target.value }
                    })}
                    placeholder="Product/service in plain English..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400 h-24"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: Product descriptions, marketing copy
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Who For
                  </label>
                  <textarea
                    value={framework.mission.whoFor}
                    onChange={(e) => updateSpine({
                      mission: { ...framework.mission, whoFor: e.target.value }
                    })}
                    placeholder="Primary audience/users..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400 h-24"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: Customer personas, targeting
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    How We Win
                  </label>
                  <textarea
                    value={framework.mission.howWeWin}
                    onChange={(e) => updateSpine({
                      mission: { ...framework.mission, howWeWin: e.target.value }
                    })}
                    placeholder="Unique approach/edge..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400 h-24"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: Competitive positioning, sales materials
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Success Signals
                  </label>
                  <div className="space-y-2">
                    {framework.mission.successSignals.map((signal, index) => (
                      <input
                        key={index}
                        value={signal}
                        onChange={(e) => {
                          const updated = [...framework.mission.successSignals];
                          updated[index] = e.target.value;
                          updateSpine({
                            mission: { ...framework.mission, successSignals: updated }
                          });
                        }}
                        placeholder={`Success signal ${index + 1}...`}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400"
                      />
                    ))}
                    <button
                      onClick={() => updateSpine({
                        mission: { ...framework.mission, successSignals: [...framework.mission.successSignals, ''] }
                      })}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      + Add Success Signal
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: KPI tracking, progress reviews
                  </div>
                </div>
              </div>
            )}

            {/* Operating Principles Section */}
            {activeSection === 'principles' && (
              <div className="space-y-6">
                {framework.operatingPrinciples.map((principle, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Principle Name
                        </label>
                        <input
                          value={principle.name}
                          onChange={(e) => {
                            const updated = [...framework.operatingPrinciples];
                            updated[index] = { ...updated[index], name: e.target.value };
                            updateSpine({ operatingPrinciples: updated });
                          }}
                          placeholder="e.g., Default to Action"
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Description
                        </label>
                        <textarea
                          value={principle.description}
                          onChange={(e) => {
                            const updated = [...framework.operatingPrinciples];
                            updated[index] = { ...updated[index], description: e.target.value };
                            updateSpine({ operatingPrinciples: updated });
                          }}
                          placeholder="1-2 sentences describing this principle..."
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400 h-20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-xs text-gray-400">
                  Used in: Hiring criteria, performance reviews, decision frameworks
                </div>
              </div>
            )}

            {/* Objectives Section */}
            {activeSection === 'objectives' && (
              <div className="space-y-6">
                {framework.objectives.map((objective, index) => (
                  <div key={objective.id} className="bg-gray-900 rounded-lg p-6 border border-gray-600">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Timespan
                          </label>
                          <select
                            value={objective.timespan}
                            onChange={(e) => {
                              const updated = [...framework.objectives];
                              updated[index] = { ...updated[index], timespan: e.target.value as any };
                              updateSpine({ objectives: updated });
                            }}
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white"
                          >
                            <option value="Q1">Q1</option>
                            <option value="Q2">Q2</option>
                            <option value="Q3">Q3</option>
                            <option value="Q4">Q4</option>
                            <option value="Annual">Annual</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Owner
                          </label>
                          <input
                            value={objective.owner}
                            onChange={(e) => {
                              const updated = [...framework.objectives];
                              updated[index] = { ...updated[index], owner: e.target.value };
                              updateSpine({ objectives: updated });
                            }}
                            placeholder="e.g., CEO, VP Engineering"
                            className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Statement
                        </label>
                        <textarea
                          value={objective.statement}
                          onChange={(e) => {
                            const updated = [...framework.objectives];
                            updated[index] = { ...updated[index], statement: e.target.value };
                            updateSpine({ objectives: updated });
                          }}
                          placeholder="Outcome-based statement (e.g., Ship v1 and get 10 design partners)..."
                          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400 h-20"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <div className="text-xs text-gray-400">
                  Used in: Quarterly planning, progress tracking, team alignment
                </div>
              </div>
            )}

            {/* Brand Brief Section */}
            {activeSection === 'brand' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    One Liner
                  </label>
                  <input
                    value={framework.brandBrief.oneLiner}
                    onChange={(e) => updateSpine({
                      brandBrief: { ...framework.brandBrief, oneLiner: e.target.value }
                    })}
                    placeholder="Tagline/value proposition..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: Website headers, elevator pitches
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Positioning
                  </label>
                  <textarea
                    value={framework.brandBrief.positioning}
                    onChange={(e) => updateSpine({
                      brandBrief: { ...framework.brandBrief, positioning: e.target.value }
                    })}
                    placeholder="Frame of reference + why different..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400 h-24"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: Marketing materials, competitive analysis
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Audience
                  </label>
                  <textarea
                    value={framework.brandBrief.audience}
                    onChange={(e) => updateSpine({
                      brandBrief: { ...framework.brandBrief, audience: e.target.value }
                    })}
                    placeholder="Ideal Customer Profile in a sentence..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400 h-24"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: Customer personas, targeting strategies
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tone
                  </label>
                  <div className="space-y-2">
                    {framework.brandBrief.tone.map((tone, index) => (
                      <input
                        key={index}
                        value={tone}
                        onChange={(e) => {
                          const updated = [...framework.brandBrief.tone];
                          updated[index] = e.target.value;
                          updateSpine({
                            brandBrief: { ...framework.brandBrief, tone: updated }
                          });
                        }}
                        placeholder={`Tone word ${index + 1}...`}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400"
                      />
                    ))}
                    <button
                      onClick={() => updateSpine({
                        brandBrief: { ...framework.brandBrief, tone: [...framework.brandBrief.tone, ''] }
                      })}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      + Add Tone Word
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: Content guidelines, communication style
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Story
                  </label>
                  <textarea
                    value={framework.brandBrief.story}
                    onChange={(e) => updateSpine({
                      brandBrief: { ...framework.brandBrief, story: e.target.value }
                    })}
                    placeholder="Short founding narrative..."
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-white placeholder-gray-400 h-32"
                  />
                  <div className="text-xs text-gray-400 mt-1">
                    Used in: About page, investor presentations
                  </div>
                </div>
              </div>
            )}
              </>
            )}

            {/* Save Button - Only show when not in complete view */}
            {!showCompleteView && (
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save Vision Framework'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
