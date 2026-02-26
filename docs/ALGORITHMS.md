# Algorithms & Geolocation Systems

## 1. Haversine Formula (Distance Calculation)

### Purpose
Calculate the great-circle distance between two points on a sphere given their latitudes and longitudes.

### Mathematical Formula
```
a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
c = 2 * atan2(√a, √(1−a))
d = R * c

where:
  Δlat = lat2 - lat1
  Δlon = lon2 - lon1
  R = Earth's radius (6371 km or 6371000 meters)
  d = distance
```

### Implementation
```javascript
// backend/src/algorithms/geolocation.js
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Earth's radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
};
```

### Use Cases
- **Nearby Search**: Find vendors within 500m radius
- **Distance Display**: Show distance from buyer to vendor
- **Geofencing**: Trigger notifications when vendor is near

### Complexity
- Time: O(1) - Constant time
- Space: O(1) - No extra space

### Accuracy
- ±0.5% error for long distances
- Very accurate for distances < 1000 km
- Doesn't account for elevation

---

## 2. Vendor Clustering

### Purpose
Group vendors by geographic proximity for efficient map rendering and heatmap generation.

### Algorithm
```
1. Initialize empty clusters
2. For each unprocessed vendor:
   a. Create new cluster with this vendor
   b. Find all unprocessed vendors within radius
   c. Add them to cluster
   d. Mark as processed
3. Calculate cluster center (average lat/lon)
```

### Implementation
```javascript
export const clusterVendors = (vendors, clusterRadiusMeters = 500) => {
  const clusters = [];
  const processed = new Set();

  vendors.forEach((vendor, index) => {
    if (processed.has(index)) return;

    const cluster = [vendor];
    processed.add(index);

    vendors.forEach((otherVendor, otherIndex) => {
      if (processed.has(otherIndex) || index === otherIndex) return;

      const distance = calculateDistance(
        vendor.latitude,
        vendor.longitude,
        otherVendor.latitude,
        otherVendor.longitude
      );

      if (distance <= clusterRadiusMeters) {
        cluster.push(otherVendor);
        processed.add(otherIndex);
      }
    });

    clusters.push({
      centerLat: cluster.reduce((sum, v) => sum + v.latitude, 0) / cluster.length,
      centerLon: cluster.reduce((sum, v) => sum + v.longitude, 0) / cluster.length,
      vendors: cluster,
      count: cluster.length,
    });
  });

  return clusters;
};
```

### Use Cases
- **Map Performance**: Reduce number of markers at high zoom levels
- **Heatmap Data**: Aggregate statistics by region
- **Route Planning**: Group nearby vendors for delivery optimization

### Complexity
- Time: O(n²) - Pairwise comparison
- Space: O(n) - Store clusters

### Optimization Tips
- Use spatial indexing (Quad-tree) for large datasets
- Implement K-means clustering for better results
- Pre-compute clusters on server

---

## 3. Linear Regression (Predictive Analytics)

### Purpose
Predict busy hours and peak locations based on historical sales data.

### Mathematical Formula
```
y = mx + b

where:
  y = predicted value (sales)
  x = time/index
  m = slope
  b = intercept

Slope: m = (n*Σ(xy) - Σx*Σy) / (n*Σx² - (Σx)²)
Intercept: b = (Σy - m*Σx) / n
```

### Implementation
```javascript
export const linearRegression = (data) => {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  data.forEach(([x, y], i) => {
    sumX += i;
    sumY += y;
    sumXY += i * y;
    sumX2 += i * i;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
};

// Usage: Predict next hour sales
const historicalData = [[12, 50], [13, 65], [14, 75], [15, 60]];
const { slope, intercept } = linearRegression(historicalData);
const predictedSales = slope * 16 + intercept;
```

### Use Cases
- **Peak Hour Prediction**: Predict when vendor will be busiest
- **Revenue Forecasting**: Estimate daily revenue
- **Resource Planning**: Plan staffing for peak hours
- **Location Recommendations**: Predict best locations at specific times

### Limitations
- Assumes linear relationship (not always true)
- Sensitive to outliers
- Doesn't account for external factors (weather, events)
- Better with larger datasets

### Improvements
- Use Polynomial Regression for non-linear patterns
- Implement Moving Average for trend smoothing
- Add seasonal adjustment factors
- Use Machine Learning (TensorFlow.js) for complex patterns

---

## 4. Heatmap Generation

### Purpose
Visualize high-activity areas based on vendor density and sales volume.

### Algorithm
```
1. Define grid size (0.01 degrees ≈ 1km)
2. For each vendor:
   a. Quantize coordinates to grid cell
   b. Increment cell count
   c. Add sales value to cell
3. Calculate intensity (0-1) for each cell
4. Return grid data for visualization
```

### Implementation
```javascript
export const generateHeatmapData = (vendors, gridSize = 0.01) => {
  const heatmapGrid = {};
  
  vendors.forEach(vendor => {
    const lat = Math.floor(vendor.latitude / gridSize) * gridSize;
    const lon = Math.floor(vendor.longitude / gridSize) * gridSize;
    const key = `${lat},${lon}`;
    
    heatmapGrid[key] = (heatmapGrid[key] || 0) + 1;
  });

  return Object.entries(heatmapGrid).map(([key, count]) => {
    const [lat, lon] = key.split(',').map(Number);
    return { 
      lat, 
      lon, 
      count, 
      intensity: Math.min(count / 10, 1) 
    };
  });
};
```

