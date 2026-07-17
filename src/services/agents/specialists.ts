import type { AgentState } from './state';
import { callGemini } from '../gemini';
import { MOCK_LIVE_MATCH } from '../../data/mockData';
import { STADIUMS } from '../../data/stadiums';

/**
 * Navigator Node: Computes step-by-step directions to seats, food, toilets,
 * medical rooms, exits, or parking bays.
 */
export async function navigatorNode(state: AgentState): Promise<AgentState> {
  const nextState = { 
    ...state, 
    currentNode: 'navigator', 
    executionTrace: [...state.executionTrace, 'navigator'],
    context: { ...state.context }
  };

  const query = nextState.query.toLowerCase();
  const stadium = STADIUMS.find(s => s.id === state.stadiumId) || STADIUMS[0];
  let destType: 'seat' | 'food' | 'toilet' | 'medical' | 'exit' | 'parking' = 'seat';

  if (query.includes('food') || query.includes('eat') || query.includes('drink') || query.includes('burger')) {
    destType = 'food';
  } else if (query.includes('toilet') || query.includes('restroom') || query.includes('bathroom') || query.includes('washroom')) {
    destType = 'toilet';
  } else if (query.includes('medical') || query.includes('doctor') || query.includes('first aid') || query.includes('nurse')) {
    destType = 'medical';
  } else if (query.includes('exit') || query.includes('leave') || query.includes('gate')) {
    destType = 'exit';
  } else if (query.includes('park') || query.includes('car') || query.includes('bay')) {
    destType = 'parking';
  }

  // Simulated path coordinates & steps
  const steps: any[] = [];
  if (destType === 'seat') {
    steps.push(
      { instruction: 'Enter through Gate B', landmark: 'Security Checkpoint A', floor: 1 },
      { instruction: 'Take the main escalator to Level 2', floor: 2 },
      { instruction: 'Turn right at the concession stands', landmark: 'KickMate Info Desk' },
      { instruction: 'Section 114 is 40m ahead on the left' },
      { instruction: 'Row C, Seat 22 is near the center aisle ⭐' }
    );
  } else if (destType === 'food') {
    steps.push(
      { instruction: 'Head towards the main Level 1 concourse', floor: 1 },
      { instruction: 'Walk left past Section 108' },
      { instruction: 'Food Court 1 is on your right (Burgers, Tacos & Drinks) 🍔' }
    );
  } else if (destType === 'toilet') {
    steps.push(
      { instruction: 'Walk out to the section concourse Corridor' },
      { instruction: 'Follow the blue signage 30m to the right 🚻' }
    );
  } else if (destType === 'medical') {
    steps.push(
      { instruction: 'Locate the nearest exit corridor' },
      { instruction: 'Take the elevator down to Level 1', floor: 1 },
      { instruction: 'First Aid Room is adjacent to Section 110 ⚕️', landmark: 'Section 110 Entry' }
    );
  } else if (destType === 'parking') {
    steps.push(
      { instruction: 'Head out through the nearest Exit Gate (Gate C)', landmark: 'Exit Gates' },
      { instruction: 'Follow the parking signs towards Lot A North 🅿️' },
      { instruction: 'Your parked vehicle is situated in Lot A North, Bay 14' }
    );
  } else {
    steps.push(
      { instruction: 'Proceed to the nearest perimeter gate' },
      { instruction: 'Main egress exit is at Gate D' }
    );
  }

  nextState.context.routePath = steps.map(s => ({
    instruction: s.instruction,
    landmark: s.landmark,
    floor: s.floor,
    estimatedMinutes: steps.length * 1.5,
  }));

  // Try calling Gemini to generate a custom friendly route instruction
  try {
    const prompt = `Explain step-by-step how to reach the nearest ${destType} at ${stadium.name}. The user query is: "${state.query}". Keep it concise (2-3 sentences max).`;
    const systemPrompt = `You are a helpful stadium Navigator Agent for FIFA 2026. Explain how to get to the ${destType}.`;
    const res = await callGemini({ prompt, systemPrompt });

    if (res.text && !res.error) {
      nextState.output = `🧭 Navigator Agent:\n${res.text}`;
      return nextState;
    }
  } catch {
    // Ignore and use fallback
  }

  // Fallback output
  nextState.output = `🧭 Navigator Agent:\nI've calculated your route to the nearest ${destType} at ${stadium.name}. Enter through Gate B, proceed to the concourse level, and follow the directional signage. See the step-by-step path below for guidance!`;
  return nextState;
}

