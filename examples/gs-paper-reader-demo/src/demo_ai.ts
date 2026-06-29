export function explainText(text: string): string {
  const trimmed = normalize(text);
  return `Mock explanation: this passage says that ${trimmed.toLowerCase()} The demo keeps this as an AI suggestion until the user confirms it.`;
}
export function summarizeText(text: string): string {
  const sentences = normalize(text).split(/(?<=[.!?])\s+/).filter(Boolean);
  return `Mock summary: ${sentences.slice(0, 2).join(" ") || "no readable text was available."}`;
}
export function extractionHint(text: string): string {
  return `Candidate extraction value: ${normalize(text).slice(0, 220)}`;
}
function normalize(text: string): string { return text.replace(/\s+/g, " ").trim(); }
