import { supabase } from '../config/supabase';

// Smart local chat engine — answers common civic questions from real DB data
// Acts as a full fallback when Gemini quota is exhausted
export async function smartLocalChat(message: string): Promise<string> {
  const q = message.toLowerCase().trim();

  // Fetch all problems once
  const { data: problems } = await supabase
    .from('problems')
    .select('*')
    .order('created_at', { ascending: false });

  const all = problems || [];
  const unresolved = all.filter((p: any) => p.status !== 'resolved');
  const resolved = all.filter((p: any) => p.status === 'resolved');

  // ── Hotspot / area with most issues ─────────────────────────────
  if (/hotspot|most issue|most problem|worst area|top area|highest/i.test(q)) {
    const addressCount: Record<string, number> = {};
    unresolved.forEach((p: any) => {
      const area = (p.address || 'Unknown').split(',')[0].trim();
      addressCount[area] = (addressCount[area] || 0) + 1;
    });
    const sorted = Object.entries(addressCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
    if (sorted.length === 0) return "No active issues found in the database right now.";
    const list = sorted.map(([area, count], i) => `**${i + 1}. ${area}** — ${count} issue${count > 1 ? 's' : ''}`).join('\n');
    return `🔥 **Top Problem Hotspots**\n\n${list}\n\n*Based on ${unresolved.length} active reports in the city.*`;
  }

  // ── Unresolved / pending issues ─────────────────────────────────
  if (/unresolved|pending|open|active|not fixed/i.test(q)) {
    const byCat: Record<string, number> = {};
    unresolved.forEach((p: any) => {
      byCat[p.category] = (byCat[p.category] || 0) + 1;
    });
    const catList = Object.entries(byCat)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, n]) => `• **${cat.replace('_', ' ')}**: ${n}`)
      .join('\n');
    return `📋 **${unresolved.length} Unresolved Issues**\n\n${catList || '(none yet)'}\n\n*${resolved.length} issue${resolved.length !== 1 ? 's' : ''} resolved so far.*`;
  }

  // ── Resolved / fixed issues ──────────────────────────────────────
  if (/resolved|fixed|done|completed|closed/i.test(q)) {
    const rate = all.length > 0 ? Math.round((resolved.length / all.length) * 100) : 0;
    const recent = resolved.slice(0, 3).map((p: any) => `• ${p.title}`).join('\n');
    return `✅ **${resolved.length} Issues Resolved** (${rate}% resolution rate)\n\nRecently fixed:\n${recent || '(none yet)'}`;
  }

  // ── Category specific (pothole, streetlight etc.) ────────────────
  const categories: Record<string, string> = {
    pothole: 'pothole', road: 'road_damage', streetlight: 'streetlight',
    light: 'streetlight', garbage: 'garbage', trash: 'garbage',
    water: 'water_leak', leak: 'water_leak', safety: 'safety_issue'
  };
  for (const [keyword, cat] of Object.entries(categories)) {
    if (q.includes(keyword)) {
      const filtered = unresolved.filter((p: any) => p.category === cat);
      const critical = filtered.filter((p: any) => p.severity === 'critical' || p.severity === 'high');
      return `🔍 **${cat.replace('_', ' ')} Issues: ${filtered.length} open**\n\n• ${critical.length} high/critical priority\n• ${filtered.length - critical.length} low/medium priority\n\nTop reports:\n${filtered.slice(0, 3).map((p: any) => `• ${p.title} _(${p.severity})_`).join('\n') || '(none yet)'}`;
    }
  }

  // ── Critical / urgent issues ─────────────────────────────────────
  if (/critical|urgent|emergency|danger|severe/i.test(q)) {
    const criticals = unresolved.filter((p: any) => p.severity === 'critical' || p.severity === 'high');
    const list = criticals.slice(0, 5).map((p: any) => `• **${p.title}** — ${p.category.replace('_', ' ')} _(${p.severity})_`).join('\n');
    return `🚨 **${criticals.length} Critical/High Priority Issues**\n\n${list || '(none yet)'}\n\nThese need immediate attention from municipal authorities.`;
  }

  // ── Stats / summary ──────────────────────────────────────────────
  if (/stat|summar|overview|total|count|how many/i.test(q)) {
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    unresolved.forEach((p: any) => { (bySeverity as any)[p.severity] = ((bySeverity as any)[p.severity] || 0) + 1; });
    return `📊 **PoliFix City Overview**\n\n• **Total reports:** ${all.length}\n• **Unresolved:** ${unresolved.length}\n• **Resolved:** ${resolved.length}\n• **Resolution rate:** ${all.length > 0 ? Math.round((resolved.length / all.length) * 100) : 0}%\n\n**By Severity:**\n• 🔴 Critical: ${bySeverity.critical}\n• 🟠 High: ${bySeverity.high}\n• 🟡 Medium: ${bySeverity.medium}\n• 🟢 Low: ${bySeverity.low}`;
  }

  // ── Priority / scoring ───────────────────────────────────────────
  if (/priority|score|rank|important/i.test(q)) {
    return `⚡ **PoliFix AI Priority Engine**\n\nEach issue is scored using 4 factors:\n\n1. **Severity** (Critical=10, High=7, Medium=4, Low=2)\n2. **Community verifications** (up to 10 points)\n3. **Location importance** (near schools/hospitals = higher)\n4. **Age** (older unresolved issues get escalated)\n\nTotal score decides the order on the map — highest priority issues appear first.`;
  }

  // ── How to report ────────────────────────────────────────────────
  if (/report|submit|add|create|new issue/i.test(q)) {
    return `📍 **How to Report an Issue**\n\n1. Click **"Report Problem"** in the sidebar\n2. Add a title and description\n3. Select a category (pothole, garbage, etc.)\n4. Pin your location on the map\n5. Optionally upload a photo — **AI auto-detects the problem type!**\n6. Submit — your report is live instantly on the city map.`;
  }

  // ── Near me ─────────────────────────────────────────────────────
  if (/near me|nearby|my area|my location/i.test(q)) {
    return `📍 **Finding Problems Near You**\n\nGo to the **Map** page and:\n1. Allow location access in your browser\n2. The map centers on your location\n3. All markers show problems near you\n4. Toggle **"AI Predictions"** to see future risk zones in your area.`;
  }

  // ── Default helpful response ─────────────────────────────────────
  const sample = unresolved.slice(0, 3).map((p: any) => `• **${p.title}** _(${p.category}: ${p.severity})_`).join('\n');
  return `🤖 **PoliFix AI Assistant**\n\nCity has **${unresolved.length} active issues** right now.\n\n${sample ? `Recent reports:\n${sample}\n\n` : ''}You can ask me:\n• "What are the hotspots?"\n• "Show critical issues"\n• "Pothole problems?"\n• "City stats overview"\n• "How do I report an issue?"`;
}
