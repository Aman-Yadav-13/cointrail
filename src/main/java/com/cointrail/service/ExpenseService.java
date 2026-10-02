package com.cointrail.service;

import com.cointrail.dto.CategorySummaryDto;
import com.cointrail.dto.ExpenseRequest;
import com.cointrail.dto.MonthlyTrendDto;
import com.cointrail.dto.OverviewDto;
import com.cointrail.model.Category;
import com.cointrail.model.ExpenseEntry;
import com.cointrail.model.User;
import com.cointrail.repository.ExpenseEntryRepository;
import com.cointrail.security.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseEntryRepository expenseEntryRepository;
    private final CategoryService categoryService;
    private final SecurityUtils securityUtils;

    public ExpenseService(ExpenseEntryRepository expenseEntryRepository,
                          CategoryService categoryService,
                          SecurityUtils securityUtils) {
        this.expenseEntryRepository = expenseEntryRepository;
        this.categoryService = categoryService;
        this.securityUtils = securityUtils;
    }

    @Transactional(readOnly = true)
    public List<ExpenseEntry> getExpenses(LocalDate startDate, LocalDate endDate, Long categoryId) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        User currentUser = securityUtils.getCurrentUser();

        if (currentUser != null) {
            if (categoryId != null) {
                return expenseEntryRepository.findByUserAndDateBetweenAndCategoryIdOrderByDateDescCreatedAtDesc(currentUser, start, end, categoryId);
            }
            return expenseEntryRepository.findByUserAndDateBetweenOrderByDateDescCreatedAtDesc(currentUser, start, end);
        }

        return expenseEntryRepository.findByDateBetweenOrderByDateDescCreatedAtDesc(start, end);
    }

    @Transactional(readOnly = true)
    public ExpenseEntry getExpenseById(Long id) {
        ExpenseEntry entry = expenseEntryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found with id: " + id));

        User currentUser = securityUtils.getCurrentUser();
        if (entry.getUser() != null && currentUser != null && !entry.getUser().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this expense");
        }
        return entry;
    }

    public ExpenseEntry createExpense(ExpenseRequest request) {
        User currentUser = securityUtils.getCurrentUser();
        Category category = categoryService.getCategoryById(request.getCategoryId());

        ExpenseEntry entry = new ExpenseEntry();
        entry.setAmount(request.getAmount());
        entry.setCategory(category);
        entry.setDate(request.getDate());
        entry.setDescription(request.getDescription());
        entry.setUser(currentUser);
        return expenseEntryRepository.save(entry);
    }

    public ExpenseEntry updateExpense(Long id, ExpenseRequest request) {
        ExpenseEntry entry = getExpenseById(id);
        Category category = categoryService.getCategoryById(request.getCategoryId());
        entry.setAmount(request.getAmount());
        entry.setCategory(category);
        entry.setDate(request.getDate());
        entry.setDescription(request.getDescription());
        return expenseEntryRepository.save(entry);
    }

    public void deleteExpense(Long id) {
        ExpenseEntry entry = getExpenseById(id);
        expenseEntryRepository.delete(entry);
    }

    @Transactional(readOnly = true)
    public List<CategorySummaryDto> getCategorySummaries(LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        User currentUser = securityUtils.getCurrentUser();

        List<CategorySummaryDto> summaries;
        if (currentUser != null) {
            summaries = expenseEntryRepository.findCategorySummariesBetweenForUser(currentUser, start, end);
        } else {
            summaries = expenseEntryRepository.findCategorySummariesBetween(start, end);
        }

        BigDecimal grandTotal = summaries.stream()
                .map(CategorySummaryDto::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (grandTotal.compareTo(BigDecimal.ZERO) > 0) {
            for (CategorySummaryDto item : summaries) {
                double pct = item.getTotalAmount()
                        .multiply(BigDecimal.valueOf(100))
                        .divide(grandTotal, 2, RoundingMode.HALF_UP)
                        .doubleValue();
                item.setPercentage(pct);
            }
        }
        return summaries;
    }

    @Transactional(readOnly = true)
    public List<MonthlyTrendDto> getMonthlyTrend(int year) {
        LocalDate startOfYear = LocalDate.of(year, 1, 1);
        LocalDate endOfYear = LocalDate.of(year, 12, 31);
        User currentUser = securityUtils.getCurrentUser();

        List<ExpenseEntry> entries;
        if (currentUser != null) {
            entries = expenseEntryRepository.findByUserAndDateBetween(currentUser, startOfYear, endOfYear);
        } else {
            entries = expenseEntryRepository.findByDateBetween(startOfYear, endOfYear);
        }

        // Pre-populate all 12 months with zero
        Map<Integer, BigDecimal> monthlyTotals = new HashMap<>();
        Map<Integer, Long> monthlyCounts = new HashMap<>();
        for (int m = 1; m <= 12; m++) {
            monthlyTotals.put(m, BigDecimal.ZERO);
            monthlyCounts.put(m, 0L);
        }

        for (ExpenseEntry entry : entries) {
            int m = entry.getDate().getMonthValue();
            monthlyTotals.put(m, monthlyTotals.get(m).add(entry.getAmount()));
            monthlyCounts.put(m, monthlyCounts.get(m) + 1);
        }

        List<MonthlyTrendDto> result = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            String monthName = Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            result.add(new MonthlyTrendDto(m, monthName, monthlyTotals.get(m), monthlyCounts.get(m)));
        }
        return result;
    }

    @Transactional(readOnly = true)
    public OverviewDto getOverview(LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        User currentUser = securityUtils.getCurrentUser();

        List<ExpenseEntry> entries;
        if (currentUser != null) {
            entries = expenseEntryRepository.findByUserAndDateBetween(currentUser, start, end);
        } else {
            entries = expenseEntryRepository.findByDateBetween(start, end);
        }

        BigDecimal totalSpent = BigDecimal.ZERO;
        BigDecimal highest = BigDecimal.ZERO;
        Map<Category, BigDecimal> categoryTotals = new HashMap<>();

        for (ExpenseEntry entry : entries) {
            totalSpent = totalSpent.add(entry.getAmount());
            if (entry.getAmount().compareTo(highest) > 0) {
                highest = entry.getAmount();
            }
            Category cat = entry.getCategory();
            categoryTotals.put(cat, categoryTotals.getOrDefault(cat, BigDecimal.ZERO).add(entry.getAmount()));
        }

        Map.Entry<Category, BigDecimal> topEntry = categoryTotals.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .orElse(null);

        String topCategory = topEntry != null ? topEntry.getKey().getName() : "None";
        String topCategoryIcon = topEntry != null ? topEntry.getKey().getIcon() : null;
        String topCategoryColor = topEntry != null ? topEntry.getKey().getColor() : null;

        LocalDate today = LocalDate.now();
        // Cap the period end date to today if the filter extends into the future,
        // so we only average across days that have actually elapsed.
        LocalDate effectiveEnd = end.isAfter(today) ? today : end;

        long daysElapsed = 0;
        if (!start.isAfter(today)) {
            daysElapsed = ChronoUnit.DAYS.between(start, effectiveEnd) + 1;
        }

        BigDecimal dailyAvg = daysElapsed > 0 && totalSpent.compareTo(BigDecimal.ZERO) > 0
                ? totalSpent.divide(BigDecimal.valueOf(daysElapsed), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new OverviewDto(totalSpent, entries.size(), topCategory, topCategoryIcon, topCategoryColor, dailyAvg, highest);
    }
}
