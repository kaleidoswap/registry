# KaleidoSwap Registry

A web application that displays supported RGB assets and trading pairs available through the KaleidoSwap market maker. Users can explore assets, view trading pairs, and get asset IDs for trading over Lightning Network using RGB channels.


## Features

- Browse available RGB assets and trading pairs
- Search and filter functionality
- Copy asset IDs with one click
- Responsive design with dark/light mode
- Network selection (Signet/Regtest)

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Deployment

This application is automatically deployed to Vercel. The deployment process includes:

1. Continuous Integration via GitHub Actions
2. Automatic deployments to Vercel for each push to main
3. Preview deployments for pull requests

## Environment Variables

No environment variables are required for basic functionality. The API endpoints are configured based on the selected network:

- Signet: `https://api.signet.kaleidoswap.com`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
