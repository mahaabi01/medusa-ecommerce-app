# 🚀 eSewa Production Deployment Guide

## 📋 Table of Contents

1. [Overview](#overview)
2. [eSewa Merchant Account Setup](#esewa-merchant-account-setup)
3. [Production Configuration](#production-configuration)
4. [Security Checklist](#security-checklist)
5. [Deployment Steps](#deployment-steps)
6. [Testing in Production](#testing-in-production)
7. [Monitoring & Logging](#monitoring--logging)
8. [Troubleshooting](#troubleshooting)

---

## Overview

This guide covers the steps to deploy your eSewa integration to production, including obtaining a real merchant account, configuring production settings, and ensuring security best practices.

### Differences: Test vs Production

| Aspect | Test Environment | Production Environment |
|--------|-----------------|----------------------|
| **Merchant ID** | EPAYTEST | Your actual merchant ID |
| **Secret Key** | 8gBm/:&EnhH.1/q | Your actual secret key |
| **Payment URL** | https://rc-epay.esewa.com.np | https://epay.esewa.com.np |
| **Verification URL** | https://rc-epay.esewa.com.np/api/epay/transaction/status | https://epay.esewa.com.np/api/epay/transaction/status |
| **Test Credentials** | 9806800001 / Nepal@123 | Real customer accounts |
| **Real Money** | No | Yes |

---

## eSewa Merchant Account Setup

### Step 1: Register as eSewa Merchant

1. **Visit eSewa Merchant Portal:**
   - URL: https://merchant.esewa.com.np
   - Or contact: merchant@esewa.com.np

2. **Required Documents:**
   - Business registration certificate
   - PAN/VAT certificate
   - Company profile
   - Bank account details
   - Authorized person's citizenship
   - Company seal/stamp

3. **Application Process:**
   - Fill merchant application form
   - Submit required documents
   - Wait for verification (typically 3-5 business days)
   - Attend merchant training (if required)

4. **Account Activation:**
   - Receive merchant credentials via email
   - Login to merchant dashboard
   - Complete profile setup
   - Configure settlement account

### Step 2: Obtain Production Credentials

Once your merchant account is approved:

1. **Login to Merchant Dashboard:**
   - URL: https://merchant.esewa.com.np

2. **Navigate to API Settings:**
   - Go to Settings → API Configuration
   - Or Developer → API Credentials

3. **Get Your Credentials:**
   ```
   Merchant ID: EPAY-XXXXX (your unique ID)
   Secret Key: XXXXXXXXXXXXXXXX (keep this secure!)
   Product Code: Same as Merchant ID
   ```

4. **Configure Callback URLs:**
   - Success URL: https://yourdomain.com/order
   - Failure URL: https://yourdomain.com/payment-failed

5. **Set IP Whitelist (if required):**
   - Add your server IP addresses
   - Add backup/failover IPs

### Step 3: Understand eSewa Fees

**Transaction Fees:**
- Typically 1.5% - 2% per transaction
- Minimum fee may apply
- Check with eSewa for current rates

**Settlement:**
- Daily/Weekly settlement options
- Settlement to your bank account
- Settlement reports available in dashboard

---

## Production Configuration

### Step 1: Update Backend Environment Variables

**File:** `edailo/.env`

```bash
# eSewa Production Configuration
ESEWA_MERCHANT_ID=EPAY-XXXXX          # Your actual merchant ID
ESEWA_SECRET_KEY=your_secret_key_here  # Your actual secret key
ESEWA_ENVIRONMENT=production           # Change from 'test' to 'production'

# Production URLs
STOREFRONT_URL=https://yourdomain.com

# CORS Configuration
STORE_CORS=https://yourdomain.com,https://www.yourdomain.com
ADMIN_CORS=https://admin.yourdomain.com
AUTH_CORS=https://yourdomain.com,https://admin.yourdomain.com

# Database (Production)
DATABASE_URL=postgresql://user:password@production-db-host:5432/medusa_prod

# Redis (Production)
REDIS_URL=redis://production-redis-host:6379

# JWT & Cookie Secrets (Generate new ones!)
JWT_SECRET=your_production_jwt_secret_here
COOKIE_SECRET=your_production_cookie_secret_here
```

**⚠️ IMPORTANT:**
- Never commit `.env` file to version control
- Use environment variables in your hosting platform
- Generate new JWT and Cookie secrets for production
- Use strong, random secrets (minimum 32 characters)

### Step 2: Update Frontend Environment Variables

**File:** `edailo-storefront/.env.local` (or `.env.production`)

```bash
# Production Backend URL
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourdomain.com

# Other production settings
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Step 3: Verify Payment Service Configuration

**File:** `edailo/src/modules/esewa-payment/service.ts`

Ensure the service correctly switches between test and production URLs:

```typescript
private getPaymentUrl(): string {
  return this.options_.environment === "production"
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form"
}

private async verifyPayment(...) {
  const verificationUrl = this.options_.environment === "production"
    ? "https://epay.esewa.com.np/api/epay/transaction/status"
    : "https://rc-epay.esewa.com.np/api/epay/transaction/status"
  // ...
}
```

✅ No changes needed - already configured to use environment variable

---

## Security Checklist

### 1. Environment Variables

- [ ] All secrets stored in environment variables (not in code)
- [ ] `.env` file added to `.gitignore`
- [ ] Different secrets for production vs development
- [ ] JWT_SECRET is strong and random (32+ characters)
- [ ] COOKIE_SECRET is strong and random (32+ characters)
- [ ] ESEWA_SECRET_KEY kept secure and never exposed

### 2. HTTPS/SSL

- [ ] SSL certificate installed on domain
- [ ] All URLs use HTTPS (not HTTP)
- [ ] HSTS headers configured
- [ ] Redirect HTTP to HTTPS
- [ ] Valid SSL certificate (not self-signed)

### 3. CORS Configuration

- [ ] CORS restricted to your domains only
- [ ] No wildcard (*) origins in production
- [ ] Credentials enabled only for trusted origins
- [ ] OPTIONS preflight handled correctly

### 4. API Security

- [ ] Rate limiting implemented
- [ ] Request validation on all endpoints
- [ ] SQL injection prevention (using ORM)
- [ ] XSS prevention (input sanitization)
- [ ] CSRF protection enabled

### 5. Payment Security

- [ ] Signature verification on all eSewa responses
- [ ] Transaction UUID validation
- [ ] Amount verification (no tampering)
- [ ] Idempotency checks (prevent duplicate orders)
- [ ] Timeout handling for pending payments

### 6. Database Security

- [ ] Database credentials secured
- [ ] Database not publicly accessible
- [ ] Regular backups configured
- [ ] Backup encryption enabled
- [ ] Connection pooling configured

### 7. Logging & Monitoring

- [ ] Error logging configured
- [ ] Payment logs stored securely
- [ ] PII data not logged
- [ ] Log rotation configured
- [ ] Monitoring alerts set up

---

## Deployment Steps

### Step 1: Pre-Deployment Checklist

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Backup created
- [ ] Rollback plan prepared

### Step 2: Deploy Backend

**Option A: Docker Deployment**

```bash
# Build Docker image
docker build -t medusa-backend:latest ./edailo

# Run with environment variables
docker run -d \
  --name medusa-backend \
  -p 9000:9000 \
  --env-file .env.production \
  medusa-backend:latest
```

**Option B: Node.js Deployment**

```bash
# On production server
cd edailo

# Install dependencies
npm ci --production

# Build application
npm run build

# Start with PM2
pm2 start npm --name "medusa-backend" -- start

# Or use systemd service
sudo systemctl start medusa-backend
```

**Option C: Platform-as-a-Service (Heroku, Railway, etc.)**

```bash
# Set environment variables in platform dashboard
# Deploy via Git push or platform CLI
```

### Step 3: Deploy Frontend

**Option A: Vercel Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd edailo-storefront
vercel --prod

# Set environment variables in Vercel dashboard
```

**Option B: Docker Deployment**

```bash
# Build Docker image
docker build -t medusa-storefront:latest ./edailo-storefront

# Run container
docker run -d \
  --name medusa-storefront \
  -p 3000:3000 \
  --env-file .env.production \
  medusa-storefront:latest
```

**Option C: Static Export (if applicable)**

```bash
cd edailo-storefront
npm run build
# Deploy 'out' directory to CDN/static hosting
```

### Step 4: Database Migration

```bash
# Run migrations on production database
cd edailo
npm run migrations:run

# Or using Medusa CLI
npx medusa migrations run
```

### Step 5: Verify Deployment

1. **Check Backend Health:**
   ```bash
   curl https://api.yourdomain.com/health
   ```

2. **Check Frontend:**
   ```bash
   curl https://yourdomain.com
   ```

3. **Check eSewa Configuration:**
   - Login to admin panel
   - Go to Settings → Payment Providers
   - Verify eSewa is enabled
   - Check configuration is correct

---

## Testing in Production

### Step 1: Small Test Transaction

1. **Create Test Order:**
   - Use small amount (e.g., NPR 10)
   - Use your own eSewa account
   - Complete full payment flow

2. **Verify:**
   - Payment successful on eSewa
   - Order created in database
   - Confirmation email sent
   - Order appears in admin panel

3. **Check Logs:**
   - No errors in backend logs
   - Payment verification succeeded
   - Order creation succeeded

### Step 2: Refund Test (if applicable)

1. **Process Refund:**
   - Login to eSewa merchant dashboard
   - Find test transaction
   - Process refund

2. **Verify:**
   - Refund appears in eSewa account
   - Order status updated (if implemented)

### Step 3: Edge Cases

Test these scenarios:

- [ ] Payment timeout (don't complete payment)
- [ ] Payment cancellation (cancel on eSewa)
- [ ] Network interruption during payment
- [ ] Duplicate payment attempts
- [ ] Invalid signature (should be rejected)
- [ ] Tampered amount (should be rejected)

---

## Monitoring & Logging

### 1. Application Monitoring

**Recommended Tools:**
- **Sentry** - Error tracking
- **DataDog** - Application performance monitoring
- **New Relic** - Full-stack monitoring
- **LogRocket** - Frontend monitoring

**Setup Example (Sentry):**

```typescript
// edailo/instrumentation.ts
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

### 2. Payment Logs

**What to Log:**
- ✅ Payment initiation (transaction UUID, amount)
- ✅ Payment verification attempts
- ✅ Signature verification results
- ✅ eSewa API responses
- ✅ Order creation success/failure
- ❌ DO NOT log: Secret keys, full card details, passwords

**Log Format:**

```typescript
console.log({
  timestamp: new Date().toISOString(),
  event: "payment_verification",
  transaction_uuid: "cart_01JJ...",
  status: "success",
  amount: 90,
  currency: "NPR",
})
```

### 3. Alerts

**Set up alerts for:**
- Payment verification failures (> 5% failure rate)
- eSewa API errors (> 10 errors/hour)
- Order creation failures
- Signature verification failures
- High response times (> 5 seconds)
- Server errors (500 status codes)

**Example Alert (Email/Slack):**
```
🚨 Alert: High Payment Failure Rate
- Failure Rate: 15% (last hour)
- Failed Payments: 23
- Time: 2024-01-27 14:30 UTC
- Action Required: Check eSewa API status
```

### 4. Dashboard Metrics

**Track these KPIs:**
- Total transactions
- Success rate
- Average transaction value
- Payment method distribution
- Response times
- Error rates
- Refund rate

---

## Troubleshooting

### Production Issues

#### 1. "Invalid Merchant ID"

**Symptoms:**
- eSewa rejects payment
- Error: "Invalid merchant"

**Solutions:**
- Verify `ESEWA_MERCHANT_ID` is correct
- Check merchant account is active
- Ensure production credentials (not test)
- Contact eSewa support if issue persists

#### 2. "Signature Mismatch"

**Symptoms:**
- Verification fails
- Error: "Invalid signature"

**Solutions:**
- Verify `ESEWA_SECRET_KEY` is correct
- Check no extra spaces in secret key
- Ensure signature format matches eSewa docs
- Test signature generation separately

#### 3. "Payment Successful but Order Not Created"

**Symptoms:**
- Payment deducted from customer
- No order in system

**Solutions:**
- Check backend logs for errors
- Verify payment collection completed
- Check database for payment session
- Manually create order if needed
- Refund customer if order cannot be created

#### 4. "Slow Payment Processing"

**Symptoms:**
- Long wait times
- Timeouts

**Solutions:**
- Check eSewa API response times
- Optimize database queries
- Add caching where appropriate
- Scale backend servers
- Use connection pooling

#### 5. "CORS Errors in Production"

**Symptoms:**
- Frontend cannot call backend
- CORS policy errors

**Solutions:**
- Verify STORE_CORS includes production domain
- Check HTTPS is used (not HTTP)
- Ensure middleware is loaded
- Check OPTIONS requests succeed

---

## Rollback Plan

### If Issues Occur in Production

**Step 1: Immediate Actions**
```bash
# Disable eSewa payment provider
# Via admin panel or database:
UPDATE payment_provider 
SET is_enabled = false 
WHERE id = 'pp_esewa_esewa';
```

**Step 2: Rollback Deployment**
```bash
# Rollback to previous version
git revert HEAD
git push origin main

# Or restore from backup
# Restore database backup
# Restore previous code version
```

**Step 3: Communication**
- Notify customers via email/banner
- Update status page
- Provide alternative payment methods
- Estimate resolution time

**Step 4: Investigation**
- Review logs
- Identify root cause
- Test fix in staging
- Deploy fix when ready

---

## Maintenance

### Regular Tasks

**Daily:**
- [ ] Check error logs
- [ ] Monitor payment success rate
- [ ] Review failed transactions

**Weekly:**
- [ ] Review eSewa settlement reports
- [ ] Check for pending refunds
- [ ] Update monitoring dashboards

**Monthly:**
- [ ] Review transaction fees
- [ ] Analyze payment trends
- [ ] Update documentation
- [ ] Security audit

**Quarterly:**
- [ ] Review eSewa integration
- [ ] Update dependencies
- [ ] Performance optimization
- [ ] Disaster recovery test

---

## Support & Resources

### eSewa Support

**Merchant Support:**
- Email: merchant@esewa.com.np
- Phone: +977-1-5970777
- Website: https://merchant.esewa.com.np

**Technical Support:**
- Developer Docs: https://developer.esewa.com.np
- API Documentation: https://developer.esewa.com.np/pages/Epay
- Support Hours: 10 AM - 5 PM (Nepal Time)

### Emergency Contacts

**Critical Issues:**
1. Contact eSewa merchant support immediately
2. Disable payment provider if needed
3. Notify customers
4. Document issue for post-mortem

---

## Compliance & Legal

### Data Protection

- [ ] Customer payment data encrypted
- [ ] PCI DSS compliance (if storing card data)
- [ ] Privacy policy updated
- [ ] Terms of service include payment terms
- [ ] GDPR compliance (if applicable)

### Financial Regulations

- [ ] Business registered for online payments
- [ ] Tax compliance configured
- [ ] Invoice generation implemented
- [ ] Financial reporting set up
- [ ] Audit trail maintained

---

## Checklist: Go-Live

### Pre-Launch

- [ ] eSewa merchant account approved
- [ ] Production credentials obtained
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Security audit completed
- [ ] Load testing completed
- [ ] Backup strategy implemented
- [ ] Monitoring configured
- [ ] Documentation updated
- [ ] Team trained

### Launch Day

- [ ] Deploy to production
- [ ] Verify deployment successful
- [ ] Test small transaction
- [ ] Monitor logs closely
- [ ] Team on standby
- [ ] Rollback plan ready

### Post-Launch

- [ ] Monitor for 24 hours
- [ ] Review all transactions
- [ ] Check error rates
- [ ] Gather customer feedback
- [ ] Document any issues
- [ ] Celebrate success! 🎉

---

## Conclusion

Your eSewa integration is now ready for production! Follow this guide carefully to ensure a smooth deployment and maintain a secure, reliable payment system.

**Remember:**
- Test thoroughly before going live
- Monitor closely after launch
- Keep credentials secure
- Maintain regular backups
- Stay updated with eSewa changes

**Good luck with your production deployment!** 🚀

---

**Need Help?**
- Review: `ESEWA_INTEGRATION_COMPLETE_GUIDE.md`
- Check: Backend logs for detailed errors
- Contact: eSewa merchant support
- Review: Medusa documentation
