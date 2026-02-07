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

### Prerequisites

- [Bun](https://bun.sh) >= 1.1.45
- [Docker](https://docs.docker.com/get-started/get-docker/)
- [docker-compose](https://docs.docker.com/compose/install)

### Installation

Install the dependencies:

```bash
bun install --frozen-lockfile
```

### Development

Copy `.env.example` to `.env` and provide a `DATABASE_URL` with your connection string.

Start the development server with HMR:

```bash
bun dev
```

Run an initial database migration:

```bash
bun db:migrate
```

Your application will be available at [http://localhost:5174](http://localhost:5174)

## Building for Production

Create a production build:

```bash
bun run build
```

## Deployment

This template includes :

- A `Dockerfile` to build your app 
- A `docker-compose.yml` for deploying the Database & redis to your ZaneOps instance
- A workflow file `.github/worklows/ci.yaml` for deploying to your ZaneOps instance 

To build and run using Docker:

```bash
# Build your app
docker build -t my-app .

# Run the container
docker run --rm -p 3000:3000 my-app
```

The containerized application is deployed to ZaneOps, for more information see https://zaneops.dev/tutorials/react-router


## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router and deployed on [ZaneOps](https://zaneops.dev).
