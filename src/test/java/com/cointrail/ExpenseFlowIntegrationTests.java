package com.cointrail;

import com.cointrail.dto.CategoryDto;
import com.cointrail.dto.ExpenseRequest;
import com.cointrail.model.Category;
import com.cointrail.model.ExpenseEntry;
import com.cointrail.repository.CategoryRepository;
import com.cointrail.repository.ExpenseEntryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ExpenseFlowIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseEntryRepository expenseEntryRepository;

    @BeforeEach
    void setUp() {
        expenseEntryRepository.deleteAll();
    }

    @Test
    void testCategoriesEndpointReturnsDefaultCategories() throws Exception {
        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(9))))
                .andExpect(jsonPath("$[*].name", hasItem("Food & Dining")))
                .andExpect(jsonPath("$[*].name", hasItem("Shopping")));
    }

    @Test
    void testCreateAndEditCategory() throws Exception {
        CategoryDto newCategory = new CategoryDto(null, "Cryptocurrency", "#F59E0B", "Coins", false);

        String response = mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCategory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Cryptocurrency")))
                .andReturn().getResponse().getContentAsString();

        Category created = objectMapper.readValue(response, Category.class);

        CategoryDto updatedCategory = new CategoryDto(null, "Crypto & Web3", "#10B981", "Coins", false);
        mockMvc.perform(put("/api/categories/" + created.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedCategory)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name", is("Crypto & Web3")));
    }

    @Test
    void testCreateExpenseAndRetrieveAnalytics() throws Exception {
        Category foodCategory = categoryRepository.findByNameIgnoreCase("Food & Dining").orElseThrow();
        Category shoppingCategory = categoryRepository.findByNameIgnoreCase("Shopping").orElseThrow();

        // 1. Create expenses
        ExpenseRequest exp1 = new ExpenseRequest(BigDecimal.valueOf(500.00), foodCategory.getId(), LocalDate.of(2026, 10, 1), "Grocery dinner");
        ExpenseRequest exp2 = new ExpenseRequest(BigDecimal.valueOf(1500.00), shoppingCategory.getId(), LocalDate.of(2026, 10, 2), "New jacket");

        mockMvc.perform(post("/api/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exp1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.amount", is(500.00)));

        mockMvc.perform(post("/api/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exp2)))
                .andExpect(status().isCreated());

        // 2. Query entries with date filter
        mockMvc.perform(get("/api/entries?startDate=2026-10-01&endDate=2026-10-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        // 3. Category summary (Pie chart data)
        mockMvc.perform(get("/api/analytics/category-summary?startDate=2026-10-01&endDate=2026-10-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].categoryName", is("Shopping")))
                .andExpect(jsonPath("$[0].totalAmount", is(1500.00)))
                .andExpect(jsonPath("$[0].percentage", is(75.0)));

        // 4. Monthly trend (Bar chart data)
        mockMvc.perform(get("/api/analytics/monthly-trend?year=2026"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(12)))
                .andExpect(jsonPath("$[9].month", is(10))) // October
                .andExpect(jsonPath("$[9].totalAmount", is(2000.00)));

        // 5. Overview stats
        mockMvc.perform(get("/api/analytics/overview?startDate=2026-10-01&endDate=2026-10-31"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSpent", is(2000.00)))
                .andExpect(jsonPath("$.totalTransactions", is(2)))
                .andExpect(jsonPath("$.topCategory", is("Shopping")));
    }
}
