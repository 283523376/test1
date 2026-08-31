package com.housing.market.model;

/** One aggregate row within a segment grouping. */
public record SegmentRow(String key, long count, double avgPrice) {}
