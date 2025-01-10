# Soccer Team Builder

A Progressive Web App (PWA) that helps you create balanced soccer teams based on player skill levels. Perfect for organizing friendly matches or training sessions.

## Features

- Add up to 15 players with customizable skill levels
- Automatically generate balanced teams
- Share rosters and team distributions
- Works offline (PWA)
- Mobile-friendly design
- Installable on desktop and mobile devices

## Development

This project uses:
- React 18
- Vite 6
- Material-UI 6
- TypeScript
- PWA support

### Getting Started

1. Clone the repository:
```bash
git clone https://github.com/good-enough-software/team-builder.git
cd team-builder
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Preview production build:
```bash
npm run preview
```

## Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the main branch. The deployment process is handled by GitHub Actions.

The app will be available at: https://good-enough-software.github.io/team-builder/

To deploy manually:

1. Build the project:
```bash
npm run build
```

2. Push changes to the main branch:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

## License

MIT
