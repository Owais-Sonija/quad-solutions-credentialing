const BLOCKED_WORDS = [
  'fuck', 'shit', 'ass', 'bitch', 'damn', 'crap',
  'porn', 'sex', 'nude', 'naked', 'xxx',
  'kill', 'murder', 'terrorist', 'bomb',
  'hack', 'crack', 'exploit', 'malware', 'virus'
];

export const containsBlockedContent = (text: string): boolean => {
  if (!text) return false;
  const lower = text.toLowerCase();
  return BLOCKED_WORDS.some(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    return regex.test(lower);
  });
};

export const sanitizeText = (text: string): string => {
  if (!text) return text;
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
};
