package com.ihab.flink;

public class ItemAggregate {
    private int totalQuantity;

    // Getters and setters

    public int getTotalQuantity() {
        return totalQuantity;
    }

    public void addQuantity(int quantity) {
        this.totalQuantity += quantity;
    }

    public ItemAggregate merge(ItemAggregate other) {
        this.totalQuantity += other.totalQuantity;
        return this;
    }
}
