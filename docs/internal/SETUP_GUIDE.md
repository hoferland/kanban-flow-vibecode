# Setup Guide for Publishing Flow

This guide will help you set up your own repository and publish Flow as a public project.

## Prerequisites

Before you begin, ensure you have:
- A GitHub account
- Git installed on your system
- Node.js 20+ installed
- Rust installed (via rustup)

## Step 1: Update Repository Configuration

You'll need to replace placeholder values with your actual GitHub repository information.

### 1.1 Update Git Remote

```bash
# Navigate to your project directory
cd /path/to/flow-kanban

# Update the remote URL to your repository
git remote set-url origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

# Verify the change
git remote -v
```

### 1.2 Update Tauri Configuration

Edit `packages/desktop/src-tauri/tauri.conf.json`:

```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": [
        "https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME/releases/latest/download/latest.json"
      ],
      "dialog": false,
      "pubkey": "YOUR_PUBLIC_KEY_HERE"
    }
  }
}
```

Replace:
- `YOUR_GITHUB_USERNAME` - Your GitHub username
- `YOUR_REPO_NAME` - Your repository name
- `YOUR_PUBLIC_KEY_HERE` - Your Tauri signing public key (see Step 2)

## Step 2: Generate Signing Keys

For secure auto-updates, you need to generate signing keys:

```bash
# Create directory for keys
mkdir -p ~/.tauri

# Generate key pair
cd ~/.tauri
openssl genpkey -algorithm RSA -out flow-kanban.key -pkeyopt rsa_keygen_bits:2048

# Extract public key in the format Tauri expects
openssl rsa -in flow-kanban.key -pubout -outform DER | base64 | tr -d '\n' > flow-kanban.key.pub

# View your public key
cat flow-kanban.key.pub
```

Copy the public key output and paste it into `tauri.conf.json` as the `pubkey` value.

**⚠️ Important:** 
- Keep `flow-kanban.key` (private key) **SECRET** - Never commit it to Git
- The public key (`flow-kanban.key.pub`) can be shared and goes in `tauri.conf.json`
- The private key is used when building releases

## Step 3: Update Documentation URLs

Run a find-and-replace across all documentation files to update URLs:

```bash
# Use your text editor's find-and-replace feature
# Or use command line tools:

# macOS/Linux
find . -type f \( -name "*.md" -o -name "*.json" \) -exec sed -i '' 's/YOUR_USERNAME/your-github-username/g' {} +
find . -type f \( -name "*.md" -o -name "*.json" \) -exec sed -i '' 's/YOUR_REPO/your-repo-name/g' {} +
```

Files that contain placeholders:
- `README.md`
- `INSTALLATION.md`
- `docs/GITHUB_RELEASE_GUIDE.md`
- `docs/AUTO_UPDATE_TESTING.md`
- `docs/QUICK_START_RELEASE.md`
- `AUTO_UPDATE_IMPROVEMENTS.md`
- `packages/desktop/src-tauri/tauri.conf.json`

## Step 4: Create GitHub Repository

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Enter repository name (e.g., `flow-kanban`)
   - Choose "Public" for auto-updates to work
   - Don't initialize with README (you already have one)

2. **Push your code:**
   ```bash
   git add .
   git commit -m "Initial commit - Flow Kanban Board"
   git branch -M main
   git push -u origin main
   ```

## Step 5: Configure GitHub Secrets (Optional)

If you want to automate releases with GitHub Actions:

1. Go to your repository settings → Secrets and variables → Actions
2. Add these secrets:
   - `TAURI_PRIVATE_KEY` - Content of `~/.tauri/flow-kanban.key`
   - `TAURI_KEY_PASSWORD` - If you set a password on your key

## Step 6: Test Your Setup

1. **Build the application:**
   ```bash
   cd packages/desktop
   npm install
   npm run tauri build
   ```

2. **Verify build output:**
   ```bash
   ls -la src-tauri/target/release/bundle/dmg/
   ```

   You should see:
   - `.dmg` files
   - `.dmg.tar.gz` files
   - `.sig` files
   - `latest.json`

3. **Create your first release:**
   ```bash
   ./scripts/create-github-release.sh
   ```

## Step 7: Verify Auto-Updates Work

1. **Check the update endpoint:**
   ```bash
   curl https://github.com/YOUR_USERNAME/YOUR_REPO/releases/latest/download/latest.json
   ```

   Should return JSON with version info and signatures.

2. **Test in the app:**
   - Build and install version 0.2.1
   - Create a new release 0.2.2
   - Launch the app
   - Should see update notification

## Important Files to Customize

### Author Information

Update in `README.md`:
```markdown
## 👤 Author

Created by [Your Name or Organization]
```

### License

Review and update `LICENSE` file if needed:
- Current license: MIT
- Update copyright holder name
- Update year if necessary

### Package Information

Update `package.json` files:
- `packages/desktop/package.json`
- `packages/shared/package.json`
- Root `package.json`

Consider updating:
- `name`
- `author`
- `repository`
- `bugs`
- `homepage`

## Troubleshooting

### "Permission denied" when running scripts

```bash
chmod +x scripts/*.sh
```

### Auto-updates not working

1. Verify repository is public
2. Check `latest.json` is accessible via curl
3. Verify public key in `tauri.conf.json` matches your key
4. Check console logs for errors

### Build fails

```bash
# Update dependencies
rustup update
cd packages/desktop
npm install

# Clean build
npm run tauri build -- --clean
```

## Security Checklist

Before making repository public:

- [ ] Remove any personal API keys or tokens
- [ ] Verify `.gitignore` excludes sensitive files
- [ ] Private key (`flow-kanban.key`) is NOT in repository
- [ ] No personal email addresses in commit history you want to hide
- [ ] No internal company information in documentation
- [ ] Database files or user data not committed

## Next Steps

1. **Customize the app:**
   - Update branding
   - Modify features
   - Add your own functionality

2. **Set up CI/CD:**
   - Consider GitHub Actions for automated builds
   - See `.github/workflows/` examples online

3. **Community:**
   - Add CONTRIBUTING.md
   - Set up issue templates
   - Create discussion board

## Getting Help

If you encounter issues:

1. Check existing documentation in `docs/`
2. Review Tauri documentation: https://tauri.app
3. Check Svelte documentation: https://svelte.dev
4. Open an issue on GitHub

---

**Congratulations!** You're now ready to publish Flow as your own project. Make it your own and happy coding! 🚀
