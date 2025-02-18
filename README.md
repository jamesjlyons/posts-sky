# PostsSky

A Bluesky client built with Next.js, inspired by Posts.cv. Not feature complete yet.

## Current Working Features

- 💛 Posts.cv feel
- 💙 Like and interact with posts
- 🧵 Thread view support
- 🖼️ Image post support
- 🔄 Infinite scroll
- 🌓 Dark mode support

## Features that still need to be implemented

- 📝 Text post support
- 📸 Image post support
- 📹 Video post support
- 📝 Reply to posts
- 🔍 Search for posts and users
- 🔄 Repost posts
- 💛 Lots of small details
- ⚡ Performance upgrades

## Tech Stack

- [Next.js 15](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [@atproto/api](https://github.com/bluesky-social/atproto) - Bluesky API client

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- A Bluesky account (recommend using an app-specific password)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/posts-sky.git
cd posts-sky
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
bun install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
posts-sky/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # React components
│   ├── lib/                 # Utilities and API functions
│   └── types/              # TypeScript type definitions
├── public/                  # Static assets
└── package.json            # Project dependencies and scripts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT

## Acknowledgments

- Inspired by the Posts app by Read.cv
- Built on the Bluesky social network
- Uses the AT Protocol
