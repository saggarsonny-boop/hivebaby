"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const [seatCount, setSeatCount] = useState(1000);
  const [isProcessing, setIsProcessing] = useState(false);

  const basePlatformFee = 150000;
  
  let seatPricePerMonth = 12;
  if (seatCount >= 1000) seatPricePerMonth = 10;
  if (seatCount >= 10000) seatPricePerMonth = 8;
  if (seatCount >= 100000) seatPricePerMonth = 5;

  const annualSeatRevenue = seatCount * seatPricePerMonth * 12;
  const totalACV = basePlatformFee + annualSeatRevenue;

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/billing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enterpriseId: 'req_demo', seatCount })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(8px)',
              zIndex: 40,
            }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              borderRadius: '16px',
              padding: '2.5rem',
              width: '90%',
              maxWidth: '600px',
              zIndex: 50,
              color: '#fff',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <button 
              onClick={onClose}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
            >
              <X size={24} />
            </button>

            <h2 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Enterprise Licensing</h2>
            <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Configure your AAC deployment scale.</p>

            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ fontWeight: '500' }}>Active Seats (Employees)</span>
                <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '1.25rem' }}>{seatCount.toLocaleString()}</span>
              </div>
              
              <input 
                type="range" 
                min="100" 
                max="300000" 
                step="100"
                value={seatCount} 
                onChange={(e) => setSeatCount(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: '#D4AF37', height: '6px', borderRadius: '4px', appearance: 'none', background: 'rgba(255,255,255,0.1)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
                <span>100</span>
                <span>300k+</span>
              </div>
            </div>

            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Base Platform Fee (Yearly)</span>
                <span>$150,000</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span>Per Seat License (${seatPricePerMonth}/mo)</span>
                <span>${annualSeatRevenue.toLocaleString()}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '1rem 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.5rem', fontWeight: 'bold' }}>
                <span>Annual Contract Value</span>
                <span style={{ color: '#D4AF37' }}>${totalACV.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={isProcessing}
              style={{
                width: '100%',
                padding: '1.25rem',
                backgroundColor: '#D4AF37',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: isProcessing ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                opacity: isProcessing ? 0.7 : 1,
                transition: 'all 0.2s'
              }}
            >
              {isProcessing ? 'Initializing Secure Environment...' : 'Proceed to Checkout'}
              {!isProcessing && <Check size={20} />}
            </button>
            <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: '#a1a1aa' }}>
              Requires Active Directory integration via SAML/Okta.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
