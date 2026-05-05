export function NeuronLogo() {
  return (
    <div className="flex items-center gap-2">
      {/* Stylized N logo */}
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect width="28" height="28" rx="7" fill="url(#logoGrad)" />
        <path
          d="M8 20V8l12 12V8"
          stroke="#070d1f"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
            <stop stopColor="#00d4ff" />
            <stop offset="1" stopColor="#00b4a0" />
          </linearGradient>
        </defs>
      </svg>
      <span className="font-display font-bold text-base text-gradient-cyan tracking-tight">
        neuronfi
      </span>
    </div>
  );
}
