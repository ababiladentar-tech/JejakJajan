// Haversine Formula to calculate distance between two points
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance * 1000; // Return in meters
};

// Get vendors within radius
export const getVendorsWithinRadius = (buyerLat, buyerLon, vendors, radiusMeters = 500) => {
  return vendors.filter(vendor => {
    const distance = calculateDistance(buyerLat, buyerLon, vendor.latitude, vendor.longitude);
    return distance <= radiusMeters;
  });
};

// Simple clustering algorithm - group vendors by proximity
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

// Simple linear regression for prediction
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

// Generate heatmap grid data
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
    return { lat, lon, count, intensity: Math.min(count / 10, 1) };
  });
};
