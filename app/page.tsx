'use client';

import React, { useState, useRef } from 'react';
import AuditResults from '@/components/AuditResults';

export default function Home() {
  const [leaseFile, setLeaseFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const leaseInputRef = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  const handleLeaseDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setLeaseFile(e.dataTransfer.files[0]);
    }
  };

  const handleInvoiceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setInvoiceFile(e.dataTransfer.files[0]);
    }
  };

  const handleAudit = async () => {
    if (!leaseFile || !invoiceFile) {
      setError('Please upload both documents to start the audit.');
      return;
    }

    if (leaseFile.type !== 'application/pdf' || invoiceFile.type !== 'application/pdf') {
      setError('Please upload a lease PDF and an invoice PDF.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append('leaseFile', leaseFile);
    formData.append('invoiceFile', invoiceFile);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process audit');

      setResults(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'The audit could not be completed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 className="title-gradient" style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          Lease Audit Engine
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
          Upload a lease agreement and a landlord invoice. Our RocketRide AI engine will analyze the documents, extract rules and charges, compare them, and instantly detect potential overcharges.
        </p>
      </header>

      {!results ? (
        <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
            
            {/* Lease Upload */}
            <div 
              className={`file-drop-area ${leaseFile ? 'active' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleLeaseDrop}
              onClick={() => leaseInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept=".pdf,.png,.jpg,.jpeg" 
                ref={leaseInputRef} 
                onChange={(e) => e.target.files && setLeaseFile(e.target.files[0])} 
              />
              <svg className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Lease Agreement</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {leaseFile ? leaseFile.name : 'Drag & drop or click to upload'}
                </p>
              </div>
            </div>

            {/* Invoice Upload */}
            <div 
              className={`file-drop-area ${invoiceFile ? 'active' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleInvoiceDrop}
              onClick={() => invoiceInputRef.current?.click()}
            >
              <input 
                type="file" 
                accept=".pdf,.png,.jpg,.jpeg" 
                ref={invoiceInputRef} 
                onChange={(e) => e.target.files && setInvoiceFile(e.target.files[0])} 
              />
              <svg className="upload-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <h3 style={{ marginBottom: '0.5rem' }}>Landlord Invoice</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                  {invoiceFile ? invoiceFile.name : 'Drag & drop or click to upload'}
                </p>
              </div>
            </div>

          </div>

          {error && (
            <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#fca5a5', marginBottom: '1.5rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button 
              onClick={handleAudit} 
              disabled={!leaseFile || !invoiceFile || isProcessing}
              style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
            >
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Analyzing Documents...
                </>
              ) : (
                'Run AI Audit'
              )}
            </button>
          </div>
        </div>
      ) : (
        <AuditResults data={results} onReset={() => setResults(null)} />
      )}
    </main>
  );
}
