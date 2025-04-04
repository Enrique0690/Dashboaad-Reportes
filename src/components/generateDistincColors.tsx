interface ColorGeneratorOptions {
    saturationRange?: [number, number];
    lightnessRange?: [number, number];
    shuffle?: boolean;
  }
  
  export class ColorGenerator {
    private baseColors = [
      "#2563eb", // Azul oscuro
      "#60a5fa", // Azul claro
      "#22c55e", // Verde
      "#facc15", // Amarillo
      "#f97316", // Naranja
      "#9333ea", // Morado
    ];
    
    private usedColors = new Set<string>();
    private options: ColorGeneratorOptions;
    private generatedCount = 0;
  
    constructor(options: ColorGeneratorOptions = {}) {
      this.options = {
        saturationRange: [65, 90],  // Rango más ajustado
        lightnessRange: [50, 70],   // Luminosidad media
        shuffle: false,
        ...options
      };
    }
  
    public generateColors(count: number): string[] {
      const colors: string[] = [];
      
      // Primero usamos los colores base en orden
      for (const color of this.baseColors) {
        if (colors.length >= count) break;
        colors.push(color);
        this.usedColors.add(color);
      }
  
      // Si necesitamos más colores, generamos complementarios
      if (colors.length < count) {
        const baseHues = this.baseColors.map(c => this.hexToHsl(c)[0]);
        const additionalColors = this.generateComplementaryColors(
          count - colors.length, 
          baseHues
        );
        colors.push(...additionalColors);
      }
  
      this.generatedCount += colors.length;
      return colors.slice(0, count);
    }
  
    private generateComplementaryColors(count: number, baseHues: number[]): string[] {
      const colors: string[] = [];
      const [sMin, sMax] = this.options.saturationRange!;
      const [lMin, lMax] = this.options.lightnessRange!;
  
      // Generamos colores complementarios basados en los colores base
      for (let i = 0; i < count; i++) {
        const baseHue = baseHues[i % baseHues.length];
        const hueVariation = 30 + (i * 15); // Variación progresiva
        
        // Alternamos entre colores análogos y complementarios
        const hue = (baseHue + (i % 2 === 0 ? hueVariation : -hueVariation + 180)) % 360;
        const saturation = sMin + (sMax - sMin) * 0.7; // Saturación alta pero consistente
        const lightness = lMin + (lMax - lMin) * 0.5; // Luminosidad media
        
        const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        colors.push(color);
      }
  
      return colors;
    }
  
    private hexToHsl(hex: string): [number, number, number] {
      // Convertir HEX a RGB
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
  
      // Convertir RGB a HSL
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0, s = 0, l = (max + min) / 2;
  
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
  
      return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    }
  
    public reset(): void {
      this.usedColors.clear();
      this.generatedCount = 0;
    }
  }