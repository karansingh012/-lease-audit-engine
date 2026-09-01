'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AuditResultsProps {
  data: unknown;
  onReset: () => void;
}

export default function AuditResults({ data, onReset }: AuditResultsProps) {
  const [actionState, setActionState] = useState<'idle' | 'loading-approve' | 'loading-reject' | 'approved' | 'rejected'>('idle');

  const completeAction = async (action: 'approve' | 'reject') => {
    setActionState(action === 'approve' ? 'loading-approve' : 'loading-reject');
    try {
      const response = await fetch('/api/audit/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const result = await response.json() as { error?: string; status?: string };
      if (!response.ok) throw new Error(result.error || 'Unable to complete action.');
      setActionState(action === 'approve' ? 'approved' : 'rejected');
    } catch {
      setActionState('idle');
    }
  };

  const response = data as { answers?: unknown[]; data?: { answers?: unknown[] } } | null;
  let results: unknown = data;
  if (response?.answers && response.answers.length > 0) {
    results = response.answers[0];
  } else if (response?.data?.answers && response.data.answers.length > 0) {
    results = response.data.answers[0];
  }

  let parsedText: string;
  if (typeof results === 'string') {
    parsedText = results;
    try {
      const parsedJson: unknown = JSON.parse(results);
      parsedText = typeof parsedJson === 'string' ? parsedJson : JSON.stringify(parsedJson, null, 2);
    } catch {
      // raw text
    }
  } else if (results && typeof results === 'object') {
    parsedText = JSON.stringify(results, null, 2);
  } else {
    parsedText = String(results || '');
  }

  // Clean the text - fix currency symbol
  const textContent = parsedText.replace(/[■�]/g, '₹');

  const amountAfter = (pattern: RegExp) => textContent.match(pattern)?.[1] || '—';
  const directOvercharge = amountAfter(/Direct Overcharge Amount[^₹]*₹\s*([\d,]+)/i);
  const unsupportedCharges = amountAfter(/Unsupported[^₹]*₹\s*([\d,]+)/i);
  const totalDisputed = amountAfter(/Total Disputed Amount[^₹]*₹\s*([\d,]+)/i);
  const findingCount = (textContent.match(/(?:^|\n)\s*\d+\.\s+\*\*/g) || []).length;
  const hasHighConfidence = /confidence[^\n]*(high|strong)/i.test(textContent);

  // Parse sections
  const sectionsRaw = textContent.split(/(?=^#{2,3}\s)/m);

  let totalOvercharge = '';
  let disputeLetter = '';
  const generalSections: { title: string; content: string }[] = [];

  if (sectionsRaw.length <= 1) {
    generalSections.push({ title: 'Audit Result', content: textContent });
  } else {
    sectionsRaw.forEach((sec: string) => {
      const trimmed = sec.trim();
      if (!trimmed) return;
      const lines = trimmed.split('\n');
      const titleLine = lines[0];
      const title = titleLine.replace(/^#{2,3}\s*/, '').trim();
      const content = lines.slice(1).join('\n').trim();

      const titleLower = title.toLowerCase();
      if (titleLower.includes('total potential overcharge')) {
        totalOvercharge = content;
      } else if (titleLower.includes('draft dispute letter') || titleLower.includes('dispute letter')) {
        disputeLetter = content;
      } else {
        generalSections.push({ title, content });
      }
    });
  }

  const customComponents = {
    table: ({ node, ...props }: any) => (
      <div style={{ overflowX: 'auto', margin: '1.5rem 0', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }} {...props} />
      </div>
    ),
    th: ({ node, ...props }: any) => (
      <th style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.08)', color: 'var(--secondary)' }} {...props} />
    ),
    td: ({ node, children, ...props }: any) => {
      return <td style={{ padding: '1rem', borderBottom: '1px solid var(--surface-border)' }} {...props}>{children}</td>;
    },
    tr: ({ node, children, ...props }: any) => {
      let text = '';
      const extractText = (children: React.ReactNode) => {
        React.Children.forEach(children, child => {
          if (typeof child === 'string') text += child.toLowerCase() + ' ';
          else if (React.isValidElement(child) && typeof child.props === 'object' && child.props !== null && 'children' in child.props) {
            extractText((child.props as any).children);
          }
        });
      };
      extractText(children);
      
      const isHeaderRow = node?.properties?.isHeader || text.includes('allowed') || text.includes('billed');
      
      let highlight = false;
      if (!isHeaderRow) {
        if (text.match(/\b(yes|overcharge|discrepancy|action required)\b/i) || text.includes('overcharged')) {
          highlight = true;
        }
      }
      
      const className = highlight ? 'table-row-overcharge' : 'table-row-normal';
      
      return <tr className={className} {...props}>{children}</tr>;
    },
    h1: ({ node, ...props }: any) => <h4 style={{ color: 'var(--secondary)', marginTop: '1.5rem', marginBottom: '0.5rem' }} {...props} />,
    h2: ({ node, ...props }: any) => <h4 style={{ color: 'var(--secondary)', marginTop: '1.5rem', marginBottom: '0.5rem' }} {...props} />,
    h3: ({ node, ...props }: any) => <h4 style={{ color: 'var(--secondary)', marginTop: '1.5rem', marginBottom: '0.5rem' }} {...props} />,
    h4: ({ node, ...props }: any) => <h5 style={{ color: 'var(--text-main)', marginTop: '1rem', marginBottom: '0.5rem' }} {...props} />,
    ul: ({ node, ...props }: any) => <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'disc' }} {...props} />,
    ol: ({ node, ...props }: any) => <ol style={{ paddingLeft: '1.5rem', marginBottom: '1rem', listStyleType: 'decimal' }} {...props} />,
    p: ({ node, ...props }: any) => <p style={{ marginBottom: '1rem', lineHeight: '1.6' }} {...props} />,
    strong: ({ node, ...props }: any) => <strong style={{ color: 'var(--text-main)', fontWeight: 600 }} {...props} />,
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="title-gradient">Audit Complete</h2>
        <button onClick={onReset} style={{ background: 'transparent', border: '1px solid var(--surface-border)' }}>
          New Audit
        </button>
      </div>

      <div className="result-intro">
        <div><p className="result-kicker">Review workspace</p><h3>Findings at a glance</h3></div>
        <span className="result-status">{hasHighConfidence ? '● High-confidence findings' : '● Human review recommended'}</span>
      </div>
      <div className="summary-grid">
        <div className="summary-card summary-card-emphasis"><span>Total disputed</span><strong>₹{totalDisputed}</strong><small>Direct + unsupported charges</small></div>
        <div className="summary-card"><span>Direct overcharges</span><strong>₹{directOvercharge}</strong><small>Clear contractual variance</small></div>
        <div className="summary-card"><span>Unsupported charges</span><strong>₹{unsupportedCharges}</strong><small>Documentation needed</small></div>
        <div className="summary-card"><span>Findings</span><strong>{findingCount || '—'}</strong><small>Items flagged for review</small></div>
      </div>

      {totalOvercharge && (
        <div className="glass-panel" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '0.5rem', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Total Potential Overcharge
          </h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f87171' }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{...customComponents, p: ({node, ...props}: any) => <span {...props} />}}>{totalOvercharge}</ReactMarkdown>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {generalSections.map((section, idx) => {
          const isTable = section.content.includes('|--') || section.content.includes('|-');
          return (
            <div key={idx} className="glass-panel" style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.2)', gridColumn: isTable ? '1 / -1' : 'auto' }}>
              <h3 style={{ marginBottom: '1rem', color: 'var(--secondary)', textTransform: 'capitalize', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
                {section.title}
              </h3>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={customComponents}>
                  {section.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        })}
      </div>

      {disputeLetter && (
        <div className="glass-panel" style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1px solid var(--primary)' }}>
          <div style={{ borderBottom: '1px solid var(--surface-border)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📄 Draft Dispute Letter
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Draft generated from verified findings. Human approval is required before sending.
            </p>
          </div>
          
          <div style={{ 
            background: '#f8fafc', 
            color: '#0f172a', 
            padding: '2.5rem', 
            borderRadius: '8px', 
            fontFamily: '"Times New Roman", Times, serif',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            lineHeight: '1.6',
            fontSize: '1.05rem'
          }}>
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]} 
              components={{
                ...customComponents,
                p: ({node, ...props}: any) => <p style={{ marginBottom: '1.2rem' }} {...props} />,
                h3: ({node, ...props}: any) => <h3 style={{ marginBottom: '1.2rem', fontWeight: 'bold' }} {...props} />,
                strong: ({node, ...props}: any) => <strong style={{ fontWeight: 'bold' }} {...props} />
              }}
            >
              {disputeLetter}
            </ReactMarkdown>
          </div>
          <div className="letter-tools">
            <button onClick={() => navigator.clipboard?.writeText(disputeLetter)} className="tool-button">Copy letter</button>
            <button onClick={() => { const blob = new Blob([disputeLetter], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'lease-audit-dispute-letter.txt'; link.click(); URL.revokeObjectURL(url); }} className="tool-button">Download .txt</button>
          </div>
          
          <div className="review-banner"><span>Human Review Required</span><small>Confirm the evidence and amounts before taking action.</small></div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button 
              onClick={() => completeAction('approve')}
              disabled={actionState !== 'idle'}
              style={{ flex: 1, background: actionState === 'approved' ? 'var(--secondary)' : 'var(--primary)', color: 'white' }}
            >
              {actionState === 'loading-approve' ? 'Sending...' : actionState === 'approved' ? 'Letter Sent Successfully ✓' : 'Approve & Send Letter'}
            </button>
            <button 
              className="danger" 
              onClick={() => completeAction('reject')}
              disabled={actionState !== 'idle'}
              style={{ flex: 1, background: 'transparent', border: '1px solid #ef4444', color: actionState === 'rejected' ? '#991b1b' : '#ef4444' }}
            >
              {actionState === 'loading-reject' ? 'Rejecting...' : actionState === 'rejected' ? 'Findings Rejected ✗' : 'Reject Findings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
