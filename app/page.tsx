export default function HiveLanding() {
  const engines = [
    {
      name: 'HiveClock',
      url: 'https://hiveclock.hive.baby',
      emoji: '🕐',
      tagline: 'The world\'s most humane clock.',
      description: 'Analog and digital. AI clock faces. World time. Prayer times for Islam, Judaism, and any tradition. Free forever.',
      color: '#4a7fa5',
      status: 'live',
    },
    {
      name: 'HiveClarity',
      url: 'https://hive-clarity.vercel.app',
      emoji: '💬',
      tagline: 'Say what you actually mean.',
      description: 'Takes tangled thoughts and returns precise, expressible language. No advice. Just clarity.',
      color: '#4a7fa5',
      status: 'live',
    },
    {
      name: 'HiveWeather',
      url: '#',
      emoji: '🌤',
      tagline: 'Weather as it feels, not just as it is.',
      description: 'Coming soon.',
      color: '#2a5a7a',
      status: 'soon',
    },
    {
      name: 'HiveConfession',
      url: '#',
      emoji: '🤫',
      tagline: 'Say the thing you haven\'t said.',
      description: 'Coming soon.',
      color: '#2a5a7a',
      status: 'soon',
    },
  ]

  const stripe = {
    monthly: 'https://buy.stripe.com/14A6oJ6Mv3sReEa0YV0RG00',
    yearly: 'https://buy.stripe.com/7sYcN79YHe7v53AcHD0RG01',
    once: 'https://buy.stripe.com/9B6aEZ7Qzd3rcw2bDz0RG02',
  }

  return (
    <main style={{minHeight:'100vh', background:'#060a14', display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 20px'}}>
      <div style={{width:'100%', maxWidth:'680px', display:'flex', flexDirection:'column', gap:'48px'}}>

        <div style={{textAlign:'center', display:'flex', flexDirection:'column', gap:'16px'}}>
          <div style={{fontSize:'48px'}}>🐝</div>
          <h1 style={{fontSize:'clamp(32px,8vw,52px)', fontWeight:'700', margin:0, letterSpacing:'-0.03em'}}>Hive</h1>
          <p style={{fontSize:'18px', color:'#4a7fa5', margin:0, lineHeight:'1.6'}}>Free tools for everyone. Built for the community first.</p>
          <p style={{fontSize:'14px', color:'#2a4a6a', margin:0, maxWidth:'480px', marginLeft:'auto', marginRight:'auto', lineHeight:'1.7'}}>
            Hive builds AI-powered tools that are free at the base tier, forever. No ads. No investors. Optional support if you love what we make.
          </p>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
          <div style={{fontSize:'11px', color:'#2a4a6a', textTransform:'uppercase', letterSpacing:'0.12em'}}>Engines</div>
          {engines.map(e => (
            <a key={e.name} href={e.status === 'live' ? e.url : undefined}
              style={{background:'#0a1a2e', border:`1px solid ${e.status==='live'?'#1a3a5c':'#0d1f35'}`, borderRadius:'16px', padding:'24px', textDecoration:'none', color:'inherit', display:'flex', gap:'20px', alignItems:'flex-start', opacity:e.status==='live'?1:0.5, cursor:e.status==='live'?'pointer':'default', transition:'border-color 0.2s'}}>
              <div style={{fontSize:'32px', flexShrink:0}}>{e.emoji}</div>
              <div style={{display:'flex', flexDirection:'column', gap:'6px', flex:1}}>
                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                  <span style={{fontSize:'18px', fontWeight:'700', color:'#e8f4ff'}}>{e.name}</span>
                  {e.status === 'live'
                    ? <span style={{fontSize:'10px', background:'#0d2a1a', color:'#4a9a6a', borderRadius:'20px', padding:'2px 8px', fontWeight:'600'}}>LIVE</span>
                    : <span style={{fontSize:'10px', background:'#0d1f35', color:'#2a5a7a', borderRadius:'20px', padding:'2px 8px', fontWeight:'600'}}>SOON</span>
                  }
                </div>
                <div style={{fontSize:'14px', color:'#4a7fa5', fontStyle:'italic'}}>{e.tagline}</div>
                <div style={{fontSize:'13px', color:'#2a5a7a', lineHeight:'1.6'}}>{e.description}</div>
              </div>
              {e.status === 'live' && <div style={{color:'#1a3a5c', fontSize:'20px', flexShrink:0, alignSelf:'center'}}>→</div>}
            </a>
          ))}
        </div>

        <div style={{background:'#0a1a2e', border:'1px solid #1a3a5c', borderRadius:'16px', padding:'28px', display:'flex', flexDirection:'column', gap:'16px'}}>
          <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
            <span style={{fontSize:'16px', fontWeight:'700', color:'#e8f4ff'}}>Support Hive</span>
            <span style={{fontSize:'13px', color:'#4a7fa5', lineHeight:'1.6'}}>Everything we build is free. If Hive becomes part of your day, support it when you can. It keeps the engines running and the community first.</span>
          </div>
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
            <a href={stripe.monthly} target='_blank' rel='noopener noreferrer' style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'10px', padding:'10px 16px', color:'#c8e0f0', fontSize:'13px', textDecoration:'none', fontWeight:'500'}}>$1.99 / month</a>
            <a href={stripe.yearly} target='_blank' rel='noopener noreferrer' style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'10px', padding:'10px 16px', color:'#c8e0f0', fontSize:'13px', textDecoration:'none', fontWeight:'500'}}>$19 / year</a>
            <a href={stripe.once} target='_blank' rel='noopener noreferrer' style={{background:'#0d1f35', border:'1px solid #1a3a5c', borderRadius:'10px', padding:'10px 16px', color:'#c8e0f0', fontSize:'13px', textDecoration:'none', fontWeight:'500'}}>$5 one-time</a>
          </div>
        </div>

        <div style={{borderTop:'1px solid #0d1f35', paddingTop:'24px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px'}}>
          <span style={{fontSize:'12px', color:'#1a3a5c'}}>Hive · Free forever at the base tier</span>
          <a href='https://creator-console-steel.vercel.app' target='_blank' rel='noopener noreferrer' style={{fontSize:'11px', color:'#0d1f35', textDecoration:'none'}}>console</a>
        </div>

      </div>
    </main>
  )
}
