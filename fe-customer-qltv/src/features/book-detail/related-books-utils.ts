export const FALLBACK_RELATED_COVER =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBaeF2Ys1nYmj59Sx6DOTKtht8o6kdHmHBt-17IyFw62KQpwWNvlhlQGdyYbu1g3_7MgvRyxHrOMZSOPr5Uphl9kSZUtWBs0_S2TfzAO904dSgwGq26FBqtjlTOFaM1Oq3IDHcOSoleLVLyWKsNR-9yPFKfrJ8fGKCnvXDtxdfpRczN_-8nJl2eUNC88Q9NsYrpnCUHjWy4anZJYJDkcysnyhloohNRJ5wSv5GwwfueJQPzx1J-BpevKu3w7R1xEh7OjSWlfkKzd-Ie";

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
