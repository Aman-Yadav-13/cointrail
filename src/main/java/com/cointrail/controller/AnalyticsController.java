package com.cointrail.controller;

import com.cointrail.dto.CategorySummaryDto;
import com.cointrail.dto.MonthlyTrendDto;
import com.cointrail.dto.OverviewDto;
import com.cointrail.service.ExpenseService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final ExpenseService expenseService;

    public AnalyticsController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping("/category-summary")
    public ResponseEntity<List<CategorySummaryDto>> getCategorySummaries(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(expenseService.getCategorySummaries(startDate, endDate));
    }

    @GetMapping("/monthly-trend")
    public ResponseEntity<List<MonthlyTrendDto>> getMonthlyTrend(
            @RequestParam(required = false) Integer year) {
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        return ResponseEntity.ok(expenseService.getMonthlyTrend(targetYear));
    }

    @GetMapping("/overview")
    public ResponseEntity<OverviewDto> getOverview(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(expenseService.getOverview(startDate, endDate));
    }
}
