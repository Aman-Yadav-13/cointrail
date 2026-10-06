package com.cointrail.service;

import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ColorPaletteService {

    private static final List<String> COLOR_ARSENAL = new ArrayList<>();

    static {
        // Generate 1,200+ visually distinct, vibrant, accessible fintech colors
        // Golden ratio distribution across the 360-degree hue spectrum
        // with balanced saturation (60%-95%) and lightness (40%-60%)
        Set<String> uniqueHexes = new LinkedHashSet<>();
        double goldenRatio = 0.618033988749895;
        double hue = 0.382;

        float[] saturations = new float[]{0.88f, 0.72f, 0.96f, 0.65f, 0.80f};
        float[] lightnesses = new float[]{0.50f, 0.44f, 0.56f, 0.40f, 0.60f};

        // Generate combinations
        for (int i = 0; i < 300 && uniqueHexes.size() < 1500; i++) {
            hue = (hue + goldenRatio) % 1.0;
            for (float s : saturations) {
                for (float l : lightnesses) {
                    String hex = hslToHex((float) hue, s, l);
                    uniqueHexes.add(hex);
                }
            }
        }

        COLOR_ARSENAL.addAll(uniqueHexes);
    }

    public List<String> getArsenal() {
        return Collections.unmodifiableList(COLOR_ARSENAL);
    }

    public int getArsenalSize() {
        return COLOR_ARSENAL.size();
    }

    /**
     * Assigns the next unique color from the arsenal that is not in usedColors.
     */
    public String assignUniqueColor(Set<String> usedColors) {
        Set<String> normalizedUsed = new HashSet<>();
        if (usedColors != null) {
            for (String c : usedColors) {
                if (c != null && !c.isBlank()) {
                    normalizedUsed.add(c.trim().toUpperCase());
                }
            }
        }

        for (String candidate : COLOR_ARSENAL) {
            if (!normalizedUsed.contains(candidate.toUpperCase())) {
                return candidate;
            }
        }

        // Fallback: If more than 1,200 categories exist, generate pseudo-random unique hex
        Random random = new Random();
        for (int attempt = 0; attempt < 500; attempt++) {
            float h = random.nextFloat();
            float s = 0.70f + random.nextFloat() * 0.25f;
            float l = 0.42f + random.nextFloat() * 0.18f;
            String fallbackHex = hslToHex(h, s, l);
            if (!normalizedUsed.contains(fallbackHex.toUpperCase())) {
                return fallbackHex;
            }
        }

        return String.format("#%06X", (0xFFFFFF & random.nextInt(0xFFFFFF)));
    }

    private static String hslToHex(float h, float s, float l) {
        float r, g, b;
        if (s == 0f) {
            r = g = b = l;
        } else {
            float q = l < 0.5f ? l * (1f + s) : l + s - l * s;
            float p = 2f * l - q;
            r = hueToRgb(p, q, h + 1f / 3f);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1f / 3f);
        }
        int red = Math.min(255, Math.max(0, Math.round(r * 255f)));
        int green = Math.min(255, Math.max(0, Math.round(g * 255f)));
        int blue = Math.min(255, Math.max(0, Math.round(b * 255f)));
        return String.format("#%02X%02X%02X", red, green, blue);
    }

    private static float hueToRgb(float p, float q, float t) {
        if (t < 0f) t += 1f;
        if (t > 1f) t -= 1f;
        if (t < 1f / 6f) return p + (q - p) * 6f * t;
        if (t < 1f / 2f) return q;
        if (t < 2f / 3f) return p + (q - p) * (2f / 3f - t) * 6f;
        return p;
    }
}
