import { Metadata } from 'next';
import Link from 'next/link';

// Pre-define the massive surface area of SEO landing pages we want to generate
const USE_CASES: Record<string, { title: string, description: string, keywords: string }> = {
  'ma-liability-extractor': {
    title: 'M&A Liability Extractor | Universal Document',
    description: 'Instantly extract hidden liability shifts and indemnifications from Mergers & Acquisitions contracts using military-grade AI.',
    keywords: 'm&a liability, m&a due diligence, contract AI, liability extractor'
  },
  'nda-breach-analyzer': {
    title: 'NDA Breach Analyzer | Universal Document',
    description: 'Automatically scan Non-Disclosure Agreements for non-standard breach definitions and excessive penalty clauses.',
    keywords: 'nda breach, nda AI analysis, non-disclosure agreement software'
  },
  'employment-agreement-validator': {
    title: 'Employment Agreement Validator | Universal Document',
    description: 'Verify employment contracts against state-specific labor laws and flag illegal non-compete clauses in seconds.',
    keywords: 'employment contract AI, non-compete analyzer, labor law validation'
  }
};

// Generate metadata dynamically for Googlebot
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = USE_CASES[params.slug];
  
  if (!data) {
    return { title: 'Use Case Not Found' };
  }

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    openGraph: {
      title: data.title,
      description: data.description,
      type: 'website',
    }
  };
}

// Generate the static routes for Vercel
export function generateStaticParams() {
  return Object.keys(USE_CASES).map((slug) => ({
    slug: slug,
  }));
}

export default function UseCasePage({ params }: { params: { slug: string } }) {
  const data = USE_CASES[params.slug];

  if (!data) {
    return <div style={{ color: 'white' }}>Use Case Not Found</div>;
  }

  // JSON-LD structured data for Google Rich Snippets
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: data.title,
    applicationCategory: 'BusinessApplication',
    description: data.description,
    offers: {
      '@type': 'Offer',
      price: '499.00',
      priceCurrency: 'USD'
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <header style={{ padding: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '1.5rem' }}>Universal Document: ud-contract</div>
      </header>

      <main style={{ maxWidth: '800px', margin: '4rem auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '3.5rem', marginBottom: '1.5rem', lineHeight: '1.2' }}>{data.title.split(' | ')[0]}</h1>
        <p style={{ fontSize: '1.5rem', color: '#94a3b8', marginBottom: '3rem', lineHeight: '1.6' }}>
          {data.description}
        </p>

        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(212,175,55,0.3)', padding: '2rem', borderRadius: '12px' }}>
          <h2 style={{ color: '#D4AF37', marginBottom: '1rem' }}>How it works</h2>
          <ol style={{ paddingLeft: '1.5rem', lineHeight: '2' }}>
            <li>Upload your raw PDF or DOCX file.</li>
            <li>Our Anthropic-powered parser extracts the exact legal clauses you need.</li>
            <li>Data is normalized into the Universal Document JSON format.</li>
            <li><strong>Bring Your Own Storage (BYOS):</strong> We securely route the output to your own AWS S3 bucket. Zero liability.</li>
          </ol>
          
          <Link href="/" style={{ display: 'inline-block', marginTop: '2rem', background: '#D4AF37', color: '#020617', padding: '1rem 2rem', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none' }}>
            Start Parsing Now
          </Link>
        </div>
      </main>
    </div>
  );
}
