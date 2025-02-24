# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 💾 PostgreSQL + DrizzleORM
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started


### Installation

Install the dependencies:

```bash
bun
```

### Development

Copy `.env.example` to `.env` and provide a `DATABASE_URL` with your connection string.

Run an initial database migration:

```bash
bun db:migrate
```

Start the development server with HMR:

```bash
bun dev
```

Your application will be available at `http://localhost:5174`.

## Building for Production

Create a production build:

```bash
pnpm run build
```

## Deployment

This template includes :

- A `Dockerfile` to build your app 
- A workflow file `.github/worklows/deploy-to-zaneops.yaml` for deploying to your ZaneOps instance 

To build and run using Docker:

```bash
# Build your app
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application is deployed to ZaneOps, for more information see https://zaneops.dev/tutorials/react-router


## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router and deployed on [ZaneOps](https://zaneops.dev).
