package com.housing.market.controller;

import com.housing.market.model.Filters;
import com.housing.market.model.PagedProperties;
import com.housing.market.model.SegmentBreakdown;
import com.housing.market.model.SummaryStats;
import com.housing.market.model.WhatIfResponse;
import com.housing.market.service.MarketService;
import com.housing.market.service.ModelClient;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

/** App 2 REST API: market analysis, what-if prediction, and data export. */
@RestController
@RequestMapping("/api/market")
@Validated
public class MarketController {

    private final MarketService marketService;
    private final ModelClient modelClient;

    public MarketController(MarketService marketService, ModelClient modelClient) {
        this.marketService = marketService;
        this.modelClient = modelClient;
    }

    @GetMapping("/summary")
    public SummaryStats summary(
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Integer yearMin,
            @RequestParam(required = false) Integer yearMax,
            @RequestParam(required = false) Double distanceMax) {
        return marketService.summary(new Filters(bedrooms, yearMin, yearMax, distanceMax));
    }

    @GetMapping("/segments")
    public SegmentBreakdown segments() {
        return marketService.segments();
    }

    @GetMapping("/properties")
    public PagedProperties properties(
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Integer yearMin,
            @RequestParam(required = false) Integer yearMax,
            @RequestParam(required = false) Double distanceMax,
            @RequestParam(defaultValue = "price") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size) {
        return marketService.properties(
                new Filters(bedrooms, yearMin, yearMax, distanceMax), sortBy, sortDir, page, size);
    }

    @GetMapping("/what-if")
    public WhatIfResponse whatIf(
            @RequestParam("square_footage") @Positive double squareFootage,
            @RequestParam @Min(1) @Max(10) int bedrooms,
            @RequestParam @Positive double bathrooms,
            @RequestParam("year_built") @Min(1800) @Max(2026) int yearBuilt,
            @RequestParam("lot_size") @Positive double lotSize,
            @RequestParam("distance_to_city_center") @PositiveOrZero double distanceToCityCenter,
            @RequestParam("school_rating") @Min(1) @Max(10) double schoolRating) {
        Map<String, Double> features = new LinkedHashMap<>();
        features.put("square_footage", squareFootage);
        features.put("bedrooms", (double) bedrooms);
        features.put("bathrooms", bathrooms);
        features.put("year_built", (double) yearBuilt);
        features.put("lot_size", lotSize);
        features.put("distance_to_city_center", distanceToCityCenter);
        features.put("school_rating", schoolRating);

        double price = modelClient.predict(features);
        return new WhatIfResponse(features, Math.round(price * 100.0) / 100.0);
    }

    @GetMapping(value = "/export", produces = "text/csv")
    public ResponseEntity<byte[]> export(
            @RequestParam(defaultValue = "csv") String format,
            @RequestParam(required = false) Integer bedrooms,
            @RequestParam(required = false) Integer yearMin,
            @RequestParam(required = false) Integer yearMax,
            @RequestParam(required = false) Double distanceMax) {
        String csv = marketService.exportCsv(new Filters(bedrooms, yearMin, yearMax, distanceMax));
        byte[] bytes = csv.getBytes(StandardCharsets.UTF_8);
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDisposition(ContentDisposition.attachment().filename("market-data.csv").build());
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
