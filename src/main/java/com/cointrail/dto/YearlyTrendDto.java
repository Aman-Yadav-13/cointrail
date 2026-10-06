package com.cointrail.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class YearlyTrendDto {
    private int year;
    private BigDecimal totalAmount;
    private long count;
    private List<CategorySummaryDto> categoryBreakdowns = new ArrayList<>();

    public YearlyTrendDto() {
    }

    public YearlyTrendDto(int year, BigDecimal totalAmount, long count, List<CategorySummaryDto> categoryBreakdowns) {
        this.year = year;
        this.totalAmount = totalAmount;
        this.count = count;
        this.categoryBreakdowns = categoryBreakdowns != null ? categoryBreakdowns : new ArrayList<>();
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }

    public List<CategorySummaryDto> getCategoryBreakdowns() {
        return categoryBreakdowns;
    }

    public void setCategoryBreakdowns(List<CategorySummaryDto> categoryBreakdowns) {
        this.categoryBreakdowns = categoryBreakdowns != null ? categoryBreakdowns : new ArrayList<>();
    }
}
