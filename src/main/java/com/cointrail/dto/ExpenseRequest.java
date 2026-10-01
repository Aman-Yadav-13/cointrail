package com.cointrail.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ExpenseRequest {

    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotNull(message = "Date is required")
    private LocalDate date;

    private String description;

    public ExpenseRequest() {
    }

    public ExpenseRequest(BigDecimal amount, Long categoryId, LocalDate date, String description) {
        this.amount = amount;
        this.categoryId = categoryId;
        this.date = date;
        this.description = description;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
