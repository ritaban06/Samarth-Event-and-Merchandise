# Site Deactivation System

This system allows you to deactivate the **events client site** and redirect users to the merchandise site without having to undeploy the application.

## How It Works

The system uses environment variables to control the active status of the events client site:
- When active: Normal site functionality
- When deactivated: Shows a maintenance message and redirects to the merch site
- **Admin panel and backend API remain fully functional** for management purposes

## Environment Variables

### For Client (Frontend) Only
Add to your `.env` file:
```bash
VITE_SITE_ACTIVE=true    # Site is active
# or
VITE_SITE_ACTIVE=false   # Site is deactivated (redirects to merch)
# or
VITE_SITE_ACTIVE=disabled # Site is deactivated (redirects to merch)
```

**Note:** Admin panel and backend do not require environment variables and remain always active.

## Deployment Instructions

### To Deactivate the Events Client Site:

1. **Update Environment Variable:**
   - Set `VITE_SITE_ACTIVE=false` in your client deployment (Vercel/Netlify)
   - **Admin and backend remain fully operational**

2. **For Vercel Deployment:**
   ```bash
   # Set environment variable in Vercel dashboard or using CLI
   vercel env add VITE_SITE_ACTIVE false
   
   # Redeploy client to apply changes
   vercel --prod
   ```

3. **For Netlify/Other Platforms:**
   - Update environment variables in the platform dashboard
   - The client will automatically redeploy

### To Reactivate the Events Client Site:

1. **Update Environment Variable:**
   - Set `VITE_SITE_ACTIVE=true` in your client deployment

2. **Redeploy** using the same process as above

## User Experience When Deactivated

### Frontend (Client Site)
- Shows a beautiful maintenance page with countdown timer
- Displays message: "The events registration period has ended. You are being redirected to our merchandise store."
- Automatically redirects to `https://merch.ritaban.me` after 3 seconds
- Provides manual redirect button for immediate access

### Admin Panel
- **Remains fully functional** - No deactivation or redirect
- Admins can continue to manage events, view registrations, and access all features
- Always accessible at the admin URL

### Backend API
- **Remains fully operational** - No maintenance mode
- All endpoints continue to function normally
- Admin panel can continue to make API calls
- Data management and operations remain uninterrupted

## Customization

### Redirect URL
To change the redirect destination, update the `MERCH_URL` constant in:
- `event/client/src/components/SiteStatus.jsx`

### Redirect Messages
Update the `REDIRECT_MESSAGE` constant in `SiteStatus.jsx` to customize the user message.

### Timer Duration
- Client redirect: 3 seconds (modify in `SiteStatus.jsx`)

## File Structure

```
event/
├── client/src/components/SiteStatus.jsx          # Client maintenance component
├── client/.env.example                           # Updated with VITE_SITE_ACTIVE
├── admin/                                        # Admin panel (always active)
└── backend/                                      # Backend API (always active)
```

## Testing

### Local Testing
1. Set environment variable in your client `.env` file:
   ```bash
   VITE_SITE_ACTIVE=false
   ```

2. Start your development servers:
   ```bash
   # Client (will show maintenance page)
   cd event/client && npm run dev
   
   # Admin (remains fully functional)
   cd event/admin && npm run dev
   
   # Backend (remains fully functional)
   cd event/backend && npm run dev
   ```

3. Visit the client site to see the maintenance page
4. Admin and backend remain accessible and functional

### Production Testing
1. Deploy with deactivated environment variable for client only
2. Test that client routes redirect properly
3. Verify admin panel remains fully accessible
4. Check that backend API endpoints remain functional
5. Verify that the merch site remains accessible

## Benefits

- **No Downtime**: Client site remains deployed but shows maintenance message
- **Admin Access**: Admin panel remains fully functional for management
- **API Continuity**: Backend continues to serve admin operations
- **SEO Friendly**: Returns proper HTTP status codes for the client
- **User Experience**: Clear messaging and automatic redirection for users
- **Easy Management**: Simple environment variable toggle for client only
- **Reversible**: Client can be reactivated instantly
- **Operational Continuity**: Business operations continue via admin panel

## Monitoring

When client is deactivated, you can monitor:
- Client redirect success rates
- User engagement with the maintenance message
- Traffic patterns to the merch site
- Admin usage patterns (which remain unaffected)
- Backend API usage from admin operations

This simplified system provides a professional way to manage the client-facing events site while keeping administrative and operational capabilities fully intact.
