# Project Overview (Aashaka UI)

This document summarizes the work completed so far, how it behaves at runtime, and where each piece lives in the codebase.

## Header System

There are two header layouts:

1. Classic header (home and login pages)
   - Used on `/` and `/login`
   - Top maroon bar with centered "Free Delivery on all orders over ₹1999 !!"
   - Left side shows "Welcome, <Name>" when logged in
   - Right side shows icons (search, wishlist, order history, user profile, logout)
   - Main navbar with logo on the left and navigation on the right
   - Dropdowns for CLOTHS and JEWELLERY

2. Split header (all other pages)
   - `HeaderTop` (maroon strip with welcome and icons)
   - `HeaderMainNav` (logo and main navigation)
   - Dropdowns also work on these pages

Files:
- `src/components/header.js` + `src/components/header.css` (classic header)
- `src/components/HeaderTop.jsx` + `src/components/HeaderTop.css` (top strip)
- `src/components/HeaderMainNav.jsx` + `src/components/HeaderMainNav.css` (main nav)
- `src/components/main.jsx` (routing and conditional header)

## Welcome Name Logic

The welcome text uses a name derived from the logged-in user, not the email.

Example:
- `patelpurav02@gmail.com` becomes `Purav`

Rules:
- Use `userName` prop first if provided
- Otherwise read `localStorage.user`
- Remove the `@domain` part
- Remove digits and common surname prefixes
- Capitalize the remaining name

On login/signup/forgot-password pages, the top strip shows `Welcome` only.

Files:
- `src/components/HeaderTop.jsx`
- `src/components/header.js` (classic header)

## Dropdown Menus (All Pages)

Dropdown menus for CLOTHS and JEWELLERY work on all pages, not just home.

Behavior:
- Hover on CLOTHS or JEWELLERY opens the dropdown
- Underline animation stays visible on hover
- Dropdown items show an underline on hover

Files:
- `src/components/HeaderMainNav.jsx`
- `src/components/HeaderMainNav.css`
- `src/components/header.css` (classic header dropdown styling)

## User Profile Page

The user profile page (`/user-profile`) contains:
- Tabs: Order History and Addresses
- Address list view with ADD ADDRESS button
- Full address form with local state
- State and City custom dropdowns (searchable)

Files:
- `src/components/UserProfile.jsx`
- `src/components/UserProfile.css`

## Wishlist Feature (End to End)

Wishlist now persists and renders correctly:

Flow:
1. Product details page "Add to Wishlist" toggles the item.
2. Items are stored in localStorage.
3. The `/wishlist` page lists items with image, price, and actions.
4. Items can be removed or added to cart.

Storage key:
- `aashaka_wishlist`

Files:
- `src/context/WishlistContext.jsx`
- `src/pages/Wishlist.jsx`
- `src/pages/Wishlist.css`
- `src/pages/ProductDetails.jsx` (wishlist integration)
- `src/index.js` (provider registration)
- `src/components/main.jsx` (route)

## Routes Added/Used

Key routes in `src/components/main.jsx`:
- `/` (home)
- `/login`
- `/signup`
- `/user-profile`
- `/wishlist`
- Product and category routes (existing)

## Notes

- Cart functionality remains unchanged; wishlist uses its own context.
- All styling is CSS-based (no inline hacks).
- Header visuals now match the Aashaka reference with consistent spacing and hover effects.
