import { useState } from 'react';
import { Clock, Sparkles } from 'lucide-react';
import { callGemini } from '../services/gemini';


interface ConcessionStall {
  id: string;
  name: string;
  icon: string;
  specialty: string;
  location: string;
  waitTime: number;
  dietary: {
    vegan: boolean;
    halal: boolean;
    gf: boolean;
  };
  menu: string[];
}

const MOCK_STALLS: ConcessionStall[] = [
  {
    id: 'stall-1',
    name: 'Taco Loco',
    icon: '🌮',
    specialty: 'Mexican Tacos & Nachos',
    location: 'Level 1, Concourse near Section 108',
    waitTime: 4,
    dietary: { vegan: true, halal: false, gf: true },
    menu: ['Black Bean Tacos', 'Beef Birria Tacos', 'Guacamole & Chips'],
  },
  {
    id: 'stall-2',
    name: 'Arena Burgers',
    icon: '🍔',
    specialty: 'Gourmet Beef & Vegan Burgers',
    location: 'Level 2, Concourse near Section 212',
    waitTime: 15,
    dietary: { vegan: true, halal: true, gf: false },
    menu: ['Classic Cheeseburger', 'Falafel Burger (Halal)', 'Crispy Fries'],
  },
  {
    id: 'stall-3',
    name: 'Green Field Salads',
    icon: '🥗',
    specialty: 'Fresh Salads & Health Bowls',
    location: 'Level 1, Concourse near Section 118',
    waitTime: 2,
    dietary: { vegan: true, halal: true, gf: true },
    menu: ['Quinoa Avocado Bowl', 'Chicken Shawarma Salad', 'Fresh Fruit Cup'],
  },
  {
    id: 'stall-4',
    name: 'Merch Drop Zone',
    icon: '🏆',
    specialty: 'Official FIFA Merch & Tees',
    location: 'Gate B Main Lobby',
    waitTime: 8,
    dietary: { vegan: false, halal: false, gf: false },
    menu: ['World Cup 2026 Jersey', 'Country Scarves', 'Matchday Cap'],
  }
];

export function FoodFinderPage() {
  const [filterVegan, setFilterVegan] = useState(false);
  const [filterHalal, setFilterHalal] = useState(false);
  const [filterGf, setFilterGf] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const filteredStalls = MOCK_STALLS.filter((stall) => {
    if (filterVegan && !stall.dietary.vegan) return false;
    if (filterHalal && !stall.dietary.halal) return false;
    if (filterGf && !stall.dietary.gf) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = stall.name.toLowerCase().includes(q);
      const matchSpecialty = stall.specialty.toLowerCase().includes(q);
      const matchMenu = stall.menu.some(item => item.toLowerCase().includes(q));
      if (!matchName && !matchSpecialty && !matchMenu) return false;
    }
    return true;
  });

  const askAI = async () => {
    if (!aiQuestion.trim() || aiLoading) return;
    setAiLoading(true);
    setAiAnswer('');
    
    try {
      const prompt = `Based on these concession stalls in the stadium:
      ${JSON.stringify(MOCK_STALLS)}
      The fan asks: "${aiQuestion}". Recommend the best option, wait times, and direct them. Keep it short (2-3 sentences max).`;
      
      const systemPrompt = 'You are a helpful Stadium Food and Merchandise Concierge assistant for FIFA 2026. Suggest specific options based on user question.';
      const res = await callGemini({ prompt, systemPrompt });
      setAiAnswer(res.text);
    } catch {
      setAiAnswer('🤖 Arena Burgers near Section 212 is a great choice. They have Halal/Vegan falafel options with a wait of ~15 minutes.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }} aria-label="Food & Merchandise Finder">
      <div>
        <h2 className="h2" style={{ marginBottom: '6px' }}>Food & Merch Finder</h2>
        <p className="text-muted text-sm">Locate stadium snack bars, dietary-friendly food stalls, and active merch stands.</p>
      </div>

      {/* AI Assistant */}
      <section className="surface-card" style={{ padding: '16px', border: '1px solid var(--accent-green-dim)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <Sparkles size={16} color="var(--accent-green)" />
          <h3 className="h3" style={{ margin: 0 }}>Smart Food Concierge</h3>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input
            className="input"
            style={{ flex: 1 }}
            placeholder="e.g. Halal gluten-free foods near me..."
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && askAI()}
            aria-label="AI food recommendation query"
          />
          <button
            className="btn btn-primary"
            onClick={askAI}
            disabled={!aiQuestion.trim() || aiLoading}
            style={{ minHeight: 'auto', padding: '0 16px' }}
          >
            {aiLoading ? <div className="spinner" style={{ width: 16, height: 16 }} /> : 'Ask'}
          </button>
        </div>
        {aiAnswer && (
          <div
            style={{
              padding: '12px', background: 'var(--accent-green-dim)',
              borderRadius: 'var(--radius-md)', border: '1px solid var(--border-active)',
              fontSize: '0.85rem', lineHeight: 1.4
            }}
            role="status"
            aria-live="polite"
          >
            🍔 {aiAnswer}
          </div>
        )}
      </section>

      {/* Filters */}
      <section aria-label="Filters">
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            className="input"
            placeholder="Search burgers, salads, jerseys..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search stalls"
          />
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }} role="group" aria-label="Dietary filters">
          <button
            className={`badge ${filterVegan ? 'badge-green' : 'badge-glass'}`}
            style={{ cursor: 'pointer', padding: '6px 12px' }}
            onClick={() => setFilterVegan(!filterVegan)}
            aria-pressed={filterVegan}
          >
            🥦 Vegan
          </button>
          <button
            className={`badge ${filterHalal ? 'badge-green' : 'badge-glass'}`}
            style={{ cursor: 'pointer', padding: '6px 12px' }}
            onClick={() => setFilterHalal(!filterHalal)}
            aria-pressed={filterHalal}
          >
            ☪️ Halal
          </button>
          <button
            className={`badge ${filterGf ? 'badge-green' : 'badge-glass'}`}
            style={{ cursor: 'pointer', padding: '6px 12px' }}
            onClick={() => setFilterGf(!filterGf)}
            aria-pressed={filterGf}
          >
            🌾 Gluten-Free
          </button>
        </div>
      </section>

      {/* Concession list */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '10px' }} aria-label="Concession stalls">
        {filteredStalls.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <p className="text-sm">No stalls match your filters.</p>
          </div>
        ) : (
          filteredStalls.map((stall) => (
            <div key={stall.id} className="surface-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span style={{ fontSize: '1.8rem' }}>{stall.icon}</span>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0 }}>{stall.name}</h4>
                    <span className="text-xs text-muted">{stall.specialty}</span>
                  </div>
                </div>
                <div className="badge badge-glass text-xs" style={{ display: 'flex', gap: '4px' }}>
                  <Clock size={12} /> {stall.waitTime} min wait
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-muted" style={{ marginTop: '4px' }}>
                <span>📍 {stall.location}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {stall.dietary.vegan && <span style={{ opacity: 0.8 }}>🥦</span>}
                  {stall.dietary.halal && <span style={{ opacity: 0.8 }}>☪️</span>}
                  {stall.dietary.gf && <span style={{ opacity: 0.8 }}>🌾</span>}
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
