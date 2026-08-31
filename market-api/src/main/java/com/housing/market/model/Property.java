package com.housing.market.model;

/** A single housing record from the dataset. */
public record Property(
        long id,
        double squareFootage,
        int bedrooms,
        double bathrooms,
        int yearBuilt,
        double lotSize,
        double distanceToCityCenter,
        double schoolRating,
        double price) {}
