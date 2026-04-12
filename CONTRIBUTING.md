# Contributing to Realm Explorer

First off, thank you for considering contributing to Realm Explorer! It's people like you that make this a great tool for the Minecraft community.

## 🚀 Getting Started

1. **Fork the repository** to your own GitHub account.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/frostjade71/RealmExplorer.git
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Environment Setup**:
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
5. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🛠️ How to Contribute

### Reporting Bugs
- Use the **GitHub Issues** tab.
- Provide a clear, descriptive title.
- List the steps needed to reproduce the bug.
- Include details about your environment (browser, OS).

### Suggesting Features
- Open a new **Issue** with the "feature request" tag.
- Explain why this feature would be useful and how it should work.

### Submitting Changes
1. **Create a new branch** for your feature or fix:
   ```bash
   git checkout -b feature/amazing-feature
   ```
2. **Commit your changes** using clear, concise messages.
3. **Push to your fork**:
   ```bash
   git push origin feature/amazing-feature
   ```
4. **Open a Pull Request** against our `main` branch.

## 🎨 Coding Standards

- **TypeScript**: Use strict typing where possible. Avoid `any`.
- **Styling**: We use **Tailwind CSS**. Follow existing patterns for spacing and colors.
- **Components**: Keep components small, reusable, and well-named.
- **Format**: Run `npm run lint` before submitting to ensure code quality.

## 📝 Commit Messages
We follow a simple convention for commit messages:
- `hotfix:` for hotfixes
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for UI/styling changes
- `refactor:` for code improvements

## ⚖️ License
By contributing, you agree that your contributions will be licensed under the project's current license.

