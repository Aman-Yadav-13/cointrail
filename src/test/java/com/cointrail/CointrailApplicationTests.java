package com.cointrail;

import com.cointrail.service.ColorPaletteService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.HashSet;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class CointrailApplicationTests {

    @Autowired
    private ColorPaletteService colorPaletteService;

    @Test
    void contextLoads() {
    }

    @Test
    void testColorArsenalExceedsThousand() {
        List<String> arsenal = colorPaletteService.getArsenal();
        System.out.println("Color Arsenal Size: " + arsenal.size());
        assertTrue(arsenal.size() > 1000, "Arsenal should have more than 1000 colors, found: " + arsenal.size());

        // Assert all colors are valid hex format and strictly unique
        HashSet<String> uniqueSet = new HashSet<>(arsenal);
        assertEquals(arsenal.size(), uniqueSet.size(), "All colors in arsenal must be unique");

        for (String hex : arsenal) {
            assertTrue(hex.matches("^#[0-9A-Fa-f]{6}$"), "Color " + hex + " must be a valid 6-digit hex string");
        }
    }
}

