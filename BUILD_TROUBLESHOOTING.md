# Build Troubleshooting Guide

## Common Build Issues and Solutions

### 1. Import Order Issues ✅ FIXED
- **Problem**: Imports mixed with function definitions
- **Solution**: Moved all imports to the top of files
- **Files Fixed**: `src/hooks/useAgora.ts`

### 2. SSR Issues with Agora SDK ✅ FIXED
- **Problem**: Direct imports of Agora types causing SSR errors
- **Solution**: Use dynamic imports and type aliases
- **Files Fixed**: 
  - `src/components/call/AgoraCallModal.tsx`
  - `src/components/providers/AgoraGlobalCallProvider.tsx`

### 3. TypeScript Strict Mode Issues ✅ HANDLED
- **Problem**: `any` types causing warnings
- **Solution**: Config has `"noImplicitAny": false` - warnings are non-blocking

## Build Commands to Try

### Option 1: Clean Build
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules/.cache
npm run build
```

### Option 2: Development Build Test
```bash
# Test if dev server starts (builds incrementally)
npm run dev
```

### Option 3: Type Check Only
```bash
# Check TypeScript without building
npx tsc --noEmit
```

### Option 4: Lint Check
```bash
# Check for linting issues
npm run lint
```

## Debugging Steps

### Step 1: Test Basic Components
Import and use `BuildTest` component to verify basic React works:
```tsx
import { BuildTest } from '@/components/debug/BuildTest';

// Use in any page to test
<BuildTest />
```

### Step 2: Test Simplified Agora Hook
Use `useAgoraSimple` instead of `useAgora` to isolate issues:
```tsx
import { useAgoraSimple } from '@/hooks/useAgoraSimple';

// Test in component
const { initializeSDK, testAPICall } = useAgoraSimple();
```

### Step 3: Check Console Output
Look for specific error messages in the build output:
- Module resolution errors
- Type errors
- Import/export errors
- Dependency conflicts

## Alternative Build Methods

### Using Different Package Managers
```bash
# Try with yarn instead of npm
yarn build

# Or with pnpm
pnpm build
```

### Using Different Node Versions
```bash
# Check Node version
node --version

# Try with different Node version if needed
nvm use 18  # or 20
npm run build
```

## If Build Still Fails

### 1. Check for Circular Dependencies
Look for import cycles between files.

### 2. Check for Missing Dependencies
Ensure all imports have corresponding packages installed.

### 3. Check for Syntax Errors
Look for missing semicolons, brackets, or quotes.

### 4. Check for Environment Variables
Ensure all required env vars are set.

## Production Deployment Alternatives

### Option 1: Deploy with Warnings
If build succeeds with warnings, deploy anyway - warnings don't block deployment.

### Option 2: Disable Strict Checks
Temporarily disable strict TypeScript checks:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": false,
    "noImplicitAny": false
  }
}
```

### Option 3: Use Development Build
Deploy development build if production build fails:
```bash
# Deploy dev build (not recommended for production)
npm run dev
```

## Success Indicators

✅ **Build Successful If:**
- No red error messages
- Build completes with "Build completed successfully"
- Only yellow warnings (not errors)
- Static files generated in `.next/static/`

❌ **Build Failed If:**
- Red error messages
- Build stops with error code
- Missing dependencies
- TypeScript compilation errors
