package com.cointrail;

import com.cointrail.dto.AuthResponse;
import com.cointrail.dto.CategoryDto;
import com.cointrail.dto.ExpenseRequest;
import com.cointrail.dto.LoginRequest;
import com.cointrail.dto.RegisterRequest;
import com.cointrail.model.Category;
import com.cointrail.model.ExpenseEntry;
import com.cointrail.repository.CategoryRepository;
import com.cointrail.repository.ExpenseEntryRepository;
import com.cointrail.repository.UserRepository;
import com.cointrail.service.AuthService;
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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    private String authToken;

    @BeforeEach
    void setUp() {
        expenseEntryRepository.deleteAll();
        categoryRepository.findAll().stream().filter(c -> !c.isDefault()).forEach(categoryRepository::delete);

        // Register or login test user
        if (!userRepository.existsByEmail("testflow@example.com")) {
            RegisterRequest registerReq = new RegisterRequest("Test User", "testflow@example.com", "9876543210", "password123");
            AuthResponse authRes = authService.register(registerReq);
            authToken = authRes.getToken();
        } else {
            LoginRequest loginReq = new LoginRequest("testflow@example.com", "password123");
            authToken = authService.login(loginReq).getToken();
        }
    }

    @Test
    void testSignupAndLoginWithEmailOnly() throws Exception {
        String testEmail = "newperson" + System.currentTimeMillis() + "@example.com";
        String testPhone = "9" + String.valueOf(System.currentTimeMillis()).substring(4);
        RegisterRequest signup = new RegisterRequest("New Person", testEmail, testPhone, "secret123");
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signup)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is(testEmail)))
                .andExpect(jsonPath("$.user.fullName", is("New Person")));

        LoginRequest login = new LoginRequest(testEmail, "secret123");
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token", notNullValue()))
                .andExpect(jsonPath("$.user.email", is(testEmail)));
    }

    @Test
    void testCategoriesEndpointReturnsDefaultCategories() throws Exception {
        mockMvc.perform(get("/api/categories")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(9))))
                .andExpect(jsonPath("$[*].name", hasItem("Food & Dining")))
                .andExpect(jsonPath("$[*].name", hasItem("Shopping")));
    }

    @Test
    void testCreateAndEditCategory() throws Exception {
        CategoryDto newCategory = new CategoryDto(null, "Cryptocurrency", "#F59E0B", "Coins", false);

        String response = mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCategory)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.name", is("Cryptocurrency")))
                .andReturn().getResponse().getContentAsString();

        Category created = objectMapper.readValue(response, Category.class);

        CategoryDto updatedCategory = new CategoryDto(null, "Crypto & Web3", "#10B981", "Coins", false);
        mockMvc.perform(put("/api/categories/" + created.getId())
                        .header("Authorization", "Bearer " + authToken)
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
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exp1)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", notNullValue()))
                .andExpect(jsonPath("$.amount", is(500.00)));

        mockMvc.perform(post("/api/entries")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(exp2)))
                .andExpect(status().isCreated());

        // 2. Query entries with date filter
        mockMvc.perform(get("/api/entries?startDate=2026-10-01&endDate=2026-10-31")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        // 3. Category summary (Pie chart data)
        mockMvc.perform(get("/api/analytics/category-summary?startDate=2026-10-01&endDate=2026-10-31")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].categoryName", is("Shopping")))
                .andExpect(jsonPath("$[0].totalAmount", is(1500.00)))
                .andExpect(jsonPath("$[0].percentage", is(75.0)));

        // 4. Monthly trend (Bar chart data)
        mockMvc.perform(get("/api/analytics/monthly-trend?year=2026")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(12)))
                .andExpect(jsonPath("$[9].month", is(10))) // October
                .andExpect(jsonPath("$[9].totalAmount", is(2000.00)));

        // 5. Overview stats
        mockMvc.perform(get("/api/analytics/overview?startDate=2026-10-01&endDate=2026-10-31")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSpent", is(2000.00)))
                .andExpect(jsonPath("$.totalTransactions", is(2)))
                .andExpect(jsonPath("$.topCategory", is("Shopping")));
    }
}