/**
 * Operations Node: Manages SOS alerts, spill reports, cleanup crew dispatches,
 * and emergency reporting logs.
 */
export async function operationsNode(state: AgentState): Promise<AgentState> {
  const nextState = {
    ...state,
    currentNode: 'operations',
    executionTrace: [...state.executionTrace, 'operations'],
    context: { ...state.context }
  };

  const query = nextState.query.toLowerCase();
  let type: 'medical' | 'spill' | 'security' | 'general' = 'general';

  if (query.includes('spill') || query.includes('cleanup') || query.includes('dirty') || query.includes('mess') || query.includes('clean')) {
    type = 'spill';
  } else if (query.includes('medical') || query.includes('hurt') || query.includes('sick') || query.includes('pain') || query.includes('doctor')) {
    type = 'medical';
  } else if (query.includes('security') || query.includes('fight') || query.includes('suspicious') || query.includes('police')) {
    type = 'security';
  }

  nextState.context.dispatchStatus = {
    type,
    status: 'pending',
    etaMinutes: type === 'medical' ? 2 : type === 'security' ? 3 : 5,
    assignedCrew: type === 'medical' ? 'First Aid Response Team 4' : type === 'security' ? 'Stadium Security Unit 7' : 'CleanUp Crew Section 114',
  };

  try {
    const prompt = `A fan reported: "${state.query}". Describe what operational actions are being taken for this ${type} issue. Be urgent and concise.`;
    const systemPrompt = `You are a Stadium Operations Coordinator Agent for FIFA 2026. A fan has filed an SOS report. Respond reassurance and details about the crew dispatched.`;
    const res = await callGemini({ prompt, systemPrompt });

    if (res.text && !res.error) {
      nextState.output = `🆘 Operations Agent:\n${res.text}`;
      return nextState;
    }
  } catch {
    // Fallback
  }

  const alertLabels = {
    medical: 'medical emergency',
    spill: 'spill/cleanup request',
    security: 'security alert',
    general: 'assistance request',
  };

  nextState.output = `🆘 Operations Agent:\nYour ${alertLabels[type]} has been received. Our ${nextState.context.dispatchStatus.assignedCrew} is on route and will arrive in approximately ${nextState.context.dispatchStatus.etaMinutes} minutes. Please stay calm and look for staff in red/yellow vests.`;
  return nextState;
}

/**
 * Translator Node: Translates conversations, details local stadium/city jargons,
 * and outputs text formatted for speech synthesis.
 */
