# HangOut

## Current State
Profile type has no gender field. EditProfileModal initializes gender as empty and doesn't save it. ProfileSetupPage also doesn't save gender. Gender is lost on every edit.

## Requested Changes (Diff)

### Add
- `gender` field (Text) to the backend Profile type
- Gender-specific SVG avatars: male, female, blank for others

### Modify
- EditProfileModal: read gender from profile, save gender back
- ProfileSetupPage: include gender in save payload
- All avatar displays: use gender-based default when no custom avatar

### Remove
- Nothing

## Implementation Plan
1. Regenerate backend with gender in Profile
2. Fix EditProfileModal to initialize gender from profile.gender and include it on save
3. Fix ProfileSetupPage to include gender on save
4. Create GenderAvatar component with male/female/blank SVGs
5. Use GenderAvatar as avatar fallback everywhere
