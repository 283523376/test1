package com.housing.market.model;

/** Optional filters applied to market-analysis queries. */
public record Filters(
        Integer bedrooms,
        Integer yearMin,
        Integer yearMax,
        Double distanceMax) {}
