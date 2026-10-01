package com.cointrail.dto;

import java.math.BigDecimal;

public class OverviewDto {
    private BigDecimal totalSpent;
    private long totalTransactions;
    private String topCategory;
    private BigDecimal dailyAverage;
    private BigDecimal highestSingleExpense;

    public OverviewDto() {
    }

    public OverviewDto(BigDecimal totalSpent, long totalTransactions, String topCategory, BigDecimal dailyAverage, BigDecimal highestSingleExpense) {
        this.totalSpent = totalSpent;
        this.totalTransactions = totalTransactions;
        this.topCategory = topCategory;
        this.dailyAverage = dailyAverage;
        this.highestSingleExpense = highestSingleExpense;
    }

    public BigDecimal getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(BigDecimal totalSpent) {
        this.totalSpent = totalSpent;
    }

    public long getTotalTransactions() {
        return totalTransactions;
    }

    public void setTotalTransactions(long totalTransactions) {
        this.totalTransactions = totalTransactions;
    }

    public String getTopCategory() {
        return topCategory;
    }

    public void setTopCategory(String topCategory) {
        this.topCategory = topCategory;
    }

    public BigDecimal getDailyAverage() {
        return dailyAverage;
    }

    public void setDailyAverage(BigDecimal dailyAverage) {
        this.dailyAverage = dailyAverage;
    }

    public BigDecimal getHighestSingleExpense() {
        return highestSingleExpense;
    }

    public void setHighestSingleExpense(BigDecimal highestSingleExpense) {
        this.highestSingleExpense = highestSingleExpense;
    }
}