export async function translatorNode(state: AgentState): Promise<AgentState> {
  const nextState = {
    ...state,
    currentNode: 'translator',
    executionTrace: [...state.executionTrace, 'translator'],
    context: { ...state.context }
  };

  let jargonExplanation = '';

  // Match local transport/jargons based on stadium location
  if (state.stadiumId === 'sofi') {
    if (state.query.toLowerCase().includes('transport') || state.query.toLowerCase().includes('bus') || state.query.toLowerCase().includes('train') || state.query.toLowerCase().includes('metro')) {
      jargonExplanation = 'LA Local Info: In Los Angeles, the subway/light rail is called "Metro". To reach SoFi, you take the Metro K Line to Downtown Inglewood Station and board the SoFi Stadium Shuttle.';
    } else {
      jargonExplanation = 'LA Local Info: "SoFi" refers to SoFi Stadium, located in Hollywood Park, Inglewood. Locals often refer to the surrounding plaza area as "The Lake District".';
    }
  } else if (state.stadiumId === 'atnt') {
    if (state.query.toLowerCase().includes('transport') || state.query.toLowerCase().includes('bus') || state.query.toLowerCase().includes('train') || state.query.toLowerCase().includes('taxi')) {
      jargonExplanation = 'Arlington Info: Arlington, Texas, does not have public trains. Ride-sharing (Uber/Lyft) and the "Arlington Via Ride-Share" service are the primary options.';
    } else {
      jargonExplanation = 'Texas Info: AT&T Stadium is affectionately called "Jerry World" (after Cowboys owner Jerry Jones). It is located next to Globe Life Field (baseball stadium).';
    }
  } else if (state.stadiumId === 'metlife') {
    if (state.query.toLowerCase().includes('transport') || state.query.toLowerCase().includes('bus') || state.query.toLowerCase().includes('train') || state.query.toLowerCase().includes('rail')) {
      jargonExplanation = 'NJ/NY Info: To get back to Manhattan, take the NJ Transit Meadowlands Rail Line from the stadium station back to Secaucus Junction, then transfer to a Penn Station-bound train.';
    } else {
      jargonExplanation = 'MetLife Info: MetLife Stadium sits in the Meadowlands Sports Complex. Locals often call it the "Meadowlands" or just "MetLife".';
    }
  }

  try {
    const prompt = `Translate this fan phrase into ${state.language}: "${state.query}". Return ONLY the translation, no extra text.`;
    const systemPrompt = `You are a translator. Translate the text exactly into ${state.language} without quotes or preambles.`;
    const res = await callGemini({ prompt, systemPrompt });

    if (res.text && !res.error) {
      nextState.context.translationResult = {
        translatedText: res.text.trim(),
        jargonExplained: jargonExplanation || undefined,
      };
      nextState.output = `🌐 Translator Agent:\n"${res.text.trim()}"\n\n${jargonExplanation}`;
      return nextState;
    }
  } catch {
    // Fallback
  }

  // Simple static translation fallback for common queries
  const translated = nextState.query; // Mock translation (echo back)
  nextState.context.translationResult = {
    translatedText: translated,
    jargonExplained: jargonExplanation || undefined,
  };

  nextState.output = `🌐 Translator Agent:\n"${translated}"\n\n${jargonExplanation}`;
  return nextState;
}

/**
 * Match Node: Summarizes live scores, events, scorers, and stats.
 */
export async function matchNode(state: AgentState): Promise<AgentState> {
  const nextState = {
    ...state,
    currentNode: 'match',
    executionTrace: [...state.executionTrace, 'match'],
    context: { ...state.context }
  };

  const match = MOCK_LIVE_MATCH;

  try {
    const prompt = `The fan asked: "${state.query}". Base your answer on these live match details:
Score: ${match.homeTeam.flag} ${match.homeTeam.name} ${match.homeTeam.score} - ${match.awayTeam.score} ${match.awayTeam.name} ${match.awayTeam.flag}.
Minute: ${match.minute}. Scored events: ${JSON.stringify(match.events)}.
Fouls: Home ${match.stats.fouls.home}, Away ${match.stats.fouls.away}.
Possession: Home ${match.stats.possession.home}%, Away ${match.stats.possession.away}%.
Write a very brief, exciting, commentator-style update answering the query (max 3 sentences).`;
    const systemPrompt = `You are a live FIFA 2026 match commentator agent. Give an exciting, short, factual update on the match.`;
    const res = await callGemini({ prompt, systemPrompt });

    if (res.text && !res.error) {
      nextState.output = `⚽ Match Commentator:\n${res.text}`;
      return nextState;
    }
  } catch {
    // Fallback
  }

  nextState.output = `⚽ Match Commentator:\nIt's a heated match here! Brazil ${match.homeTeam.score} – ${match.awayTeam.score} Argentina in the ${match.minute}th minute. Neymar scored in the 38th, while Messi pulled one back in the 67th. Possession is ${match.stats.possession.home}% to ${match.stats.possession.away}% in favor of Brazil!`;
  return nextState;
}
