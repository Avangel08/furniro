#!/usr/bin/env node

/**
 * Security Audit Script for Furniro Authentication System
 * Checks for common security vulnerabilities and best practices
 */

const API_BASE_URL = 'http://localhost:3002';

// Security test cases
const securityTests = [
  {
    name: 'SQL Injection Protection',
    description: 'Test for SQL injection vulnerabilities',
    test: async () => {
      const maliciousInputs = [
        "'; DROP TABLE customers; --",
        "' OR '1'='1",
        "admin'--",
        "' UNION SELECT * FROM users --"
      ];
      
      for (const input of maliciousInputs) {
        const result = await fetch(`${API_BASE_URL}/api/auth/customer/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: input, password: 'test' })
        });
        
        if (result.status === 500) {
          return { passed: false, message: `Potential SQL injection vulnerability with input: ${input}` };
        }
      }
      
      return { passed: true, message: 'SQL injection protection appears to be working' };
    }
  },
  
  {
    name: 'XSS Protection',
    description: 'Test for Cross-Site Scripting vulnerabilities',
    test: async () => {
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        'javascript:alert("XSS")',
        '<img src=x onerror=alert("XSS")>',
        '"><script>alert("XSS")</script>'
      ];
      
      for (const payload of xssPayloads) {
        const result = await fetch(`${API_BASE_URL}/api/auth/customer/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test-${Date.now()}@example.com`,
            password: 'TestPassword123!',
            firstName: payload,
            lastName: 'Test',
            phone: '+1234567890',
            acceptsMarketing: false
          })
        });
        
        const data = await result.json();
        
        // Check if XSS payload is reflected in response
        if (JSON.stringify(data).includes(payload)) {
          return { passed: false, message: `XSS payload reflected in response: ${payload}` };
        }
      }
      
      return { passed: true, message: 'XSS protection appears to be working' };
    }
  },
  
  {
    name: 'Rate Limiting',
    description: 'Test for rate limiting on authentication endpoints',
    test: async () => {
      const requests = [];
      const numRequests = 20;
      
      // Make multiple rapid requests
      for (let i = 0; i < numRequests; i++) {
        requests.push(
          fetch(`${API_BASE_URL}/api/auth/customer/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
          })
        );
      }
      
      const results = await Promise.all(requests);
      const rateLimited = results.some(r => r.status === 429);
      
      if (rateLimited) {
        return { passed: true, message: 'Rate limiting is active' };
      } else {
        return { passed: false, message: 'No rate limiting detected - potential DoS vulnerability' };
      }
    }
  },
  
  {
    name: 'Password Strength Validation',
    description: 'Test password strength requirements',
    test: async () => {
      const weakPasswords = [
        '123',
        'password',
        '12345678',
        'qwerty',
        'abc'
      ];
      
      for (const password of weakPasswords) {
        const result = await fetch(`${API_BASE_URL}/api/auth/customer/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `test-${Date.now()}-${Math.random()}@example.com`,
            password: password,
            firstName: 'Test',
            lastName: 'User',
            phone: '+1234567890',
            acceptsMarketing: false
          })
        });
        
        const data = await result.json();
        
        if (result.status === 201) {
          return { passed: false, message: `Weak password accepted: ${password}` };
        }
      }
      
      return { passed: true, message: 'Password strength validation is working' };
    }
  },
  
  {
    name: 'JWT Token Security',
    description: 'Test JWT token security features',
    test: async () => {
      // First, get a valid token
      const loginResult = await fetch(`${API_BASE_URL}/api/auth/customer/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@furniro.com',
          password: 'admin123',
          rememberMe: false
        })
      });
      
      if (loginResult.status !== 200) {
        return { passed: false, message: 'Could not get valid token for testing' };
      }
      
      const loginData = await loginResult.json();
      const token = loginData.data.accessToken;
      
      // Test token structure
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        return { passed: false, message: 'Invalid JWT token structure' };
      }
      
      // Test token expiration
      try {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (!payload.exp) {
          return { passed: false, message: 'JWT token missing expiration claim' };
        }
        
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp <= now) {
          return { passed: false, message: 'JWT token already expired' };
        }
        
        return { passed: true, message: 'JWT token security features are properly implemented' };
      } catch (error) {
        return { passed: false, message: 'Invalid JWT token payload' };
      }
    }
  },
  
  {
    name: 'CORS Configuration',
    description: 'Test CORS security configuration',
    test: async () => {
      const result = await fetch(`${API_BASE_URL}/api/auth/customer/me`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://malicious-site.com',
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization'
        }
      });
      
      const corsHeaders = {
        'Access-Control-Allow-Origin': result.headers.get('Access-Control-Allow-Origin'),
        'Access-Control-Allow-Methods': result.headers.get('Access-Control-Allow-Methods'),
        'Access-Control-Allow-Headers': result.headers.get('Access-Control-Allow-Headers')
      };
      
      if (corsHeaders['Access-Control-Allow-Origin'] === '*') {
        return { passed: false, message: 'CORS allows all origins (*) - security risk' };
      }
      
      return { passed: true, message: 'CORS configuration appears secure' };
    }
  },
  
  {
    name: 'Input Validation',
    description: 'Test input validation and sanitization',
    test: async () => {
      const invalidInputs = [
        { email: 'invalid-email', password: 'test' },
        { email: '', password: 'test' },
        { email: 'test@example.com', password: '' },
        { email: 'a'.repeat(300) + '@example.com', password: 'test' },
        { email: 'test@example.com', password: 'a'.repeat(1000) }
      ];
      
      for (const input of invalidInputs) {
        const result = await fetch(`${API_BASE_URL}/api/auth/customer/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input)
        });
        
        if (result.status === 201) {
          return { passed: false, message: `Invalid input accepted: ${JSON.stringify(input)}` };
        }
      }
      
      return { passed: true, message: 'Input validation is working properly' };
    }
  }
];

// Main security audit function
async function runSecurityAudit() {
  console.log('🔒 Starting Security Audit for Furniro Authentication System');
  console.log('=' .repeat(70));
  
  let passed = 0;
  let failed = 0;
  const issues = [];
  
  for (const test of securityTests) {
    console.log(`\n🧪 ${test.name}`);
    console.log(`   ${test.description}`);
    
    try {
      const result = await test.test();
      
      if (result.passed) {
        console.log(`   ✅ ${result.message}`);
        passed++;
      } else {
        console.log(`   ❌ ${result.message}`);
        failed++;
        issues.push({ test: test.name, issue: result.message });
      }
    } catch (error) {
      console.log(`   ❌ Test failed with error: ${error.message}`);
      failed++;
      issues.push({ test: test.name, issue: `Test crashed: ${error.message}` });
    }
  }
  
  console.log('\n' + '=' .repeat(70));
  console.log('📊 Security Audit Results:');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Security Score: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (issues.length > 0) {
    console.log('\n⚠️  Security Issues Found:');
    issues.forEach((issue, index) => {
      console.log(`   ${index + 1}. ${issue.test}: ${issue.issue}`);
    });
  }
  
  if (failed === 0) {
    console.log('\n🎉 Security audit passed! Authentication system appears secure.');
  } else {
    console.log('\n🚨 Security issues detected. Please review and fix before production.');
  }
  
  // Security recommendations
  console.log('\n💡 Security Recommendations:');
  console.log('   1. Implement rate limiting on all authentication endpoints');
  console.log('   2. Add password complexity requirements (min 8 chars, mixed case, numbers)');
  console.log('   3. Implement account lockout after failed login attempts');
  console.log('   4. Add CSRF protection for state-changing operations');
  console.log('   5. Implement proper CORS configuration for production');
  console.log('   6. Add request logging and monitoring');
  console.log('   7. Implement session timeout and refresh token rotation');
  console.log('   8. Add input sanitization and validation middleware');
}

// Run security audit
runSecurityAudit().catch(console.error);
