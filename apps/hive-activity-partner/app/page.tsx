"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Shield, Activity, User, Briefcase, Zap } from "lucide-react";
import CheckoutModal from "../src/components/CheckoutModal";

export default function Home() {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [clearance, setClearance] = useState("L1_PUBLIC");
  const [toneProfile, setToneProfile] = useState("gentle");
  
  const [messages, setMessages] = useState([
    { role: "assistant", content: "I am your Adaptive AI Activity Companion. My current memory partition is bound to your Active Directory clearance level. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, clearance, toneProfile })
      });
      const data = await res.json();
      
      if (data.role) {
        setMessages([...newMessages, { role: data.role, content: data.content }]);
      }
    } catch (e) {
      console.error(e);
      setMessages([...newMessages, { role: "assistant", content: "Error connecting to the Tone Engine." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh', color: '#ffffff', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(5,5,5,0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} color="#D4AF37" />
          Hive <span style={{ color: '#D4AF37' }}>Enterprise</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <a href="#sandbox" style={{ color: '#a1a1aa', textDecoration: 'none', fontSize: '0.9rem', transition: 'color 0.2s' }}>Live Sandbox</a>
          <button onClick={() => setCheckoutOpen(true)} style={{ backgroundColor: '#ffffff', color: '#000000', padding: '0.5rem 1.25rem', borderRadius: '4px', fontSize: '0.9rem', fontWeight: '500', border: 'none', cursor: 'pointer', transition: 'transform 0.2s' }}>
            Request Access
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 2rem', textAlign: 'center' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: 'inline-block', padding: '0.25rem 1rem', border: '1px solid rgba(212, 175, 55, 0.3)', borderRadius: '20px', color: '#D4AF37', fontSize: '0.85rem', marginBottom: '2rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            The Adaptive AI Activity Companion
          </div>
          <h1 style={{ fontSize: '5rem', fontWeight: '800', letterSpacing: '-0.03em', lineHeight: '1.1', marginBottom: '1.5rem' }}>
            A Universal Companion Layer <br/>
            <span style={{ background: 'linear-gradient(90deg, #D4AF37 0%, #F3E5AB 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>For Your Enterprise.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: '#a1a1aa', maxWidth: '700px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
            Deploy the world's first multimodal, identity-bonding companion across your entire workforce. Engineered with military-grade Role-Based Access Control (RBAC).
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button onClick={() => setCheckoutOpen(true)} style={{ backgroundColor: '#D4AF37', color: '#000', padding: '1rem 2.5rem', borderRadius: '6px', fontSize: '1.1rem', fontWeight: '600', border: 'none', cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(212, 175, 55, 0.39)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              Initialize AAC Portal
            </button>
            <a href="#sandbox" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '6px', fontSize: '1.1rem', fontWeight: '500', textDecoration: 'none', transition: 'background 0.2s' }}>
              Test the Sandbox
            </a>
          </div>
        </motion.div>
      </main>

      {/* Interactive Sandbox Section */}
      <section id="sandbox" style={{ maxWidth: '1200px', margin: '4rem auto', padding: '0 2rem' }}>
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', overflow: 'hidden', display: 'flex', height: '600px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
        >
          {/* Left Pane: Controls */}
          <div style={{ width: '35%', backgroundColor: 'rgba(0,0,0,0.4)', padding: '2rem', borderRight: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={24} color="#D4AF37" /> Enterprise Sandbox
            </h2>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                <Briefcase size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Active Directory Role
              </label>
              <select 
                value={clearance}
                onChange={(e) => setClearance(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#fff', fontSize: '1rem', outline: 'none' }}
              >
                <option value="L1_PUBLIC">Janitorial / Facilities (L1_PUBLIC)</option>
                <option value="L3_CONFIDENTIAL">Engineering (L3_CONFIDENTIAL)</option>
                <option value="L5_EXECUTIVE">Chief Financial Officer (L5_EXECUTIVE)</option>
              </select>
              <p style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '0.5rem' }}>Try asking the AAC about "Q3 Financials" using different roles to see the RBAC memory sandbox in action.</p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                <Activity size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Tone Engine Profile
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {["gentle", "direct", "energetic"].map(profile => (
                  <button 
                    key={profile}
                    onClick={() => setToneProfile(profile)}
                    style={{ 
                      padding: '0.75rem', textAlign: 'left', borderRadius: '6px', cursor: 'pointer',
                      backgroundColor: toneProfile === profile ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                      border: `1px solid ${toneProfile === profile ? 'rgba(212, 175, 55, 0.5)' : 'rgba(255,255,255,0.1)'}`,
                      color: toneProfile === profile ? '#D4AF37' : '#a1a1aa',
                      transition: 'all 0.2s'
                    }}
                  >
                    {profile.charAt(0).toUpperCase() + profile.slice(1)} Mode
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: '#52525b', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Zap size={12} /> Powered by @hive/companion Substrate
            </div>
          </div>

          {/* Right Pane: Chat */}
          <div style={{ width: '65%', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.01)' }}>
            <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', gap: '1rem', flexDirection: msg.role === "user" ? "row-reverse" : "row" }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: msg.role === "user" ? '#27272a' : 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: msg.role === "assistant" ? '1px solid rgba(212, 175, 55, 0.3)' : 'none' }}>
                    {msg.role === "user" ? <User size={18} color="#a1a1aa" /> : <Zap size={18} color="#D4AF37" />}
                  </div>
                  <div style={{ backgroundColor: msg.role === "user" ? '#27272a' : 'rgba(255,255,255,0.03)', padding: '1rem 1.25rem', borderRadius: '12px', border: msg.role === "assistant" ? '1px solid rgba(255,255,255,0.05)' : 'none', maxWidth: '80%', lineHeight: '1.6', fontSize: '0.95rem' }}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'rgba(212, 175, 55, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(212, 175, 55, 0.3)' }}>
                    <Zap size={18} color="#D4AF37" />
                  </div>
                  <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37' }} />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37' }} />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#D4AF37' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '0.5rem' }}>
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about Q3 Financials..."
                  style={{ flex: 1, backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '1rem', padding: '0.5rem', outline: 'none' }}
                />
                <button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  style={{ backgroundColor: '#D4AF37', border: 'none', borderRadius: '6px', width: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed', opacity: input.trim() && !isTyping ? 1 : 0.5, transition: 'all 0.2s' }}
                >
                  <Send size={18} color="#000" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '4rem 2rem', color: '#52525b', fontSize: '0.875rem' }}>
        <div>Made with ♥ in <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>the Hive</span>.</div>
        <div style={{ marginTop: '0.5rem' }}>Adaptive AI Activity Companion API (v1.0)</div>
      </footer>

      {/* Checkout Modal */}
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}