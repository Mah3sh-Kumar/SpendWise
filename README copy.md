<div align="center">
  <img src="./assets/AppLogo.png" alt="SpendWise Logo" width="120" height="120">
  
  # SpendWise
  
  **Smart Expense Tracking Made Simple**
  
  Take control of your finances with our beautiful and intuitive expense tracking app
</div>

---

## ✨ Features

### 💰 **Smart Vault Management**
- Visual budget tracking with progress indicators
- Real-time spending calculations
- Monthly budget overview
- Haptic feedback for interactions

### 📝 **Effortless Expense Logging**
- Quick expense entry with smart categories
- Location-based expense tracking
- Optional notes and descriptions
- Form validation and error handling

### 📊 **Comprehensive Analytics**
- Interactive dashboard with multiple views
- Daily, weekly, and monthly insights
- Category-wise spending breakdown
- Beautiful pie charts and visualizations

### 🎨 **Personalized Experience**
- 6 stunning color themes (Emerald, Blue, Violet, Rose, Amber, Cyan)
- Light and dark mode support
- Customizable interface
- Persistent user preferences

### 💾 **Data Management**
- Secure local data storage
- Export/Import functionality
- Data backup and restore
- Privacy-focused (no cloud dependency)

### 📱 **Native Mobile Experience**
- Smooth animations and transitions
- Haptic feedback integration
- Native UI components
- Optimized for iOS and Android

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **React Native** | Cross-platform mobile framework | 0.81.5 |
| **Expo** | Development platform and tools | 54.0.29 |
| **TypeScript** | Type safety and better DX | 5.1.3 |
| **AsyncStorage** | Local data persistence | 2.2.0 |
| **React Native SVG** | Vector graphics and charts | 15.12.1 |
| **Expo Haptics** | Tactile feedback | 15.0.8 |
| **Expo Vector Icons** | Consistent iconography | 15.0.3 |

## 📱 Screenshots

<div align="center">
  <img src="./screenshots/vault.png" alt="Vault Screen" width="200">
  <img src="./screenshots/expense-form.png" alt="Expense Form" width="200">
  <img src="./screenshots/dashboard.png" alt="Dashboard" width="200">
  <img src="./screenshots/settings.png" alt="Settings" width="200">
</div>

*Screenshots coming soon - app in development*

