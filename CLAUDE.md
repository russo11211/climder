# Claude Instructions - Climder Climbing App
🔄 Project Awareness & Context

Always read the PRD (climder-prd.md) and App.js at the start of a new conversation to understand the Climder climbing app architecture, goals, and current implementation status.
Check for task management files before starting a new task. If the task isn't listed, add it with a brief description and today's date.
Use consistent naming conventions, file structure, and patterns as described in the PRD.
Use npm/yarn for React Native package management and Expo CLI for development.
Always consider the mobile-first architecture - understand which component (screens, components, utils) should handle specific climbing app features.

🧗 Code Structure & Modularity - Climbing App Architecture

Never create a file longer than 400 lines of code. Climbing apps require modular, maintainable code for complex social and location-based features.
Organize code into clearly separated modules, grouped by responsibility and functionality.
For the Climder climbing app this looks like:

Frontend Structure (React Native + Expo):

```
src/
├── screens/            # Main screen components (Discover, Matches, Groups, Locations)
├── components/         # Reusable UI components (ClimberCard, LocationCard, CroquisEditor)
├── data/              # Static data and mock data (climber profiles, locations)
├── utils/             # Utility functions (matching algorithm, grade conversion)
├── hooks/             # Custom React hooks (useMatches, useLocation, useCamera)
├── services/          # API services (authentication, backend communication)
├── types/             # TypeScript type definitions
└── assets/            # Images, icons, and static resources
```

Core Feature Modules:

- **MatchingSystem.js** - Climber compatibility algorithm and swipe logic
- **LocationService.js** - Climbing location data management and GPS integration
- **CroquisCanvas.js** - Route drawing and annotation functionality
- **GroupManager.js** - Group creation and participation logic
- **ProfileService.js** - User profile management and preferences

Use clear, consistent imports (prefer ES6 imports for React Native).
Use AsyncStorage for local data persistence and state management.
Follow React Native patterns for component composition and cross-platform compatibility.

🧪 Testing & Reliability - Climbing App Testing

Always create comprehensive tests for new climbing features (matching algorithm, location tracking, croquis drawing, group formation).
After updating any core logic, check whether existing tests need to be updated. If so, do it.
Tests should live in appropriate test directories within each component.

Include at least:

1. **Expected behavior test** (matching algorithm, location search, group creation)
2. **Edge case test** (network failures, GPS unavailable, invalid user data)
3. **Integration test** (camera integration, map services, authentication flow)
4. **Mock test** for external services (GPS, camera, push notifications)

Test user interactions with gestures and touch events thoroughly.
Mock device-specific features (camera, GPS, storage) in unit tests.

✅ Task Completion - Climbing App Development Tracking

Mark completed tasks in task management files immediately after finishing them, noting which screens/components were involved.
Add new sub-tasks or TODOs discovered during development to task management under a "Discovered During Work" section.
Track climbing app performance metrics (load times, gesture responsiveness, camera integration) in task completion notes.
Update component interfaces and documentation based on learning from completed tasks.

📱 Style & Conventions - Climbing App Standards

Use TypeScript for all new components with strict type checking enabled.
Use modern JavaScript (ES2020+) with consistent async/await patterns.
Follow React Native best practices and format with Prettier.
Use consistent styling with StyleSheet and consider design system patterns.
Use Expo SDK features appropriately for camera, location, and notifications.
Use proper state management (useState, useContext) for app-wide data.

Write comprehensive JSDoc comments for every function with climbing-specific context:

```typescript
/**
 * Calculates compatibility score between two climbers based on multiple factors.
 *
 * This function analyzes climbing grades, preferred styles, location proximity,
 * and availability to generate a compatibility percentage for matching.
 *
 * @param climber1 - First climber's profile data
 * @param climber2 - Second climber's profile data
 * @param locationRadius - Maximum distance in kilometers for location matching
 * @returns Promise<CompatibilityScore> - Detailed compatibility breakdown
 * @throws {ValidationError} When climber profiles are incomplete
 * @throws {LocationError} When location data is unavailable
 */
async function calculateCompatibility(
    climber1: ClimberProfile, 
    climber2: ClimberProfile, 
    locationRadius: number
): Promise<CompatibilityScore>
```

📚 Documentation & Explainability - Climbing App Documentation

Update README.md when new climbing features are added, dependencies change, or new screens are implemented.
Document climbing terminology and ensure climbing-specific logic is understandable to developers.
When writing complex climbing workflows, add inline comments explaining the user flow:

```javascript
// Climbing Flow: Profile → Compatibility Check → Match → Group Formation
const compatibleClimbers = await findCompatibleClimbers(userProfile);
// Climbing Flow: Location service provides nearby climbing spots
const nearbyLocations = await fetchNearbyClimbingLocations(userLocation);
const suggestedGroups = await createGroupSuggestions(compatibleClimbers, nearbyLocations);
```

Maintain feature documentation explaining the reasoning behind UX decisions and climbing-specific requirements.
Document data structures for climber profiles, location information, and croquis data.

🧠 AI Behavior Rules - Climbing App Specific

Never assume missing context about climbing grades, techniques, or safety protocols. Ask clarifying questions.
Never hallucinate climbing locations or safety information – only use verified climbing data and best practices.
Always confirm device capabilities (camera, GPS) exist before referencing them in integration code.
Never delete or overwrite existing climbing data or user profiles unless explicitly instructed.
Always validate climbing safety information and location access before presenting to users.
Handle device permission failures gracefully with fallback strategies and clear user guidance.

⛰️ Climbing App Development Patterns

**User Experience**
- Use intuitive swipe gestures for climber discovery and matching
- Implement responsive touch interactions for croquis drawing
- Maintain consistent navigation patterns across all climbing features
- Provide clear visual feedback for all user actions

**Data Management**
- Store climber profiles and matches in local storage for offline access
- Cache climbing location data to reduce API calls and improve performance
- Update user preferences and climbing progress with accurate timestamps
- Sync data when network connectivity is restored

**Error Handling**
- Implement graceful degradation for GPS and camera failures
- Provide meaningful error messages that help climbers understand app status
- Log user interactions for debugging and improving climbing features
- Handle permission requests appropriately for location and camera access

**Performance Optimization**
- Cache climbing location images and route data for faster loading
- Implement lazy loading for climbing location lists and image galleries
- Monitor app performance on various device sizes and capabilities
- Optimize croquis canvas rendering for smooth drawing experience

🚀 Development Workflow

1. **Plan climbing features** before implementing new functionality (matches, groups, locations, croquis)
2. **Test user interactions** independently before integration testing
3. **Validate all climbing data** and safety information at each step
4. **Update climbing location database** based on user feedback and real-world usage
5. **Document climbing terminology** and feature learning from successful implementations

**Priority Implementation Order:**
1. Core matching system with backend integration
2. Functional croquis canvas with drawing tools
3. Real-time group creation and management
4. Camera integration for location photo capture
5. Push notifications for matches and group activities

**Mobile-Specific Considerations:**
- Always test on both iOS and Android devices
- Consider different screen sizes and orientations
- Handle device-specific permissions (camera, location, storage)
- Optimize for varying network conditions and offline usage
- Test gesture interactions thoroughly on physical devices