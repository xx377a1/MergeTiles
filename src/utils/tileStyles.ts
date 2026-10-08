export interface TileStyle {
  bgClass: string;
  textClass: string;
  glowClass?: string;
  fontSizeClass: string;
  isSpecial?: boolean;
}

export function getTileStyle(value: number): TileStyle {
  // Determine font size based on digit count
  let fontSizeClass = 'text-3xl sm:text-4xl font-extrabold font-2048';
  if (value >= 100 && value < 1000) {
    fontSizeClass = 'text-2xl sm:text-3xl font-extrabold font-2048';
  } else if (value >= 1000 && value < 10000) {
    fontSizeClass = 'text-xl sm:text-2xl font-black font-2048 tracking-tight';
  } else if (value >= 10000) {
    fontSizeClass = 'text-lg sm:text-xl font-black font-2048 tracking-tighter';
  }

  switch (value) {
    case 2:
      return {
        bgClass: 'bg-[#eee4da]',
        textClass: 'text-[#776e65]',
        fontSizeClass,
      };
    case 4:
      return {
        bgClass: 'bg-[#ede0c8]',
        textClass: 'text-[#776e65]',
        fontSizeClass,
      };
    case 8:
      return {
        bgClass: 'bg-[#f2b179]',
        textClass: 'text-[#f9f6f2]',
        fontSizeClass,
      };
    case 16:
      return {
        bgClass: 'bg-[#f59563]',
        textClass: 'text-[#f9f6f2]',
        fontSizeClass,
      };
    case 32:
      return {
        bgClass: 'bg-[#f67c5f]',
        textClass: 'text-[#f9f6f2]',
        fontSizeClass,
      };
    case 64:
      return {
        bgClass: 'bg-[#f65e3b]',
        textClass: 'text-[#f9f6f2]',
        fontSizeClass,
      };
    case 128:
      return {
        bgClass: 'bg-[#edcf72]',
        textClass: 'text-[#f9f6f2]',
        glowClass: 'shadow-[0_0_12px_rgba(237,207,114,0.4)]',
        fontSizeClass,
      };
    case 256:
      return {
        bgClass: 'bg-[#edcc61]',
        textClass: 'text-[#f9f6f2]',
        glowClass: 'shadow-[0_0_16px_rgba(237,204,97,0.5)]',
        fontSizeClass,
      };
    case 512:
      return {
        bgClass: 'bg-[#edc850]',
        textClass: 'text-[#f9f6f2]',
        glowClass: 'shadow-[0_0_20px_rgba(237,200,80,0.6)]',
        fontSizeClass,
      };
    case 1024:
      return {
        bgClass: 'bg-[#edc53f]',
        textClass: 'text-[#f9f6f2]',
        glowClass: 'shadow-[0_0_25px_rgba(237,197,63,0.7)]',
        fontSizeClass,
      };
    case 2048:
      return {
        bgClass: 'bg-[#edc22e]',
        textClass: 'text-[#f9f6f2]',
        glowClass: 'glow-2048',
        fontSizeClass,
        isSpecial: true,
      };
    case 4096:
    default:
      return {
        bgClass: 'bg-[#3c3a32]',
        textClass: 'text-[#f9f6f2]',
        glowClass: 'shadow-[0_0_30px_rgba(60,58,50,0.8)]',
        fontSizeClass,
        isSpecial: true,
      };
  }
}
