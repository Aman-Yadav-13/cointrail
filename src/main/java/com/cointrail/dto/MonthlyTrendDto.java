package com.cointrail.dto;

import java.math.BigDecimal;

public class MonthlyTrendDto {
    private int month;
    private String monthName;
    private BigDecimal totalAmount;
    private long count;

    public MonthlyTrendDto() {
    }

    public MonthlyTrendDto(int month, String monthName, BigDecimal totalAmount, long count) {
        this.month = month;
        this.monthName = monthName;
        this.totalAmount = totalAmount;
        this.count = count;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public String getMonthName() {
        return monthName;
    }

    public void setMonthName(String monthName) {
        this.monthName = monthName;
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
}
