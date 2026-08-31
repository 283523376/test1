package com.housing.market.model;

import java.util.List;

/** Average price grouped by three dimensions. */
public record SegmentBreakdown(
        List<SegmentRow> byBedrooms,
        List<SegmentRow> byYearRange,
        List<SegmentRow> byDistanceBand) {}
