# Vector AI - Deployment Guide

This guide covers deploying Vector AI (both backend and frontend) to Render's free plan.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Render Free Plan Limitations](#render-free-plan-limitations)
3. [Deployment Options](#deployment-options)
4. [Blueprint Deployment (Recommended)](#blueprint-deployment-recommended)
5. [Manual Deployment](#manual-deployment)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

- [ ] GitHub account with repository access
- [ ] Render account ([sign up free](https://render.com))
- [ ] Code pushed to a GitHub repository
- [ ] (Optional) OpenAI API key for enhanced features

---

## Render Free Plan Limitations

Understanding free tier constraints:

| Limit | Value |
|-------|-------|
| **Services** | Unlimited (with limitations) |
| **RAM** | 512 MB |
| **CPU** | Shared |
| **Bandwidth** | 100 GB/month |
| **Build Time** | 500 min/month |
| **Sleep Timer** | 15 min inactivity |
| **Cold Start** | 30-60 seconds |

### Recommendations for Free Plan

1. **Use Local Embeddings**: Set `EMBEDDING_PROVIDER=local` to avoid OpenAI costs
2. **Smaller Files**: Keep PDFs under 5MB for better performance
3. **Expect Cold Starts**: First request after idle takes longer

---

## Deployment Options

### Option 1: Blueprint (Recommended)

- Uses `render.yaml` for infrastructure-as-code
- Deploys both services with one click
- Automatic environment configuration

### Option 2: Manual

- Create services individually
- More control over settings
- Useful for custom configurations

---

## Blueprint Deployment (Recommended)

### Step 1: Prepare Your Repository

Ensure your repository has:

```
vector-ai/
├── render.yaml          # Render blueprint config
├── package.json         # Backend dependencies
├── src/                 # Backend source
└── frontend/
    ├── package.json     # Frontend dependencies
    └── src/             # Frontend source
```

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

### Step 3: Deploy on Render

1. **Log into Render**
   - Go to [dashboard.render.com](https://dashboard.render.com)

2. **Create Blueprint**
   - Click **"New"** → **"Blueprint"**
   - Select your GitHub repository
   - Render auto-detects `render.yaml`

3. **Review Services**
   - Backend: `vector-ai-backend` (Web Service)
   - Frontend: `vector-ai-frontend` (Static Site)

4. **Click Deploy**
   - Wait for builds to complete (~5-10 minutes)

### Step 4: Verify Deployment

After deployment:

| Service | URL Example |
|---------|-------------|
| Backend | `https://vector-ai-backend.onrender.com` |
| Frontend | `https://vector-ai-frontend.onrender.com` |

Test the backend:
```bash
curl https://vector-ai-backend.onrender.com/health
```

---

## Manual Deployment

### Deploy Backend

1. **Create Web Service**
   - Render Dashboard → New → Web Service
   - Connect GitHub repository
   
2. **Configure Settings**

   | Setting | Value |
   |---------|-------|
   | Name | `vector-ai-backend` |
   | Region | Oregon (free tier) |
   | Branch | `main` |
   | Root Directory | `.` (leave empty) |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Plan | Free |

3. **Add Environment Variables**

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `EMBEDDING_PROVIDER` | `local` |
   | `CHUNK_SIZE` | `300` |
   | `CHUNK_OVERLAP` | `30` |
   | `TOP_K_RESULTS` | `1` |
   | `SIMILARITY_THRESHOLD` | `0.3` |

4. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment

### Deploy Frontend

1. **Create Static Site**
   - Render Dashboard → New → Static Site
   - Connect GitHub repository

2. **Configure Settings**

   | Setting | Value |
   |---------|-------|
   | Name | `vector-ai-frontend` |
   | Branch | `main` |
   | Root Directory | `frontend` |
   | Build Command | `npm install && npm run build:prod` |
   | Publish Directory | `dist/vector-ai-frontend/browser` |

3. **Add Redirect/Rewrite Rules**
   
   For Angular SPA routing:
   - Source: `/*`
   - Destination: `/index.html`
   - Action: Rewrite

4. **Deploy**
   - Click "Create Static Site"

---

## Post-Deployment Configuration

### Update Frontend API URL

After backend deployment, update the frontend:

1. **Edit** `frontend/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://vector-ai-backend.onrender.com'  // Your actual URL
};
```

2. **Commit and push** - Render will auto-redeploy

### Enable AI-Powered Answers (FREE Options Available)

#### Option 1: Groq (FREE - Recommended)
1. Get FREE API key at [console.groq.com](https://console.groq.com)
2. Go to Backend service → Environment
3. Set `LLM_PROVIDER` to `groq`
4. Add `GROQ_API_KEY` with your key
5. Save Changes

#### Option 2: Google Gemini (FREE)
1. Get FREE API key at [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
2. Go to Backend service → Environment
3. Set `LLM_PROVIDER` to `gemini`
4. Add `GEMINI_API_KEY` with your key
5. Save Changes

#### Option 3: OpenAI (Paid - Premium Quality)
1. Get API key at [platform.openai.com](https://platform.openai.com)
2. Go to Backend service → Environment
3. Set `LLM_PROVIDER` to `openai`
4. Set `EMBEDDING_PROVIDER` to `openai`
5. Add `OPENAI_API_KEY` with your key
6. Save Changes

### Custom Domain (Optional)

1. Go to service Settings → Custom Domains
2. Add your domain
3. Configure DNS as instructed
4. Enable HTTPS

---

## Troubleshooting

### Common Issues

#### 1. Build Fails

**Symptom**: Build process errors

**Solutions**:
- Check Node.js version compatibility
- Verify `package.json` scripts
- Check build logs for specific errors

```bash
# Ensure correct Node version in render.yaml
envVars:
  - key: NODE_VERSION
    value: 18
```

#### 2. CORS Errors

**Symptom**: Frontend can't reach backend

**Solutions**:
- Verify backend URL in environment.prod.ts
- Check CORS middleware is enabled
- Ensure full URL includes `https://`

#### 3. Cold Start Timeout

**Symptom**: First request times out

**Solutions**:
- Wait longer (up to 60 seconds)
- Use a uptime monitoring service to ping regularly
- Consider paid plan for always-on

#### 4. Memory Limit Exceeded

**Symptom**: Service crashes on large files

**Solutions**:
- Reduce MAX_FILE_SIZE
- Use smaller PDFs
- Consider paid plan for more RAM

#### 5. Frontend 404 Errors

**Symptom**: Routes don't work after refresh

**Solutions**:
- Add SPA rewrite rule: `/* → /index.html`
- Verify Publish Directory is correct

### Checking Logs

1. Go to service dashboard
2. Click "Logs" tab
3. Filter by:
   - Deploy logs (build issues)
   - Runtime logs (application errors)

### Health Check

Verify services are running:

```bash
# Backend health
curl https://your-backend.onrender.com/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "vector-ai"
}
```

---

## Monitoring & Maintenance

### Free Uptime Monitoring

Use these free services to keep your app awake:

1. **UptimeRobot** (uptimerobot.com)
   - Free plan: 50 monitors
   - Set to ping every 5 minutes

2. **Cron-job.org**
   - Free cron jobs
   - Schedule health check pings

### Example Cron Setup

```
# Ping every 10 minutes
*/10 * * * * curl https://vector-ai-backend.onrender.com/health
```

---

## Security Considerations

### Environment Variables

- Never commit API keys to git
- Use Render's environment variable management
- Mark sensitive variables as "Secret"

### HTTPS

- Render provides free SSL certificates
- All traffic is encrypted by default

### Rate Limiting

Consider adding rate limiting for production:

```javascript
// In your backend code
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## Upgrading to Paid Plan

When you outgrow free tier:

| Plan | Price | Benefits |
|------|-------|----------|
| Starter | $7/mo | No cold starts, 512MB RAM |
| Standard | $25/mo | 2GB RAM, more CPU |
| Pro | $85/mo | 4GB RAM, priority support |

---

## Need Help?

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Community**: [community.render.com](https://community.render.com)
- **Status**: [status.render.com](https://status.render.com)

---

<p align="center">
  <strong>Happy Deploying! 🚀</strong>
</p>

