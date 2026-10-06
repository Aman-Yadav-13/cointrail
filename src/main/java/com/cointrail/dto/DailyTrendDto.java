package com.cointrail.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class DailyTrendDto {
    private int day;
    private LocalDate date;
    private String dayName;
    private BigDecimal totalAmount;
    private long count;
    private List<CategorySummaryDto> categoryBreakdowns = new ArrayList<>();

    public DailyTrendDto() {
    }

    public DailyTrendDto(int day, LocalDate date, String dayName, BigDecimal totalAmount, long count, List<CategorySummaryDto> categoryBreakdowns) {
        this.day = day;
        this.date = date;
        this.dayName = dayName;
        this.totalAmount = totalAmount;
        this.count = count;
        this.categoryBreakdowns = categoryBreakdowns != null ? categoryBreakdowns : new ArrayList<>();
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getDayName() {
        return dayName;
    }

    public void setDayName(String dayName) {
        this.dayName = dayName;
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
