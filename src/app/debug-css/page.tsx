"use client";

import { useEffect, useState } from "react";

export default function DebugCSSPage() {
  const [vars, setVars] = useState<Record<string, string>>({});
  const [theme, setTheme] = useState<string>("system");
  const [systemPreference, setSystemPreference] = useState<string>("unknown");
  const [bodyStyle, setBodyStyle] = useState<Record<string, string>>({});

  useEffect(() => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    
    const banyanVars = [
      '--banyan-primary',
      '--banyan-primary-hover',
      '--banyan-primary-contrast',
      '--banyan-text-default',
      '--banyan-text-subtle',
      '--banyan-bg-base',
      '--banyan-bg-surface',
      '--banyan-border-default',
    ];
    
    const values: Record<string, string> = {};
    banyanVars.forEach(varName => {
      values[varName] = computedStyle.getPropertyValue(varName).trim();
    });
    
    setVars(values);
    
    // Check current theme
    const currentTheme = root.getAttribute('data-theme') || 'system';
    setTheme(currentTheme);
    
    // Check system preference
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setSystemPreference(isDark ? 'dark' : 'light');
    
    // Get body computed styles
    setBodyStyle({
      color: getComputedStyle(document.body).color,
      backgroundColor: getComputedStyle(document.body).backgroundColor,
    });
  }, []);

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>CSS Debug Page</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Current Theme</h2>
        <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{theme}</p>
        <p>System preference: {systemPreference}</p>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Computed CSS Variables</h2>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Variable</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Value</th>
              <th style={{ textAlign: 'left', padding: '0.5rem' }}>Preview</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(vars).map(([key, value]) => (
              <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.5rem' }}>{key}</td>
                <td style={{ padding: '0.5rem' }}>{value}</td>
                <td style={{ padding: '0.5rem' }}>
                  {key.includes('text') || key.includes('bg') || key.includes('primary') || key.includes('border') ? (
                    <div
                      style={{
                        width: '50px',
                        height: '30px',
                        backgroundColor: value,
                        border: '1px solid #000',
                      }}
                    />
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Live Tests</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Header Test (should match your actual header)</h3>
          <header className="bg-banyan-bg-surface border-b border-banyan-border-default" style={{ padding: '1rem' }}>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-banyan-text-default">Banyan</span>
              <nav className="flex items-center gap-4">
                <a href="#" className="text-banyan-text-default">Link 1</a>
                <a href="#" className="text-banyan-text-default">Link 2</a>
                <button className="btn-banyan-ghost">Sign in</button>
                <button className="btn-banyan-primary">Sign up</button>
              </nav>
            </div>
          </header>
        </div>
        
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Text Classes Test</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <p className="text-banyan-text-default">text-banyan-text-default</p>
            <p className="text-banyan-text-subtle">text-banyan-text-subtle</p>
            <p className="text-gray-900">text-gray-900 (should be overridden)</p>
            <p className="text-gray-600">text-gray-600 (should be overridden)</p>
            <p className="text-white">text-white (should be overridden)</p>
          </div>
        </div>
      </div>
      
      <div>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Body Computed Style</h2>
        <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
          {JSON.stringify(bodyStyle, null, 2)}
        </pre>
      </div>
    </div>
  );
}

