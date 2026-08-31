package com.housing.market.model;

import java.util.List;

/** Page of properties returned by /properties. */
public record PagedProperties(List<Property> items, long total, int page, int size) {}
