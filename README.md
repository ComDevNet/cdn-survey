# CDN Survey

The CDN survey website was made to run on the CDN servers for offline use. The website is a simple survey form that asks the users what ever questions has been set by the admin.

The website comes in 3 parts:

1. The admin page
2. The user page
3. The online creator

## Installation

To install follow the instructions below:

1. Clone the repository on your server
2. Run `chmod +x install.sh`
3. Run `./install.sh`

The script will do the rest.

## Usage

To use the website, visit the `your localhost` in your browser on port `3050` eg) `http://oc4d.cdn:3050`. The admin page is located at `/admin` and the user page is located at `/`.

## Tip

For easier access, copy the [card image](/public/card.webp) in the public folder into a easily accessible location on the server and add the port to your modules table. This will allow you to easily access it as you would with a module.

If you don't have a description for the module you can use this: `CDN Survey - A simple survey form for offline use.`

## Admin Page

The admin page has the following features:

1. Create a new survey
2. Edit a survey
3. Delete a survey
4. View survey results
5. Save survey results to a file
6. Import surveys.
7. Export surveys.

## Local Development

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Firstly you need to install the dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

This project can't be deployed on vercel as it requires read amd write access to the file system. You can deploy it on a server that has access to the file system.
