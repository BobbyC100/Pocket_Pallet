'use client';

import { useEffect, useState } from 'react';

export default function ButtonTest() {
  const [cssVars, setCssVars] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    
    setCssVars({
      'primary': style.getPropertyValue('--banyan-primary').trim(),
      'primary-contrast': style.getPropertyValue('--banyan-primary-contrast').trim(),
      'text-default': style.getPropertyValue('--banyan-text-default').trim(),
      'bg-base': style.getPropertyValue('--banyan-bg-base').trim(),
    });
  }, []);
  
  const checkButtonColors = () => {
    const btn = document.querySelector('.test-btn-primary');
    if (btn) {
      const style = getComputedStyle(btn);
      console.log('=== BUTTON COMPUTED STYLES ===');
      console.log('Background:', style.backgroundColor);
      console.log('Color:', style.color);
      console.log('Classes:', btn.className);
    }
  };
  
  return (
    <div className="min-h-screen bg-banyan-bg-base p-xl">
      <div className="container-banyan">
        <h1 className="text-h1 font-semibold text-banyan-text-default mb-l">
          Button Diagnostic Test
        </h1>
        
        {/* CSS Variables Display */}
        <div className="card-banyan mb-xl">
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-m">
            Current CSS Variables
          </h2>
          <div className="space-y-s">
            <div className="flex gap-m">
              <span className="font-semibold w-48">--banyan-primary:</span>
              <span className="font-mono">{cssVars['primary']}</span>
              <div 
                className="w-12 h-6 rounded border border-banyan-border-default"
                style={{ backgroundColor: cssVars['primary'] }}
              />
            </div>
            <div className="flex gap-m">
              <span className="font-semibold w-48">--banyan-primary-contrast:</span>
              <span className="font-mono">{cssVars['primary-contrast']}</span>
              <div 
                className="w-12 h-6 rounded border border-banyan-border-default"
                style={{ backgroundColor: cssVars['primary-contrast'] }}
              />
            </div>
            <div className="flex gap-m">
              <span className="font-semibold w-48">--banyan-text-default:</span>
              <span className="font-mono">{cssVars['text-default']}</span>
              <div 
                className="w-12 h-6 rounded border border-banyan-border-default"
                style={{ backgroundColor: cssVars['text-default'] }}
              />
            </div>
            <div className="flex gap-m">
              <span className="font-semibold w-48">--banyan-bg-base:</span>
              <span className="font-mono">{cssVars['bg-base']}</span>
              <div 
                className="w-12 h-6 rounded border border-banyan-border-default"
                style={{ backgroundColor: cssVars['bg-base'] }}
              />
            </div>
          </div>
        </div>
        
        {/* Button Tests */}
        <div className="card-banyan mb-xl">
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-m">
            Button Tests
          </h2>
          
          <div className="space-y-l">
            <div>
              <h3 className="text-h3 font-semibold text-banyan-text-default mb-s">
                Banyan Primary Button (Correct)
              </h3>
              <button className="btn-banyan-primary test-btn-primary" onClick={checkButtonColors}>
                Sign Up (btn-banyan-primary)
              </button>
              <p className="text-caption text-banyan-text-subtle mt-xs">
                Expected: Deep/bright green background, white/dark text
              </p>
            </div>
            
            <div>
              <h3 className="text-h3 font-semibold text-banyan-text-default mb-s">
                Old .btn Class (Wrong - for comparison)
              </h3>
              <button className="btn">
                Old Style Button (.btn)
              </button>
              <p className="text-caption text-banyan-text-subtle mt-xs">
                This uses the legacy .btn class
              </p>
            </div>
            
            <div>
              <h3 className="text-h3 font-semibold text-banyan-text-default mb-s">
                Inline Style Test (Control)
              </h3>
              <button 
                style={{
                  backgroundColor: 'var(--banyan-primary)',
                  color: 'var(--banyan-primary-contrast)',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  fontWeight: 500,
                  border: 'none'
                }}
              >
                Inline Styled Button
              </button>
              <p className="text-caption text-banyan-text-subtle mt-xs">
                This should work correctly with inline styles
              </p>
            </div>
            
            <div>
              <h3 className="text-h3 font-semibold text-banyan-text-default mb-s">
                Ghost Button
              </h3>
              <button className="btn-banyan-ghost">
                Ghost Button
              </button>
            </div>
          </div>
        </div>
        
        {/* Console Test Button */}
        <div className="card-banyan">
          <h2 className="text-h2 font-semibold text-banyan-text-default mb-m">
            Console Diagnostic
          </h2>
          <button 
            className="btn-banyan-secondary"
            onClick={checkButtonColors}
          >
            Log Button Styles to Console
          </button>
          <p className="text-caption text-banyan-text-subtle mt-s">
            Click to see computed styles in browser console (F12)
          </p>
        </div>
      </div>
    </div>
  );
}

