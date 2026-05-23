# Contex360 Frontend

The frontend for the Contex360 ERP and management system. Built with Vue 3, Vite, and Tailwind CSS.

## 🚀 Technologies

- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **Styling**: Tailwind CSS
- **Testing**: Vitest
- **Type Checking**: TypeScript

## 📦 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

## ⚙️ Environment Variables

Copy `.env.example` to `.env` and fill in the required variables:

- `VITE_API_BASE_URL`: The URL of the backend API (e.g., `http://localhost:3001` for local development).

## 🚢 Deployment

This project is configured for automated deployment via Vercel. Pushes to the `staging` or `main` branches will trigger deployments.
