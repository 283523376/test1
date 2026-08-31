package com.housing.market.model;

/** Aggregate statistics over a set of properties. */
public record SummaryStats(
        long count,
        double avgPrice,
        double minPrice,
        double maxPrice,
        double avgSquareFootage,
        double avgPricePerSqFt) {}
