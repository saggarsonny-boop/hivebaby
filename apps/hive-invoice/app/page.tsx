'use client';
import { useState } from 'react';
import './globals.css';

export default function HiveInvoice() {
  const [isPaid, setIsPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = () => {
    setIsProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
    }, 1500);
  };

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <div className="brand">
          <h1>HIVE STUDIOS</h1>
          <p>123 Innovation Drive<br/>St. Louis, MO 63101</p>
        </div>
        <div className="invoice-details">
          <h2>INVOICE</h2>
          <p style={{fontFamily: 'Roboto Mono'}}>#INV-2026-089</p>
          <div className={\`status-badge \${isPaid ? 'status-paid' : 'status-unpaid'}\`}>
            {isPaid ? 'PAID' : 'AWAITING PAYMENT'}
          </div>
        </div>
      </div>

      <div className="invoice-body">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th className="amount-col">Rate</th>
                <th className="amount-col">Hours</th>
                <th className="amount-col">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Universal Document System Architecture</td>
                <td className="amount-col">$150.00</td>
                <td className="amount-col">20</td>
                <td className="amount-col">$3,000.00</td>
              </tr>
              <tr>
                <td>API Integration & Cryptographic Setup</td>
                <td className="amount-col">$175.00</td>
                <td className="amount-col">10</td>
                <td className="amount-col">$1,750.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="totals">
          <div className="totals-grid">
            <span style={{color: 'var(--text-muted)'}}>Subtotal:</span>
            <span className="amount-col">$4,750.00</span>
            <span style={{color: 'var(--text-muted)'}}>Tax (0%):</span>
            <span className="amount-col">$0.00</span>
            <span style={{fontWeight: 'bold', paddingTop: '1rem'}}>Total Due:</span>
            <span className="amount-col grand-total" style={{paddingTop: '1rem'}}>$4,750.00</span>
          </div>
        </div>
      </div>

      <div className="action-bar">
        <div style={{color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          UDS Auto-Executing Protocol
        </div>
        
        {isPaid ? (
          <div className="success-message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Payment Received. Document Locked.
          </div>
        ) : (
          <button 
            className="btn-pay" 
            onClick={handlePayment} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Pay $4,750.00'}
          </button>
        )}
      </div>
    </div>
  );
}