#!/usr/bin/env node

/**
 * Performance Test Script for Furniro Authentication System
 * Tests response times, concurrent users, and system load
 */

const API_BASE_URL = 'http://localhost:3002';

// Performance test configuration
const config = {
  concurrentUsers: 10,
  requestsPerUser: 5,
  timeout: 10000, // 10 seconds
  endpoints: [
    { path: '/api/auth/customer/login', method: 'POST', data: { email: 'admin@furniro.com', password: 'admin123', rememberMe: false } },
    { path: '/api/auth/customer/register', method: 'POST', data: { email: `perf-test-${Date.now()}@example.com`, password: 'TestPassword123!', firstName: 'Perf', lastName: 'Test', phone: '+1234567890', acceptsMarketing: false } },
    { path: '/api/public/products', method: 'GET' }
  ]
};

// Performance metrics
const metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  responseTimes: [],
  errors: []
};

// Helper function to make API call with timing
async function makeRequest(endpoint) {
  const startTime = Date.now();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint.path}`, {
      method: endpoint.method,
      headers: { 'Content-Type': 'application/json' },
      body: endpoint.data ? JSON.stringify(endpoint.data) : undefined,
      signal: AbortSignal.timeout(config.timeout)
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    metrics.totalRequests++;
    metrics.responseTimes.push(responseTime);
    
    if (response.ok) {
      metrics.successfulRequests++;
    } else {
      metrics.failedRequests++;
      metrics.errors.push({
        endpoint: endpoint.path,
        status: response.status,
        responseTime
      });
    }
    
    return { success: response.ok, status: response.status, responseTime };
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    metrics.totalRequests++;
    metrics.failedRequests++;
    metrics.responseTimes.push(responseTime);
    metrics.errors.push({
      endpoint: endpoint.path,
      error: error.message,
      responseTime
    });
    
    return { success: false, error: error.message, responseTime };
  }
}

// Simulate concurrent users
async function simulateUser(userId) {
  const userResults = [];
  
  for (let i = 0; i < config.requestsPerUser; i++) {
    const endpoint = config.endpoints[i % config.endpoints.length];
    const result = await makeRequest(endpoint);
    userResults.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return userResults;
}

// Calculate performance statistics
function calculateStats() {
  const responseTimes = metrics.responseTimes;
  const sortedTimes = [...responseTimes].sort((a, b) => a - b);
  
  const stats = {
    totalRequests: metrics.totalRequests,
    successfulRequests: metrics.successfulRequests,
    failedRequests: metrics.failedRequests,
    successRate: (metrics.successfulRequests / metrics.totalRequests * 100).toFixed(2),
    averageResponseTime: (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2),
    minResponseTime: Math.min(...responseTimes),
    maxResponseTime: Math.max(...responseTimes),
    medianResponseTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
    p95ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
    p99ResponseTime: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
    requestsPerSecond: (metrics.totalRequests / (Date.now() - startTime) * 1000).toFixed(2)
  };
  
  return stats;
}

// Load test function
async function runLoadTest() {
  console.log('🚀 Starting Performance Load Test');
  console.log('=' .repeat(50));
  console.log(`📊 Configuration:`);
  console.log(`   Concurrent Users: ${config.concurrentUsers}`);
  console.log(`   Requests per User: ${config.requestsPerUser}`);
  console.log(`   Total Requests: ${config.concurrentUsers * config.requestsPerUser}`);
  console.log(`   Timeout: ${config.timeout}ms`);
  console.log('');
  
  const startTime = Date.now();
  
  // Create concurrent user simulations
  const userPromises = [];
  for (let i = 0; i < config.concurrentUsers; i++) {
    userPromises.push(simulateUser(i + 1));
  }
  
  console.log('⏳ Running load test...');
  
  try {
    await Promise.all(userPromises);
  } catch (error) {
    console.log('❌ Load test failed:', error.message);
    return;
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  const stats = calculateStats();
  
  console.log('\n📈 Performance Results:');
  console.log('=' .repeat(50));
  console.log(`⏱️  Total Test Time: ${totalTime}ms`);
  console.log(`📊 Total Requests: ${stats.totalRequests}`);
  console.log(`✅ Successful: ${stats.successfulRequests}`);
  console.log(`❌ Failed: ${stats.failedRequests}`);
  console.log(`📈 Success Rate: ${stats.successRate}%`);
  console.log(`🚀 Requests/Second: ${stats.requestsPerSecond}`);
  
  console.log('\n⏱️  Response Time Statistics:');
  console.log(`   Average: ${stats.averageResponseTime}ms`);
  console.log(`   Minimum: ${stats.minResponseTime}ms`);
  console.log(`   Maximum: ${stats.maxResponseTime}ms`);
  console.log(`   Median: ${stats.medianResponseTime}ms`);
  console.log(`   95th Percentile: ${stats.p95ResponseTime}ms`);
  console.log(`   99th Percentile: ${stats.p99ResponseTime}ms`);
  
  if (metrics.errors.length > 0) {
    console.log('\n❌ Errors Encountered:');
    metrics.errors.slice(0, 10).forEach((error, index) => {
      console.log(`   ${index + 1}. ${error.endpoint}: ${error.status || error.error} (${error.responseTime}ms)`);
    });
    
    if (metrics.errors.length > 10) {
      console.log(`   ... and ${metrics.errors.length - 10} more errors`);
    }
  }
  
  // Performance assessment
  console.log('\n🎯 Performance Assessment:');
  
  if (stats.successRate >= 95) {
    console.log('✅ Excellent: High success rate');
  } else if (stats.successRate >= 90) {
    console.log('⚠️  Good: Acceptable success rate');
  } else {
    console.log('❌ Poor: Low success rate - needs optimization');
  }
  
  if (stats.averageResponseTime <= 500) {
    console.log('✅ Excellent: Fast response times');
  } else if (stats.averageResponseTime <= 1000) {
    console.log('⚠️  Good: Acceptable response times');
  } else {
    console.log('❌ Poor: Slow response times - needs optimization');
  }
  
  if (stats.p95ResponseTime <= 1000) {
    console.log('✅ Excellent: Consistent performance');
  } else if (stats.p95ResponseTime <= 2000) {
    console.log('⚠️  Good: Mostly consistent performance');
  } else {
    console.log('❌ Poor: Inconsistent performance - needs optimization');
  }
  
  // Recommendations
  console.log('\n💡 Performance Recommendations:');
  
  if (stats.averageResponseTime > 1000) {
    console.log('   • Consider implementing caching for frequently accessed data');
    console.log('   • Optimize database queries and add indexes');
    console.log('   • Implement connection pooling for database connections');
  }
  
  if (stats.successRate < 95) {
    console.log('   • Review error handling and retry mechanisms');
    console.log('   • Implement circuit breakers for external dependencies');
    console.log('   • Add monitoring and alerting for system health');
  }
  
  if (stats.p95ResponseTime > 2000) {
    console.log('   • Consider implementing request queuing');
    console.log('   • Add load balancing for high-traffic scenarios');
    console.log('   • Optimize memory usage and garbage collection');
  }
  
  console.log('\n🎉 Performance test completed!');
}

// Stress test function
async function runStressTest() {
  console.log('\n🔥 Starting Stress Test (Higher Load)');
  console.log('=' .repeat(50));
  
  // Reset metrics
  metrics.totalRequests = 0;
  metrics.successfulRequests = 0;
  metrics.failedRequests = 0;
  metrics.responseTimes = [];
  metrics.errors = [];
  
  // Increase load for stress test
  const stressConfig = {
    ...config,
    concurrentUsers: 20,
    requestsPerUser: 10
  };
  
  console.log(`📊 Stress Test Configuration:`);
  console.log(`   Concurrent Users: ${stressConfig.concurrentUsers}`);
  console.log(`   Requests per User: ${stressConfig.requestsPerUser}`);
  console.log(`   Total Requests: ${stressConfig.concurrentUsers * stressConfig.requestsPerUser}`);
  console.log('');
  
  const startTime = Date.now();
  
  // Create concurrent user simulations
  const userPromises = [];
  for (let i = 0; i < stressConfig.concurrentUsers; i++) {
    userPromises.push(simulateUser(i + 1));
  }
  
  console.log('⏳ Running stress test...');
  
  try {
    await Promise.all(userPromises);
  } catch (error) {
    console.log('❌ Stress test failed:', error.message);
    return;
  }
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  const stats = calculateStats();
  
  console.log('\n📈 Stress Test Results:');
  console.log('=' .repeat(50));
  console.log(`⏱️  Total Test Time: ${totalTime}ms`);
  console.log(`📊 Total Requests: ${stats.totalRequests}`);
  console.log(`✅ Successful: ${stats.successfulRequests}`);
  console.log(`❌ Failed: ${stats.failedRequests}`);
  console.log(`📈 Success Rate: ${stats.successRate}%`);
  console.log(`🚀 Requests/Second: ${stats.requestsPerSecond}`);
  console.log(`⏱️  Average Response Time: ${stats.averageResponseTime}ms`);
  console.log(`📊 95th Percentile: ${stats.p95ResponseTime}ms`);
  
  if (stats.successRate >= 90) {
    console.log('\n✅ System handles stress test well!');
  } else {
    console.log('\n⚠️  System shows signs of stress - consider scaling');
  }
}

// Main function
async function runPerformanceTests() {
  try {
    await runLoadTest();
    await runStressTest();
  } catch (error) {
    console.log('❌ Performance test failed:', error.message);
  }
}

// Run performance tests
runPerformanceTests();
