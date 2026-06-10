# Zimbites Deployment & Build Guide

## Web Platform Deployment

### Deploy to Manus

1. **Create a Checkpoint**
   - All changes are automatically tracked
   - Click "Save Checkpoint" in the Manus UI
   - Add a descriptive message

2. **Publish to Production**
   - Click the "Publish" button in the Manus UI
   - Your app will be deployed to `https://zimbites.manus.space`
   - Deployment typically takes 2-5 minutes

3. **Verify Deployment**
   - Visit your deployed URL
   - Test all critical flows:
     - User authentication
     - Restaurant browsing
     - Order creation
     - Payment confirmation

### Custom Domain Setup

1. **Purchase Domain**
   - Go to Manus Dashboard → Settings → Domains
   - Click "Purchase Domain" or "Connect Existing Domain"
   - Follow domain registration process

2. **Configure DNS**
   - For new domains: Manus handles DNS automatically
   - For existing domains: Update DNS records to point to Manus nameservers

3. **Verify Domain**
   - Wait for DNS propagation (up to 48 hours)
   - Your app will be available at your custom domain

### Environment Variables

All environment variables are managed through Manus Secrets:

1. Go to Project Settings → Secrets
2. Add or update secrets:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `VITE_APP_ID`
   - `OAUTH_SERVER_URL`
   - `BUILT_IN_FORGE_API_KEY`
   - etc.

3. Secrets are automatically injected at build time

### Monitoring Deployment

1. **View Logs**
   - Go to Dashboard → Logs
   - Filter by date and severity
   - Search for specific errors

2. **Check Health**
   - Go to Dashboard → Status
   - View uptime and performance metrics
   - Check database connection status

3. **Analytics**
   - Go to Dashboard → Analytics
   - View page views, unique visitors, traffic sources
   - Monitor conversion metrics

---

## Flutter App Deployment

### Prerequisites

- Flutter SDK (latest stable version)
- Android SDK / Xcode
- Java Development Kit (JDK) 11+
- Gradle (for Android)

### Android APK Build

#### 1. Generate Signing Key

```bash
# Generate a new signing key (do this once)
keytool -genkey -v -keystore ~/zimbites-key.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias zimbites-key

# You'll be prompted for:
# - Keystore password
# - Key password
# - Name, organization, city, state, country
```

#### 2. Create Key Properties File

Create `android/key.properties`:

```properties
storePassword=your_keystore_password
keyPassword=your_key_password
keyAlias=zimbites-key
storeFile=/path/to/zimbites-key.jks
```

#### 3. Update Build Configuration

Edit `android/app/build.gradle`:

```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

#### 4. Build Release APK

```bash
cd flutter_apps/customer_app

# Get dependencies
flutter pub get

# Build release APK
flutter build apk --release

# Output: build/app/outputs/flutter-app.apk
```

#### 5. Build App Bundle (for Play Store)

```bash
# Build app bundle
flutter build appbundle --release

# Output: build/app/outputs/bundle/release/app-release.aab
```

### iOS App Build

#### 1. Update Build Settings

Edit `ios/Runner.xcodeproj/project.pbxproj`:

```bash
# Or use Xcode UI:
# - Select Runner project
# - Select Runner target
# - Build Settings
# - Update Bundle Identifier: com.zimbites.app
# - Update Display Name: Zimbites
```

#### 2. Configure Code Signing

```bash
# In Xcode:
# - Select Runner target
# - Signing & Capabilities
# - Select team
# - Ensure provisioning profile is set
```

#### 3. Build Release App

```bash
cd flutter_apps/customer_app

# Build iOS app
flutter build ios --release

# Create archive for App Store
xcodebuild -workspace ios/Runner.xcworkspace \
  -scheme Runner \
  -configuration Release \
  -derivedDataPath build/ios_build \
  -archivePath build/ios_build/Runner.xcarchive \
  archive

# Export for App Store
xcodebuild -exportArchive \
  -archivePath build/ios_build/Runner.xcarchive \
  -exportOptionsPlist ios/ExportOptions.plist \
  -exportPath build/ios_build/ipa
```

---

## Play Store Submission

### 1. Create Google Play Developer Account

- Go to [Google Play Console](https://play.google.com/console)
- Pay $25 registration fee
- Complete account setup

### 2. Create App

1. Click "Create app"
2. Enter app name: "Zimbites"
3. Select default language: English
4. Select app category: Food & Drink
5. Select app type: Free
6. Accept declarations

### 3. Prepare Store Listing

#### App Icon
- Size: 512×512 pixels
- Format: PNG
- No rounded corners or transparency

#### Feature Graphics
- Size: 1024×500 pixels
- Format: PNG
- High-quality image showcasing app features

#### Screenshots
- Minimum: 2 screenshots
- Maximum: 8 screenshots
- Size: 1080×1920 pixels (for phones)
- Show key features and user flows

#### Short Description (80 characters max)
```
Order food from your favorite restaurants in Zimbabwe
```

#### Full Description (4000 characters max)
```
Zimbites is the leading food delivery platform in Zimbabwe.

Features:
• Browse hundreds of restaurants
• Order your favorite food
• Real-time delivery tracking
• Multiple payment methods (EcoCash, InnBucks, OneMoney, Omari)
• Rate restaurants and drivers
• Secure payments

