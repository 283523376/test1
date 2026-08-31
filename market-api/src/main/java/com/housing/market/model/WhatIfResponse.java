package com.housing.market.model;

import java.util.Map;

/** Result of a "what-if" prediction, echoing the inputs and the predicted price. */
public record WhatIfResponse(Map<String, Double> features, double predictedPrice) {}