### Grid Resolution
```
Grid Size (degrees) | Area (~km)  | Use Case
─────────────────────────────────────────────
0.001               | 0.1 x 0.1   | Detailed local
0.01                | 1 x 1       | District level
0.1                 | 10 x 10     | City level
1.0                 | 100 x 100   | Region level
```

### Visualization
- Use color gradient (blue → red)
- Size proportional to intensity
- Interactive zoom levels

### Complexity
- Time: O(n) - Single pass
- Space: O(unique_cells) - Grid cells

---

## 5. Radius Search (Geofencing)

### Purpose
Find all vendors within a specified radius from a user location.

### Algorithm
```
1. Get user coordinates (lat, lon)
2. Define search radius (default: 500m)
3. For each vendor:
   a. Calculate distance using Haversine
   b. If distance <= radius:
      - Add to results
4. Sort by distance (optional)
5. Return nearby vendors
```

### Implementation
```javascript
export const getVendorsWithinRadius = (
  buyerLat, 
  buyerLon, 
  vendors, 
  radiusMeters = 500
) => {
  return vendors.filter(vendor => {
    const distance = calculateDistance(
      buyerLat,
      buyerLon,
      vendor.latitude,
      vendor.longitude
    );
    return distance <= radiusMeters;
  }).sort((a, b) => {
    const distA = calculateDistance(buyerLat, buyerLon, a.latitude, a.longitude);
    const distB = calculateDistance(buyerLat, buyerLon, b.latitude, b.longitude);
    return distA - distB;
  });
};
```

### Optimization with Spatial Indexing
```javascript
// Quad-tree approach (simplified)
class QuadTree {
  constructor(bounds, capacity = 4) {
    this.bounds = bounds;
    this.capacity = capacity;
    this.points = [];
    this.divided = false;
  }

  search(range) {
    const results = [];
    
    if (!this.bounds.intersects(range)) return results;
    
    this.points.forEach(p => {
      if (range.contains(p)) results.push(p);
    });
    
    if (this.divided) {
      results.push(...this.northeast.search(range));
      results.push(...this.northwest.search(range));
      results.push(...this.southeast.search(range));
      results.push(...this.southwest.search(range));
    }
    
    return results;
  }
}
```

### Complexity
- **Naive**: O(n) - Check all vendors
- **Optimized (Quad-tree)**: O(log n) - Tree traversal

---

## 6. Route Optimization (Shortest Path)

### Purpose
Calculate estimated delivery time and optimal route.

### Simple Implementation (as-the-crow-flies)
```javascript
export const estimateDeliveryTime = (
  vendorLat,
  vendorLon,
  buyerLat,
  buyerLon,
  averageSpeedKmh = 30
) => {
  const distanceKm = calculateDistance(
    vendorLat,
    vendorLon,
    buyerLat,
    buyerLon
  ) / 1000;
  
  const timeHours = distanceKm / averageSpeedKmh;
  const timeMinutes = Math.round(timeHours * 60);
  
  return {
    distance: distanceKm,
    timeMinutes,
    estimatedArrival: new Date(Date.now() + timeMinutes * 60000)
  };
};
```

### Advanced (Dijkstra's Algorithm for actual roads)
```
Future implementation using:
- Google Maps Directions API
- OpenRouteService
- OSRM (Open Source Routing Machine)
```

---

## 7. Rating Calculation

### Purpose
Calculate average rating with time-weighted scoring.

### Simple Average
```javascript
const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
```

### Weighted Average (Recent ratings more important)
```javascript
const weightedRating = (reviews) => {
  const now = Date.now();
  
  let sumWeightedRatings = 0;
  let sumWeights = 0;
  
  reviews.forEach(review => {
    // Weight decreases with age (days)
    const ageInDays = (now - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const weight = Math.exp(-ageInDays / 30); // Half-life: 30 days
    
    sumWeightedRatings += review.rating * weight;
    sumWeights += weight;
  });
  
  return sumWeightedRatings / sumWeights;
};
```

---

## 8. Notification System

### Push Notification Based on Proximity
```javascript
// Check every 30 seconds
setInterval(() => {
  const distance = calculateDistance(
    buyerLat,
    buyerLon,
    vendorLat,
    vendorLon
  );
  
  if (distance <= 500 && distance > 400) {
    // Vendor is getting close
    sendNotification(`${vendorName} is approaching!`);
  }
}, 30000);
```

---

## Performance Comparison

| Algorithm | Time | Space | Use Case |
|-----------|------|-------|----------|
| Haversine | O(1) | O(1) | Distance calc |
| Clustering | O(n²) | O(n) | Map optimization |
| Radius Search | O(n) | O(k) | Nearby vendors |
| Linear Regression | O(n) | O(1) | Prediction |
| Heatmap | O(n) | O(g) | Visualization |

---

## Testing & Validation

### Sample Data
```javascript
const testVendors = [
  { id: 1, latitude: -6.2088, longitude: 106.8456, storeName: "Soto 1" },
  { id: 2, latitude: -6.2098, longitude: 106.8466, storeName: "Soto 2" },
  { id: 3, latitude: -6.2200, longitude: 106.9000, storeName: "Soto 3" }
];

// Test Haversine
const dist = calculateDistance(-6.2088, 106.8456, -6.2098, 106.8466);
console.log(`Distance: ${dist}m`); // Expected: ~1500m

// Test Clustering
const clusters = clusterVendors(testVendors, 2000);
console.log(`Clusters: ${clusters.length}`); // Expected: 1

// Test Radius Search
const nearby = getVendorsWithinRadius(-6.2088, 106.8456, testVendors, 2000);
console.log(`Nearby: ${nearby.length}`); // Expected: 2
```

---

**Version**: 1.0  
**Last Updated**: February 2026
