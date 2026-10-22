export default function GeneratedAvatar({ seed }: { seed: string }) {
  // Stable across server/client renders; no account data leaves the app.
  let hash = 2166136261;
  for (const character of seed) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619) >>> 0;
  }
  const backgrounds = ["#fce7b5", "#d5e7fd", "#d8eee5", "#e7def9", "#f9dce4", "#d5edf0"];
  const shirts = ["#475569", "#326b82", "#6860a0", "#ad5b4e", "#357765", "#b88735"];
  const skins = ["#f4c7a1", "#dca275", "#b77a54", "#8e5b42"];
  const hairColors = ["#302c32", "#654534", "#3e3833", "#8a5a38"];
  const background = backgrounds[hash % backgrounds.length];
  const shirt = shirts[(hash >>> 4) % shirts.length];
  const skin = skins[(hash >>> 8) % skins.length];
  const hair = hairColors[(hash >>> 12) % hairColors.length];
  const hairstyle = (hash >>> 16) % 3;
  const glasses = (hash >>> 20) % 2 === 0;

  return (
    <svg viewBox="0 0 80 80" fill="none" aria-hidden="true" focusable="false">
      <rect width="80" height="80" rx="40" fill={background} />
      <circle cx="65" cy="17" r="15" fill="white" fillOpacity=".25" />
      <path d="M12 80c1-17 10-25 28-25s27 8 28 25" fill={shirt} />
      <path d="M33 50h14v11c-4 6-10 6-14 0V50Z" fill={skin} />
      <path d="M21 34c0-17 9-23 20-23 14 0 21 10 19 26l-3 17H24l-3-20Z" fill={hair} />
      <ellipse cx="22" cy="39" rx="4" ry="6" fill={skin} />
      <ellipse cx="58" cy="39" rx="4" ry="6" fill={skin} />
      <path d="M24 30c0-12 32-15 32 0v12c0 12-8 18-16 18s-16-6-16-18V30Z" fill={skin} />
      {hairstyle === 0 ? (
        <path d="M22 34c-2-15 6-24 19-24 14 0 21 10 18 23-9-1-15-5-18-12-4 8-10 11-19 13Z" fill={hair} />
      ) : hairstyle === 1 ? (
        <path d="M22 33c-3-15 6-24 20-23 13 1 20 10 16 25l-6-13c-5 7-16 9-30 11Z" fill={hair} />
      ) : (
        <path d="M22 34c-5-5-5-12 0-15-1-7 6-12 12-9 5-5 13-4 16 1 8-1 14 7 10 14l-3 9-5-10c-8 4-18 4-26 1l-4 9Z" fill={hair} />
      )}
      <g fill="#302c32">
        <ellipse cx="33" cy="39" rx="1.8" ry="2.3" />
        <ellipse cx="47" cy="39" rx="1.8" ry="2.3" />
      </g>
      {glasses && (
        <g stroke="#302c32" strokeWidth="1.7">
          <rect x="25" y="33" width="13" height="11" rx="4" />
          <rect x="42" y="33" width="13" height="11" rx="4" />
          <path d="M38 37h4" />
        </g>
      )}
      <path d="M36 48c2 3 6 3 8 0" stroke="#8b4942" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
