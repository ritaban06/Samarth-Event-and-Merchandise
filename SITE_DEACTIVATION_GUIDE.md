# Site Deactivation System

This system allows you to deactivate the events site and redirect users to the merchandise site without having to undeploy the application.

## How It Works

The system uses environment variables to control the active status of the events site:
- When active: Normal site functionality
- When deactivated: Shows a maintenance message and redirects to the merch site

## Environment Variables

### For Client (Frontend)
Add to your `.env` file:
```bash
VITE_SITE_ACTIVE=true    # Site is active
# or
VITE_SITE_ACTIVE=false   # Site is deactivated (redirects to merch)
# or
VITE_SITE_ACTIVE=disabled # Site is deactivated (redirects to merch)
```

### For Backend (API)
Add to your `.env` file:
```bash
SITE_ACTIVE=true    # API is active
# or
SITE_ACTIVE=false   # API returns maintenance response
# or
SITE_ACTIVE=disabled # API returns maintenance response
```

## Deployment Instructions

### To Deactivate the Events Site:

1. **Update Environment Variables:**
   - Set `VITE_SITE_ACTIVE=false` in your client deployment (Vercel/Netlify)
   - Set `SITE_ACTIVE=false` in your backend deployment (Vercel/Render/Railway)

2. **For Vercel Deployment:**
   ```bash
   # Set environment variables in Vercel dashboard or using CLI
   vercel env add VITE_SITE_ACTIVE false
   vercel env add SITE_ACTIVE false
   
   # Redeploy to apply changes
   vercel --prod
   ```

3. **For Render/Railway:**
   - Update environment variables in the dashboard
   - The service will automatically redeploy

### To Reactivate the Events Site:

1. **Update Environment Variables:**
   - Set `VITE_SITE_ACTIVE=true` in your client deployment
   - Set `SITE_ACTIVE=true` in your backend deployment

2. **Redeploy** using the same process as above

## User Experience When Deactivated

### Frontend (Client Site)
- Shows a beautiful maintenance page with countdown timer
- Displays message: "The events registration period has ended. You are being redirected to our merchandise store."
- Automatically redirects to `https://merch.ritaban.me` after 3 seconds
- Provides manual redirect button for immediate access

### Admin Panel
- Shows admin-specific maintenance page
- Displays message: "The events administration period has ended. You are being redirected to our merchandise store."
- Automatically redirects after 5 seconds (longer for admin review)
- Uses Material-UI components for consistent admin styling

### Backend API
- Returns HTTP 503 (Service Unavailable) status
- Provides JSON response with redirect information:
  ```json
  {
    "success": false,
    "message": "Events site is temporarily unavailable. Redirecting to merchandise store.",
    "redirectUrl": "https://merch.ritaban.me",
    "status": "maintenance"
  }
  ```

## Customization

### Redirect URL
To change the redirect destination, update the `MERCH_URL` constant in:
- `event/client/src/components/SiteStatus.jsx`
- `event/admin/src/components/AdminSiteStatus.jsx`

### Redirect Messages
Update the `REDIRECT_MESSAGE` constant in the same files to customize the user message.

### Timer Duration
- Client redirect: 3 seconds (modify in `SiteStatus.jsx`)
- Admin redirect: 5 seconds (modify in `AdminSiteStatus.jsx`)

## File Structure

```
event/
├── client/src/components/SiteStatus.jsx          # Client maintenance component
├── admin/src/components/AdminSiteStatus.jsx      # Admin maintenance component
├── backend/src/middleware/siteStatusMiddleware.js # API maintenance middleware
├── client/.env.example                           # Updated with VITE_SITE_ACTIVE
├── admin/.env.example                            # Updated with VITE_SITE_ACTIVE
└── backend/.env.example                          # Updated with SITE_ACTIVE
```

## Testing

### Local Testing
1. Set environment variables in your `.env` files:
   ```bash
   VITE_SITE_ACTIVE=false
   SITE_ACTIVE=false
   ```

2. Start your development servers:
   ```bash
   # Client
   cd event/client && npm run dev
   
   # Admin
   cd event/admin && npm run dev
   
   # Backend
   cd event/backend && npm run dev
   ```

3. Visit the sites to see the maintenance pages

### Production Testing
1. Deploy with deactivated environment variables
2. Test that all routes redirect properly
3. Verify API endpoints return maintenance responses
4. Check that the merch site remains accessible

## Benefits

- **No Downtime**: Site remains deployed and accessible
- **SEO Friendly**: Returns proper HTTP status codes
- **User Experience**: Clear messaging and automatic redirection
- **Easy Management**: Simple environment variable toggle
- **Reversible**: Can be reactivated instantly
- **API Safety**: Backend also respects the deactivation status

## Monitoring

When deactivated, you can monitor:
- Redirect success rates
- User engagement with the maintenance message
- Traffic patterns to the merch site
- API requests that hit the maintenance middleware

This system provides a professional and user-friendly way to manage the lifecycle of your events site while maintaining a seamless experience for your users.
