package com.example.flink;

import java.util.List;

public class TopKResult {
    private List<ItemAggregate> topItems;

    // Constructor, getters, and setters

    public TopKResult(List<ItemAggregate> topItems) {
        this.topItems = topItems;
    }

    public List<ItemAggregate> getTopItems() {
        return topItems;
    }

    public void setTopItems(List<ItemAggregate> topItems) {
        this.topItems = topItems;
    }
}
