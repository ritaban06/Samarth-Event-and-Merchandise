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

VITE_MERCH_URL=https://merch.ritaban.me  # Redirect destination URL
```

**Note:** Admin panel and backend do not require environment variables and remain always active.

## Deployment Instructions

### Important Note About Environment Variables
**Frontend environment variables (VITE_*) are build-time variables**, meaning they are compiled into the application during the build process. Therefore, changing them requires a rebuild and redeploy. This is different from backend environment variables which can be changed at runtime.

### Quick CLI Management (Recommended)

For **Vercel** deployments, you can manage environment variables directly from VS Code terminal:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Link your project (run once in your client directory)
cd event/client
vercel link
```

**One-time setup complete!** Now you can easily deploy from VS Code terminal.

### To Deactivate the Events Client Site:

1. **Edit Environment Variables Manually:**
   - Open your `.env` file in VS Code
   - Change `VITE_SITE_ACTIVE=true` to `VITE_SITE_ACTIVE=false`
   - Save the file

2. **Deploy from VS Code Terminal:**
   ```bash
   # Navigate to your client directory
   cd event/client
   
   # Deploy to Vercel
   vercel --prod
   ```

**Alternative - Set env via CLI:**
```bash
cd event/client
# To change existing environment variable (not add new one)
vercel env rm VITE_SITE_ACTIVE production
vercel env add VITE_SITE_ACTIVE false production
vercel --prod
```

**Or use the pull/push method:**
```bash
cd event/client
# Pull current env, edit locally, then push back
vercel env pull .env.vercel
# Edit the .env.vercel file to change VITE_SITE_ACTIVE=false
vercel env push .env.vercel
vercel --prod
```

### To Reactivate the Events Client Site:

1. **Edit Environment Variables Manually:**
   - Open your `.env` file in VS Code
   - Change `VITE_SITE_ACTIVE=false` to `VITE_SITE_ACTIVE=true`
   - Save the file

2. **Deploy from VS Code Terminal:**
   ```bash
   # Navigate to your client directory
   cd event/client
   
   # Deploy to Vercel
   vercel --prod
   ```

**Alternative - Set env via CLI:**
```bash
cd event/client
# To change existing environment variable (not add new one)
vercel env rm VITE_SITE_ACTIVE production
vercel env add VITE_SITE_ACTIVE true production
vercel --prod
```

**Or use the pull/push method:**
```bash
cd event/client
# Pull current env, edit locally, then push back
vercel env pull .env.vercel
# Edit the .env.vercel file to change VITE_SITE_ACTIVE=true
vercel env push .env.vercel
vercel --prod
```

## User Experience When Deactivated

### Frontend (Client Site)
- Shows a beautiful maintenance page with countdown timer
- Displays message: "The events registration period has ended. You are being redirected to our merchandise store."
- Automatically redirects to the URL specified in `VITE_MERCH_URL` (defaults to `https://merch.ritaban.me`) after 3 seconds
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
The redirect destination is controlled by the `VITE_MERCH_URL` environment variable. If not set, it defaults to `https://merch.ritaban.me`.

### Redirect Messages
Update the `REDIRECT_MESSAGE` constant in `SiteStatus.jsx` to customize the user message.

### Timer Duration
- Client redirect: 3 seconds (modify in `SiteStatus.jsx`)

## File Structure

```
event/
├── client/
│   ├── src/components/SiteStatus.jsx         # Client maintenance component
│   ├── .env                                  # Edit VITE_SITE_ACTIVE here
│   └── .env.example                          # Template with VITE_SITE_ACTIVE and VITE_MERCH_URL
├── admin/                                    # Admin panel (always active)
└── backend/                                  # Backend API (always active)
```

## Testing

### Local Testing
1. Set environment variables in your client `.env` file:
   ```bash
   VITE_SITE_ACTIVE=false
   VITE_MERCH_URL=http://localhost:3002  # Or your local merch site
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
1. Deploy with deactivated environment variables for client only:
   ```bash
   VITE_SITE_ACTIVE=false
   VITE_MERCH_URL=https://merch.ritaban.me
   ```
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
- **Flexible Redirect**: Configurable redirect destination via environment variables
- **Environment Support**: Different redirect URLs for dev/staging/production

## Monitoring

When client is deactivated, you can monitor:
- Client redirect success rates
- User engagement with the maintenance message
- Traffic patterns to the merch site
- Admin usage patterns (which remain unaffected)
- Backend API usage from admin operations

This simplified system provides a professional way to manage the client-facing events site while keeping administrative and operational capabilities fully intact.

## Troubleshooting

### Environment Variable Already Exists Error

If you get the error: `The variable "VITE_SITE_ACTIVE" has already been added to all Environments`, use one of these methods:

**Method 1: Remove and Re-add (Recommended)**
```bash
cd event/client
vercel env rm VITE_SITE_ACTIVE production
vercel env add VITE_SITE_ACTIVE false production  # or true to reactivate
vercel --prod
```

**Method 2: Pull, Edit, Push**
```bash
cd event/client
vercel env pull .env.vercel
# Edit the .env.vercel file manually to change VITE_SITE_ACTIVE value
vercel env push .env.vercel
vercel --prod
```

**Method 3: Use Vercel Dashboard**
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to Environment Variables
4. Edit the `VITE_SITE_ACTIVE` variable directly
5. Redeploy from CLI: `vercel --prod`

### Common CLI Commands
```bash
# List all environment variables
vercel env ls

# Remove a specific environment variable
vercel env rm VITE_SITE_ACTIVE production

# Add environment variable to specific environment
vercel env add VITE_SITE_ACTIVE false production

# Pull environment variables to local file
vercel env pull .env.vercel

# Push local environment file to Vercel
vercel env push .env.vercel
```
