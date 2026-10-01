package com.cointrail.controller;

import com.cointrail.dto.ExpenseRequest;
import com.cointrail.model.ExpenseEntry;
import com.cointrail.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/entries")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public ResponseEntity<List<ExpenseEntry>> getExpenses(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(expenseService.getExpenses(startDate, endDate, categoryId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenseEntry> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PostMapping
    public ResponseEntity<ExpenseEntry> createExpense(@Valid @RequestBody ExpenseRequest request) {
        ExpenseEntry created = expenseService.createExpense(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseEntry> updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseRequest request) {
        ExpenseEntry updated = expenseService.updateExpense(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
