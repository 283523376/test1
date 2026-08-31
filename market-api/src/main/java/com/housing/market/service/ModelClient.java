package com.housing.market.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.Map;

/** Thin client that calls the Task 1 model API's /predict endpoint. */
@Service
public class ModelClient {

    private static final Logger log = LoggerFactory.getLogger(ModelClient.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final RestClient restClient;

    public ModelClient(RestClient.Builder builder, @Value("${model-api.base-url}") String baseUrl) {
        // Use HttpURLConnection (HTTP/1.1) instead of the JDK HttpClient default:
        // the JDK client's h2c upgrade probe is mishandled by uvicorn and drops the body.
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(15));
        this.restClient = builder
                .requestFactory(factory)
                .baseUrl(baseUrl)
                .build();
    }

    public double predict(Map<String, Double> features) {
        try {
            String json = MAPPER.writeValueAsString(features);
            Map<?, ?> response = restClient.post()
                    .uri("/predict")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(json)
                    .retrieve()
                    .body(Map.class);
            if (response == null || response.get("price") == null) {
                throw new RestClientException("Model API returned an empty response");
            }
            return ((Number) response.get("price")).doubleValue();
        } catch (RestClientException e) {
            log.error("Model API call failed: {}", e.getMessage());
            throw new ModelUnavailableException("Model API is unavailable: " + e.getMessage());
        } catch (Exception e) {
            log.error("Model API call error", e);
            throw new ModelUnavailableException("Model API error: " + e.getMessage());
        }
    }
}
