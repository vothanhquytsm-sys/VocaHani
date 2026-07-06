export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // Deletion
          dp[i][j - 1] + 1,    // Insertion
          dp[i - 1][j - 1] + 1 // Substitution
        );
      }
    }
  }
  return dp[m][n];
}

export function evaluatePronunciation(target: string, transcript: string): { score: number; message: string } {
  const normTarget = target.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();
  const normTranscript = transcript.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

  if (normTranscript === normTarget) {
    return { score: 100, message: "Tuyệt vời!" };
  }

  if (normTranscript === "") {
    return { score: 0, message: "Chưa nghe rõ, vui lòng thử lại." };
  }

  const distance = levenshteinDistance(normTarget, normTranscript);
  const maxLength = Math.max(normTarget.length, normTranscript.length);
  const rawRatio = Math.round((1 - distance / maxLength) * 100);

  let score = rawRatio;
  if (score < 0) score = 0;

  // Extra check: if normalized transcript exactly contains target or vice-versa
  if (normTranscript.includes(normTarget) || normTarget.includes(normTranscript)) {
    score = Math.max(score, 85);
  }

  let message = "Chưa chính xác lắm.";
  if (score >= 90) {
    message = "Tuyệt vời!";
  } else if (score >= 70) {
    message = "Khá tốt!";
  }

  return { score, message };
}
