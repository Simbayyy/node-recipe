# Node Recipes - Recipe API

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![GitHub Release](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/Simbayyy/node-recipe/releases)

Node Recipes is a Node.js backend API for saving and managing recipes. It integrates with Deepl API for translation and the FoodDataCentral API from the USDA to fetch nutritional data.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Contact](#contact)

## Installation

To set up Node Recipes, you should have Node.js and npm (Node Package Manager) installed on your system. Here are the steps to get started:

1. Clone this repository to your local machine:
   ```sh
   git clone https://github.com/Simbayyy/node-recipe.git
   cd node-recipe
   ```
2. Install project dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```
   
## Usage

The Node Recipes API provides endpoints for saving, managing, and retrieving recipes. It integrates with Deepl API for translation and the FoodDataCentral API from the USDA to fetch nutritional data.

You can interact with the API by making HTTP requests to its endpoints. For detailed API documentation, please refer to the [API Documentation (WIP)](API.md).

## Features

- Integration with Deepl API for recipe translation and FoodDataCentral API from the USDA for nutritional data.

- Provides endpoints for creating, updating, and retrieving recipes.

- Session management using `express-session` and `connect-pg-simple`.

## Contributing

We welcome contributions to the Node Recipes API. If you'd like to contribute to this project, please follow our [Contribution Guidelines](CONTRIBUTING.md).

## License

Node Recipes is open-source and released under the [MIT License](LICENSE).

## Acknowledgments

We would like to acknowledge the following libraries and tools that have been instrumental in the development of this project:

- [Deepl API](https://www.deepl.com/docs-api)
- [FoodDataCentral API](https://fdc.nal.usda.gov/index.html)

## Contact

If you have questions, feedback, or want to report a bug, feel free to open an issue on our [GitHub repository](https://github.com/Simbayyy/node-recipe/issues).

---

[![YourUsername](https://img.shields.io/badge/Find%20More-Projects-9cf)](https://github.com/Simbayyy)
