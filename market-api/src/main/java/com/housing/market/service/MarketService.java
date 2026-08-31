package com.housing.market.service;

import com.housing.market.model.Filters;
import com.housing.market.model.PagedProperties;
import com.housing.market.model.Property;
import com.housing.market.model.SegmentBreakdown;
import com.housing.market.model.SegmentRow;
import com.housing.market.model.SummaryStats;

import jakarta.annotation.PostConstruct;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/** Loads the dataset in memory and computes aggregates for the market-analysis API. */
@Service
public class MarketService {

    private final List<Property> properties = new ArrayList<>();

    @PostConstruct
    public void init() throws IOException {
        properties.addAll(loadProperties());
    }

    private List<Property> loadProperties() throws IOException {
        List<Property> list = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                new ClassPathResource("data/housing.csv").getInputStream(),
                StandardCharsets.UTF_8))) {
            String line;
            boolean header = true;
            while ((line = reader.readLine()) != null) {
                if (line.isBlank()) {
                    continue;
                }
                if (header) {
                    header = false;
                    continue;
                }
                // id,square_footage,bedrooms,bathrooms,year_built,lot_size,distance_to_city_center,school_rating,price
                String[] c = line.split(",");
                list.add(new Property(
                        Long.parseLong(c[0].trim()),
                        Double.parseDouble(c[1].trim()),
                        Integer.parseInt(c[2].trim()),
                        Double.parseDouble(c[3].trim()),
                        Integer.parseInt(c[4].trim()),
                        Double.parseDouble(c[5].trim()),
                        Double.parseDouble(c[6].trim()),
                        Double.parseDouble(c[7].trim()),
                        Double.parseDouble(c[8].trim())));
            }
        }
        return list;
    }

    private List<Property> filtered(Filters f) {
        return properties.stream()
                .filter(p -> f.bedrooms() == null || p.bedrooms() == f.bedrooms())
                .filter(p -> f.yearMin() == null || p.yearBuilt() >= f.yearMin())
                .filter(p -> f.yearMax() == null || p.yearBuilt() <= f.yearMax())
                .filter(p -> f.distanceMax() == null || p.distanceToCityCenter() <= f.distanceMax())
                .toList();
    }

    @Cacheable("summary")
    public SummaryStats summary(Filters f) {
        List<Property> list = filtered(f);
        if (list.isEmpty()) {
            return new SummaryStats(0, 0, 0, 0, 0, 0);
        }
        double avgPrice = list.stream().mapToDouble(Property::price).average().orElse(0);
        double minPrice = list.stream().mapToDouble(Property::price).min().orElse(0);
        double maxPrice = list.stream().mapToDouble(Property::price).max().orElse(0);
        double avgSqft = list.stream().mapToDouble(Property::squareFootage).average().orElse(0);
        double avgPricePerSqFt = list.stream()
                .mapToDouble(p -> p.price() / p.squareFootage())
                .average()
                .orElse(0);
        return new SummaryStats(
                list.size(),
                round2(avgPrice),
                round2(minPrice),
                round2(maxPrice),
                round2(avgSqft),
                round2(avgPricePerSqFt));
    }

    @Cacheable("segments")
    public SegmentBreakdown segments() {
        return new SegmentBreakdown(byBedrooms(), byYearRange(), byDistanceBand());
    }

    private List<SegmentRow> byBedrooms() {
        return properties.stream()
                .collect(Collectors.groupingBy(Property::bedrooms))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new SegmentRow(e.getKey() + " bed", e.getValue().size(), avgPrice(e.getValue())))
                .toList();
    }

    private List<SegmentRow> byYearRange() {
        return properties.stream()
                .collect(Collectors.groupingBy(p -> yearBand(p.yearBuilt())))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new SegmentRow(e.getKey(), e.getValue().size(), avgPrice(e.getValue())))
                .toList();
    }

    private List<SegmentRow> byDistanceBand() {
        return properties.stream()
                .collect(Collectors.groupingBy(p -> distanceBand(p.distanceToCityCenter())))
                .entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(e -> new SegmentRow(e.getKey(), e.getValue().size(), avgPrice(e.getValue())))
                .toList();
    }

    private String yearBand(int y) {
        if (y < 1985) return "Pre-1985";
        if (y < 1995) return "1985-1994";
        if (y < 2005) return "1995-2004";
        return "2005+";
    }

    private String distanceBand(double d) {
        if (d < 3) return "<3 mi";
        if (d < 5) return "3-5 mi";
        if (d < 7) return "5-7 mi";
        return "7+ mi";
    }

    private double avgPrice(List<Property> list) {
        return round2(list.stream().mapToDouble(Property::price).average().orElse(0));
    }

    public PagedProperties properties(Filters f, String sortBy, String sortDir, int page, int size) {
        List<Property> list = new ArrayList<>(filtered(f));
        list.sort(comparator(sortBy, sortDir));
        long total = list.size();
        int from = Math.min(page * size, list.size());
        int to = Math.min(from + size, list.size());
        return new PagedProperties(List.copyOf(list.subList(from, to)), total, page, size);
    }

    private Comparator<Property> comparator(String sortBy, String sortDir) {
        boolean desc = "desc".equalsIgnoreCase(sortDir);
        Comparator<Property> cmp = switch (sortBy == null ? "price" : sortBy) {
            case "square_footage" -> Comparator.comparingDouble(Property::squareFootage);
            case "bedrooms" -> Comparator.comparingInt(Property::bedrooms);
            case "year_built" -> Comparator.comparingInt(Property::yearBuilt);
            case "lot_size" -> Comparator.comparingDouble(Property::lotSize);
            case "distance_to_city_center" -> Comparator.comparingDouble(Property::distanceToCityCenter);
            case "school_rating" -> Comparator.comparingDouble(Property::schoolRating);
            default -> Comparator.comparingDouble(Property::price);
        };
        return desc ? cmp.reversed() : cmp;
    }

    public String exportCsv(Filters f) {
        StringBuilder sb = new StringBuilder();
        sb.append("id,square_footage,bedrooms,bathrooms,year_built,lot_size,distance_to_city_center,school_rating,price\n");
        for (Property p : filtered(f)) {
            sb.append(p.id()).append(',')
                    .append(num(p.squareFootage())).append(',')
                    .append(p.bedrooms()).append(',')
                    .append(num(p.bathrooms())).append(',')
                    .append(p.yearBuilt()).append(',')
                    .append(num(p.lotSize())).append(',')
                    .append(num(p.distanceToCityCenter())).append(',')
                    .append(num(p.schoolRating())).append(',')
                    .append(num(p.price())).append('\n');
        }
        return sb.toString();
    }

    private static String num(double v) {
        if (v == Math.rint(v)) {
            return String.valueOf((long) v);
        }
        return String.valueOf(v);
    }

    private static double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
