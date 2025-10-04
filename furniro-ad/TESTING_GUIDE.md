# Furniro Authentication System - Testing Guide

## Overview
This guide covers comprehensive testing procedures for the Furniro authentication system, including security audits, performance testing, and integration testing.

## Test Scripts

### 1. Authentication Tests
```bash
# Complete authentication flow test
npm run test:auth-complete

# Simple authentication test
npm run test:customer-auth-simple

# Customer model test
npm run test:customer-model
```

### 2. Security Audit
```bash
# Run comprehensive security audit
npm run security:audit
```

**Security Tests Include:**
- SQL Injection Protection
- XSS Protection
- Rate Limiting
- Password Strength Validation
- JWT Token Security
- CORS Configuration
- Input Validation

### 3. Performance Testing
```bash
# Run performance and load tests
npm run performance:test
```

**Performance Tests Include:**
- Load Testing (10 concurrent users)
- Stress Testing (20 concurrent users)
- Response Time Analysis
- Throughput Measurement
- Error Rate Analysis

### 4. Run All Tests
```bash
# Run complete test suite
npm run test:all
```

## Manual Testing Procedures

### 1. Customer Registration Flow
1. Navigate to `http://localhost:3000`
2. Click account icon to open AuthModal
3. Switch to "Register" tab
4. Fill in registration form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: TestPassword123!
   - Phone: +1234567890
   - Check "I would like to receive marketing emails"
   - Check "I agree to the Terms and Privacy Policy"
5. Click "Create account"
6. Verify successful registration and auto-login

### 2. Customer Login Flow
1. Navigate to `http://localhost:3000`
2. Click account icon to open AuthModal
3. Ensure "Login" tab is selected
4. Enter credentials:
   - Email: test@example.com
   - Password: TestPassword123!
   - Check "Remember me" (optional)
5. Click "Sign in"
6. Verify successful login and profile dropdown appears

### 3. Profile Management
1. After login, click account icon
2. Verify profile dropdown shows:
   - User avatar with initials
   - Full name and email
   - Navigation menu items
3. Click "My Profile"
4. Verify profile page loads with user information
5. Test "Edit Profile" functionality
6. Test form validation and save/cancel actions

### 4. Protected Routes
1. **Without Authentication:**
   - Try accessing `/profile` → should redirect to home
   - Try accessing `/orders` → should redirect to home
   - Try accessing `/wishlist` → should redirect to home
   - Try accessing `/addresses` → should redirect to home

2. **With Authentication:**
   - Login first
   - Access `/profile` → should load successfully
   - Access `/orders` → should load with empty state
   - Access `/wishlist` → should load with empty state
   - Access `/addresses` → should load with empty state

### 5. Logout Flow
1. While logged in, click account icon
2. Click "Logout" in profile dropdown
3. Verify logout and redirect to home
4. Verify profile dropdown no longer appears
5. Try accessing protected routes → should redirect to home

## Security Testing

### 1. Input Validation
- Test with SQL injection attempts
- Test with XSS payloads
- Test with extremely long inputs
- Test with special characters
- Test with empty/null values

### 2. Authentication Security
- Test with invalid credentials
- Test with expired tokens
- Test with malformed tokens
- Test with missing tokens
- Test token refresh functionality

### 3. Rate Limiting
- Make multiple rapid requests to auth endpoints
- Verify rate limiting kicks in after threshold
- Test different IP addresses
- Test rate limit reset functionality

## Performance Testing

### 1. Load Testing
- Test with 10 concurrent users
- Monitor response times
- Check error rates
- Verify system stability

### 2. Stress Testing
- Test with 20+ concurrent users
- Monitor system behavior under load
- Check for memory leaks
- Verify graceful degradation

### 3. Response Time Analysis
- Measure average response times
- Check 95th and 99th percentiles
- Monitor for performance regressions
- Test with different payload sizes

## Error Handling Testing

### 1. Network Errors
- Test with network disconnection
- Test with slow network connections
- Test with timeout scenarios
- Verify proper error messages

### 2. Server Errors
- Test with server downtime
- Test with database connection issues
- Test with invalid API responses
- Verify graceful error handling

### 3. Client Errors
- Test with invalid form data
- Test with missing required fields
- Test with malformed requests
- Verify user-friendly error messages

## Browser Compatibility Testing

### 1. Modern Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### 2. Mobile Browsers
- Chrome Mobile
- Safari Mobile
- Firefox Mobile
- Samsung Internet

### 3. Responsive Design
- Test on different screen sizes
- Test on different orientations
- Test touch interactions
- Verify mobile navigation

## Integration Testing

### 1. API Integration
- Test all API endpoints
- Verify data consistency
- Test error responses
- Check response formats

### 2. Database Integration
- Test data persistence
- Test data retrieval
- Test data updates
- Test data deletion

### 3. Third-party Integration
- Test external service calls
- Test fallback mechanisms
- Test error handling
- Verify data security

## Test Data Management

### 1. Test Users
- Create test users with different roles
- Use realistic test data
- Clean up test data after tests
- Use consistent test data across tests

### 2. Test Products
- Create test products with various attributes
- Test with different image counts
- Test with different categories
- Verify data integrity

### 3. Test Orders
- Create test orders with different statuses
- Test order creation flow
- Test order update flow
- Test order deletion flow

## Continuous Integration

### 1. Automated Testing
- Run tests on every commit
- Run tests on pull requests
- Run tests on deployment
- Monitor test results

### 2. Test Reporting
- Generate test reports
- Track test coverage
- Monitor test performance
- Alert on test failures

### 3. Test Maintenance
- Update tests when features change
- Remove obsolete tests
- Add new tests for new features
- Refactor tests for better maintainability

## Troubleshooting

### Common Issues
1. **Tests failing due to database connection**
   - Ensure MongoDB is running
   - Check database connection string
   - Verify database permissions

2. **Tests failing due to port conflicts**
   - Ensure ports 3000, 3001, 3002 are available
   - Check for running processes
   - Restart services if needed

3. **Tests failing due to authentication**
   - Ensure test users exist in database
   - Check password hashing
   - Verify JWT token generation

### Debug Commands
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check running processes
ps aux | grep node

# Check port usage
netstat -tulpn | grep :300

# View logs
tail -f logs/app.log
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Test Data**: Use consistent, realistic test data
3. **Error Handling**: Test both success and failure scenarios
4. **Performance**: Monitor and optimize test execution time
5. **Documentation**: Keep tests and documentation up to date
6. **Security**: Regularly audit and update security tests
7. **Maintenance**: Regularly review and update test suite

## Conclusion

This testing guide provides comprehensive coverage of the Furniro authentication system. Regular testing ensures system reliability, security, and performance. Always run tests before deploying to production and maintain a robust test suite for ongoing development.
