package com.cointrail.dto;

import java.math.BigDecimal;

public class CategorySummaryDto {
    private Long categoryId;
    private String categoryName;
    private String color;
    private String icon;
    private BigDecimal totalAmount;
    private Long count;
    private Double percentage;

    public CategorySummaryDto() {
    }

    public CategorySummaryDto(Long categoryId, String categoryName, String color, String icon, BigDecimal totalAmount, Long count) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.color = color;
        this.icon = icon;
        this.totalAmount = totalAmount;
        this.count = count;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }
}