## 🚀 Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or later) - [Download here](https://nodejs.org/)
- **Expo CLI** - Install globally: `npm install -g @expo/cli`
- **Git** - [Download here](https://git-scm.com/)

For device testing:
- **iOS**: Xcode and iOS Simulator (macOS only)
- **Android**: Android Studio and Android Emulator
- **Physical Device**: Expo Go app ([iOS](https://apps.apple.com/app/expo-go/id982107779) | [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SpendWise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your platform**
   ```bash
   # iOS Simulator (macOS only)
   npm run ios
   
   # Android Emulator
   npm run android
   
   # Web Browser
   npm run web
   
   # Scan QR code with Expo Go app for physical device
   ```

### 📦 Building for Production

#### Android APK
```bash
# Build APK for testing
npm run build:android

# Or use EAS Build directly
eas build --platform android --profile preview
```

#### iOS App
```bash
# Build for iOS (requires Apple Developer account)
npm run build:ios

# Or use EAS Build directly
eas build --platform ios --profile production
```

## 📁 Project Structure

```
SpendWise/
├── 📱 App.tsx                    # Main app component
├── 📋 app.json                   # Expo configuration
├── ⚙️ eas.json                   # EAS Build configuration
├── 🎨 assets/                    # App assets
│   └── AppLogo.png              # App logo and icon
├── 📦 src/                       # Source code
│   ├── 🧩 components/           # React Native components
│   │   ├── Vault.tsx           # Budget vault with progress tracking
│   │   ├── ExpenseForm.tsx     # Smart expense logging form
│   │   ├── Dashboard.tsx       # Analytics and insights dashboard
│   │   ├── Settings.tsx        # User preferences and settings
│   │   ├── PieChart.tsx        # Custom pie chart component
│   │   ├── Toast.tsx           # Toast notification system
│   │   └── ThemedAlert.tsx     # Themed alert dialogs
│   ├── 🎣 hooks/               # Custom React hooks
│   │   ├── useTheme.ts         # Theme management hook
│   │   └── useToast.ts         # Toast notification hook
│   ├── 🎨 context/             # React context providers
│   │   └── ThemeContext.tsx    # Global theme state management
│   ├── 📝 types.ts             # TypeScript type definitions
│   └── ⚡ constants.ts         # App constants and utilities
├── 🔧 babel.config.js           # Babel configuration
├── 📊 metro.config.js           # Metro bundler configuration
├── 📋 tsconfig.json             # TypeScript configuration
└── 📦 package.json              # Dependencies and scripts
```

## 🏗️ Architecture Overview

### Core Components

#### 💰 Vault Component
- **Visual Budget Tracking**: Gradient backgrounds with real-time progress
- **Interactive Amount Editing**: Tap-to-edit with haptic feedback
- **Smart Progress Indicators**: Visual spending percentage with color coding
- **Monthly Insights**: Automatic spending summaries and trends

#### 📝 ExpenseForm Component
- **Smart Input System**: Currency-aware amount input with validation
- **Location Intelligence**: Place-based expense categorization
- **Category Management**: Predefined categories with custom color coding
- **Rich Notes Support**: Optional detailed descriptions and context

#### 📊 Dashboard Component
- **Multi-View Analytics**: Daily, weekly, and monthly perspectives
- **Interactive Charts**: Touch-responsive pie charts with drill-down
- **Transaction History**: Chronological expense listing with search
- **Category Insights**: Top spending categories with visual breakdown

#### ⚙️ Settings Component
- **Profile Management**: User customization and preferences
- **Theme Engine**: Dynamic color schemes with real-time preview
- **Data Control**: Export/import with privacy-first approach
- **Accessibility**: Dark mode and contrast options

### 🎨 Design System

#### Theme Architecture
- **6 Curated Themes**: Emerald, Blue, Violet, Rose, Amber, Cyan
- **Adaptive Colors**: Automatic light/dark mode switching
- **Consistent Branding**: Unified color palette across all components
- **Accessibility Compliant**: WCAG 2.1 AA contrast ratios

#### User Experience Principles
- **Haptic Feedback**: Tactile responses for all interactions
- **Smooth Animations**: 60fps transitions and micro-interactions
- **Native Feel**: Platform-specific UI patterns and behaviors
- **Responsive Design**: Optimized for all screen sizes and orientations

### 💾 Data Architecture

#### Local-First Approach
- **AsyncStorage Integration**: Secure local data persistence
- **JSON Export/Import**: Human-readable data format
- **Data Validation**: Runtime type checking and error recovery
- **Privacy by Design**: No cloud dependencies or data collection

#### Performance Optimization
- **Lazy Loading**: Components loaded on-demand
- **Memory Management**: Efficient state management with cleanup
- **Bundle Optimization**: Tree-shaking and code splitting
- **Native Performance**: Leveraging platform-specific optimizations

## 🎛️ Customization Guide

### Adding New Expense Categories
1. Open `src/constants.ts`
2. Add your category to the `Category` enum:
   ```typescript
   export enum Category {
     // ... existing categories
     EDUCATION = 'Education',
     HEALTHCARE = 'Healthcare'
   }
   ```
3. Add corresponding colors to `CATEGORY_COLORS`:
   ```typescript
   export const CATEGORY_COLORS = {
     // ... existing colors
     [Category.EDUCATION]: '#8B5CF6',
     [Category.HEALTHCARE]: '#EF4444'
   }
   ```

### Creating Custom Themes
1. Navigate to `src/constants.ts`
2. Add your theme to the `THEME_COLORS` object:
   ```typescript
   export const THEME_COLORS = {
     // ... existing themes
     custom: {
       primary: '#your-primary-color',
       secondary: '#your-secondary-color',
       // ... other color definitions
     }
   }
   ```

### Extending Components
- Follow the existing component structure in `src/components/`
- Use the `useTheme` hook for consistent styling
- Implement TypeScript interfaces from `src/types.ts`
- Leverage the `useToast` hook for user feedback

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch: `git checkout -b feature/amazing-feature`
4. **Make** your changes with clear, descriptive commits
5. **Test** your changes thoroughly
6. **Push** to your branch: `git push origin feature/amazing-feature`
7. **Submit** a Pull Request with a detailed description

### Code Standards
- **TypeScript**: Maintain strict type safety
- **ESLint**: Follow the existing linting rules
- **Prettier**: Use consistent code formatting
- **Comments**: Document complex logic and components
- **Testing**: Add tests for new features (when applicable)

### Commit Convention
```
feat: add new expense category picker
fix: resolve theme switching bug
docs: update installation instructions
style: improve component spacing
refactor: optimize data storage logic
```

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### What this means:
- ✅ Commercial use allowed
- ✅ Modification allowed
- ✅ Distribution allowed
- ✅ Private use allowed
- ❌ No warranty provided
- ❌ No liability accepted

## 🆘 Support & Community

### Getting Help
- 🐛 **Bug Reports**: [Open an issue](../../issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Request a feature](../../issues/new?template=feature_request.md)
- 💬 **Questions**: [Start a discussion](../../discussions)
- 📧 **Direct Contact**: [Email the team](mailto:support@spendwise.app)

### Roadmap
- [ ] Cloud sync and backup
- [ ] Receipt scanning with OCR
- [ ] Budget goals and alerts
- [ ] Multi-currency support
- [ ] Expense sharing and splitting
- [ ] Advanced analytics and insights
- [ ] Widget support for quick entry

---

<div align="center">
  <p>Made with ❤️ by the SpendWise team</p>
  <p>
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-features">Features</a> •
    <a href="#-customization-guide">Customization</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>