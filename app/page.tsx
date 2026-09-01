'use client';

import React, { useState, useRef } from 'react';
import AuditResults from '@/components/AuditResults';
import styles from './page.module.css';

type UploadKind = 'lease' | 'invoice';

function FileCard({ kind, file, inputRef, onFile }: { kind: UploadKind; file: File | null; inputRef: React.RefObject<HTMLInputElement | null>; onFile: (file: File) => void }) {
  const title = kind === 'lease' ? 'Lease Agreement' : 'Landlord Invoice';
  const description = kind === 'lease' ? 'The source of contractual obligations' : 'The charges to compare against the lease';
  const icon = kind === 'lease' ? '▤' : '▥';

  return (
    <div className={`${styles.uploadCard} ${file ? styles.uploadCardReady : ''}`} onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept="application/pdf,.pdf" onChange={event => event.target.files?.[0] && onFile(event.target.files[0])} />
      <div className={styles.uploadIcon}>{icon}</div>
      <div className={styles.uploadCopy}>
        <div className={styles.uploadTitleRow}>
          <h2>{title}</h2>
          <span className={file ? styles.readyBadge : styles.requiredBadge}>{file ? 'Ready' : 'Required'}</span>
        </div>
        {file ? <p className={styles.fileName}>{file.name}</p> : <p>{description}</p>}
        <small>{file ? `${file.type || 'PDF document'} · ${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Drop a PDF here or browse files'}</small>
      </div>
      <span className={styles.browseLabel}>{file ? 'Change' : 'Browse'}</span>
    </div>
  );
}

export default function Home() {
  const [leaseFile, setLeaseFile] = useState<File | null>(null);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const leaseInputRef = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  const handleAudit = async () => {
    if (!leaseFile || !invoiceFile) {
      setError('Please upload both documents to start the audit.');
      return;
    }

    if (!leaseFile.name.toLowerCase().endsWith('.pdf') || !invoiceFile.name.toLowerCase().endsWith('.pdf')) {
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
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandMark}>LA</div>
        <div>
          <p className={styles.eyebrow}>LEASE OPERATIONS / AI REVIEW</p>
          <h1>LeaseAudit <span>AI</span></h1>
        </div>
        <div className={styles.headerStatus}><span /> Cloud audit ready</div>
      </header>

      {!results ? (
        <>
        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>A clearer view of what you owe</p>
            <h2>Turn lease language into <em>actionable</em> answers.</h2>
            <p className={styles.heroText}>Compare lease obligations against landlord charges and identify potential overcharges with evidence.</p>
          </div>
          <div className={styles.workflow} aria-label="Audit workflow">
            {['Upload', 'Analyze', 'Review', 'Resolve'].map((step, index) => <div className={styles.workflowStep} key={step}><b>0{index + 1}</b><span>{step}</span>{index < 3 && <i>→</i>}</div>)}
          </div>
        </section>

        <section className={styles.auditPanel}>
          <div className={styles.sectionHeading}>
            <div><p className={styles.kicker}>Start a new review</p><h2>Bring your documents</h2></div>
            <span className={styles.secureNote}>PDF only · securely processed</span>
          </div>
          <div className={styles.uploadGrid}>
            <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) setLeaseFile(file); }}><FileCard kind="lease" file={leaseFile} inputRef={leaseInputRef} onFile={setLeaseFile} /></div>
            <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const file = e.dataTransfer.files[0]; if (file) setInvoiceFile(file); }}><FileCard kind="invoice" file={invoiceFile} inputRef={invoiceInputRef} onFile={setInvoiceFile} /></div>
          </div>

          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}

          <div className={styles.actionRow}>
            <p>{leaseFile && invoiceFile ? 'Both documents are ready for analysis.' : 'Add both documents to continue.'}</p>
            <button className={styles.primaryButton} onClick={handleAudit} disabled={!leaseFile || !invoiceFile || isProcessing}>
              {isProcessing ? (
                <>
                  <div className="spinner"></div>
                  Processing securely...
                </>
              ) : (
                <>Run AI Audit <span>↗</span></>
              )}
            </button>
          </div>
          {isProcessing && <div className={styles.progressLine}>Uploading documents <span>•</span> Running lease comparison <span>•</span> Validating findings</div>}
        </section>
        </>
      ) : (
        <AuditResults data={results} onReset={() => { setResults(null); setError(null); }} />
      )}
    </main>
  );
}