Download Zimbites today and get your favorite food delivered to your door!
```

#### Category
- Food & Drink

#### Content Rating
- Complete questionnaire
- Typical rating: 3+

#### Privacy Policy
- Create privacy policy
- Upload to your website
- Add URL in store listing

### 4. Upload APK/AAB

1. Go to Testing → Internal testing
2. Click "Create new release"
3. Upload APK or AAB file
4. Add release notes
5. Review and publish to internal testers

### 5. Internal Testing

1. Add test users' Google accounts
2. Share internal testing link
3. Test on real devices
4. Gather feedback

### 6. Production Release

1. Go to Production
2. Click "Create new release"
3. Upload APK/AAB
4. Add release notes
5. Set rollout percentage (start with 5-10%)
6. Review and publish

### 7. Monitor Release

- Check crash reports
- Monitor user ratings
- Read user reviews
- Increase rollout percentage gradually

---

## App Store Submission (iOS)

### 1. Create Apple Developer Account

- Go to [Apple Developer Program](https://developer.apple.com/)
- Pay $99/year
- Complete account setup

### 2. Create App ID

1. Go to Certificates, Identifiers & Profiles
2. Click Identifiers
3. Click "+" to create new ID
4. Select App IDs
5. Enter Bundle ID: `com.zimbites.app`
6. Enable required capabilities

### 3. Create Provisioning Profiles

1. Go to Provisioning Profiles
2. Create Development profile
3. Create Distribution profile
4. Download and install

### 4. Create App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click "My Apps"
3. Click "+" → "New App"
4. Select platform: iOS
5. Enter app name: Zimbites
6. Enter bundle ID: com.zimbites.app
7. Select SKU

### 5. Prepare App Information

#### App Icon
- Size: 1024×1024 pixels
- Format: PNG
- No rounded corners

#### Screenshots
- Minimum: 2 per device size
- Recommended: 5 per device size
- Sizes:
  - iPhone 6.7": 1290×2796
  - iPhone 6.1": 1170×2532
  - iPhone 5.5": 1242×2208

#### Description
```
Zimbites - Order food from your favorite restaurants in Zimbabwe

Features:
• Browse hundreds of restaurants
• Order your favorite food
• Real-time delivery tracking
• Multiple payment methods
• Rate restaurants and drivers
• Secure payments
```

#### Keywords
```
food delivery, restaurants, Zimbabwe, order food, fast delivery
```

#### Support URL
```
https://zimbites.com/support
```

#### Privacy Policy URL
```
https://zimbites.com/privacy
```

### 6. Submit for Review

1. Go to App Store Connect
2. Select your app
3. Click "Prepare for Submission"
4. Complete all required information
5. Click "Submit for Review"
6. Apple reviews within 24-48 hours

### 7. App Review Guidelines

Ensure compliance with:
- Content policies
- Performance standards
- Privacy requirements
- Security standards

---

## Continuous Integration/Deployment

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy Zimbites

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run tests
        run: pnpm test
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Manus
        env:
          MANUS_API_KEY: ${{ secrets.MANUS_API_KEY }}
        run: |
          # Deploy command here
```

---

## Rollback Procedures

### Web Platform Rollback

1. Go to Dashboard → Version History
2. Select previous version
3. Click "Rollback"
4. Confirm rollback
5. Verify deployment

### Mobile App Rollback

**Android:**
1. Go to Google Play Console
2. Select app
3. Go to Release → Production
4. Click "Rollback release"
5. Select previous version
6. Confirm rollback

**iOS:**
1. Go to App Store Connect
2. Select app
3. Go to Version Release
4. Click "Rollback"
5. Select previous version
6. Confirm rollback

---

## Performance Optimization

### Web Platform

1. **Enable Caching**
   - Set cache headers for static assets
   - Implement service workers for offline support

2. **Database Optimization**
   - Add indexes on frequently queried fields
   - Archive old orders
   - Implement pagination

3. **Image Optimization**
   - Compress images
   - Use WebP format
   - Implement lazy loading

### Mobile Apps

1. **APK Size Optimization**
   - Enable ProGuard/R8
   - Remove unused dependencies
   - Use dynamic feature modules

2. **Performance**
   - Implement lazy loading
   - Cache API responses
   - Optimize database queries

---

## Security Checklist

- [ ] All secrets stored in environment variables
- [ ] HTTPS enabled for all connections
- [ ] API rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS protection enabled
- [ ] CSRF tokens implemented
- [ ] Secure password hashing
- [ ] Regular security audits
- [ ] Dependency updates current

---

## Monitoring & Alerts

### Set Up Monitoring

1. **Application Performance**
   - Response time
   - Error rate
   - Database performance

2. **Infrastructure**
   - CPU usage
   - Memory usage
   - Disk space
   - Network bandwidth

3. **Business Metrics**
   - Orders per day
   - Revenue
   - User growth
   - Payment failures

### Configure Alerts

Send alerts for:
- High error rates (> 5%)
- High latency (> 2s)
- Database connection failures
- Payment processing failures
- Low disk space (< 10%)

---

## Support & Troubleshooting

### Common Issues

**Build Fails**
- Clear build cache: `flutter clean`
- Update dependencies: `flutter pub get`
- Check SDK versions

**App Crashes**
- Check logs: `flutter logs`
- Test on multiple devices
- Use Firebase Crashlytics

**Payment Issues**
- Verify payment reference format
- Check payment provider status
- Review payment logs

**Location Not Working**
- Verify location permissions
- Check Google Maps API key
- Ensure GPS is enabled

---

## Post-Launch Checklist

- [ ] Monitor crash reports
- [ ] Check user feedback
- [ ] Review analytics
- [ ] Monitor performance
- [ ] Check payment processing
- [ ] Verify location tracking
- [ ] Test all payment methods
- [ ] Monitor server logs
- [ ] Check database performance
- [ ] Plan for scaling

---

This guide provides comprehensive instructions for deploying Zimbites to production across all platforms with proper security, monitoring, and rollback procedures.
