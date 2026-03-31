import { useTheme } from '@/contexts/ThemeContext';

export function AnimatedBackground() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Base background */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          isDark
            ? 'bg-[#0a0e1a]'
            : 'bg-[#f8f9fc]'
        }`}
      />

      {/* Subtle dot grid — industry standard pattern */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark ? 'opacity-[0.035]' : 'opacity-[0.04]'
        }`}
        style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? '#94a3b8' : '#475569'} 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Primary gradient mesh — top right */}
      <div
        className={`absolute -top-1/4 -right-1/4 w-[60vw] h-[60vw] rounded-full blur-[160px] transition-all duration-1000 ${
          isDark
            ? 'bg-gradient-to-br from-primary/[0.07] to-cyan-500/[0.04]'
            : 'bg-gradient-to-br from-primary/[0.06] to-cyan-400/[0.04]'
        }`}
        style={{ animation: 'meshDrift 40s ease-in-out infinite' }}
      />

      {/* Secondary gradient mesh — bottom left */}
      <div
        className={`absolute -bottom-1/4 -left-1/4 w-[50vw] h-[50vw] rounded-full blur-[140px] transition-all duration-1000 ${
          isDark
            ? 'bg-gradient-to-tr from-indigo-500/[0.05] to-primary/[0.03]'
            : 'bg-gradient-to-tr from-indigo-400/[0.04] to-primary/[0.03]'
        }`}
        style={{ animation: 'meshDrift 50s ease-in-out infinite reverse' }}
      />

      {/* Accent gradient mesh — center */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full blur-[180px] transition-all duration-1000 ${
          isDark
            ? 'bg-violet-500/[0.03]'
            : 'bg-violet-400/[0.025]'
        }`}
        style={{ animation: 'meshDrift 35s ease-in-out infinite 10s' }}
      />

      {/* Minimal floating particles — refined, sparse */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`absolute rounded-full transition-opacity duration-700 ${
            isDark ? 'bg-primary/20' : 'bg-primary/15'
          }`}
          style={{
            width: `${1.5 + Math.random() * 2}px`,
            height: `${1.5 + Math.random() * 2}px`,
            left: `${8 + Math.random() * 84}%`,
            top: `${8 + Math.random() * 84}%`,
            animation: `particleFloat ${20 + Math.random() * 30}s ease-in-out infinite ${Math.random() * 20}s`,
          }}
        />
      ))}

      {/* Thin horizontal scan line — very subtle tech feel */}
      <div
        className={`absolute left-0 right-0 h-px transition-opacity duration-700 ${
          isDark ? 'opacity-[0.03]' : 'opacity-[0.02]'
        }`}
        style={{
          background: `linear-gradient(90deg, transparent, ${isDark ? 'hsl(172 66% 50%)' : 'hsl(172 66% 40%)'}, transparent)`,
          animation: 'scanLine 12s linear infinite',
        }}
      />

      {/* Vignette — subtle edge darkening for depth */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isDark ? 'opacity-60' : 'opacity-30'
        }`}
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, hsl(var(--background)) 100%)',
        }}
      />
    </div>
  );
}
