/** The source has no per-company verification date. Do not infer one from generatedAt. */
export const hasCovidEraPolicy = (value: string) =>
  /코로나|covid(?:-19)?|팬데믹|방역|거리두기/iu.test(value);

export const formatRecordedPolicy = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "기록 없음";
  if (/^[oO](?=\s|$|[(/,])/u.test(trimmed)) {
    return trimmed.replace(/^[oO]/u, "원본 표기: O");
  }
  if (/^[xX](?=\s|$|[(/,])/u.test(trimmed)) {
    return trimmed.replace(/^[xX]/u, "원본 표기: X");
  }

  return trimmed;
};
