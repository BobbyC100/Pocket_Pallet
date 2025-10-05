# 🌳 Banyan

> Transform founder instinct into investor-ready clarity

Banyan is an AI-powered tool that helps founders create comprehensive investor briefs and strategic vision frameworks. Turn what's in your head into professional documents that investors can trust—six prompts in, one investor-ready page out.

## ✨ Features

### 📝 **AI-Powered Brief Generation**
- **6-Step Prompt Wizard**: Answer key questions about your startup in minutes
- **Dual AI Models**: Leverages GPT-4 for intelligent content generation
- **Dual Outputs**: Generates both founder-friendly and VC-ready versions
- **Smart Auto-Fill**: Test with pre-built examples (YardBird construction logistics startup)

### 🎯 **Vision Framework System**
- **Intelligent Mapping**: Automatically extracts vision framework from your brief
- **Comprehensive Structure**: 
  - Vision (Purpose + End State)
  - Mission (What We Do, Who For, How We Win)
  - Operating Principles (Behaviors + Anti-Behaviors)
  - Objectives (with Key Results)
  - Brand Brief (Positioning, Tone, Story)
- **Beautiful Editor**: Intuitive interface with real-time validation
- **Complete View**: Professional formatted view of your entire framework
- **Export Options**: Markdown and PDF export capabilities

### 🚀 **User Experience**
- **One-Click Test Data**: Auto-fill wizard with realistic startup examples
- **Session Persistence**: Seamless workflow from brief to vision framework
- **Progress Tracking**: Visual indicators show completion status
- **Real-Time Validation**: Helpful feedback as you build your framework
- **Responsive Design**: Works beautifully on all screen sizes

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI Integration**: 
  - OpenAI GPT-4 API
  - Anthropic Claude API (optional)
- **Validation**: Zod schemas
- **PDF Generation**: jsPDF + html2canvas
- **Markdown**: ReactMarkdown

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/BobbyC100/Banyan.git
cd Banyan
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional (Claude integration - may have regional restrictions)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Developer Tools

Access all testing utilities and development tools at: [http://localhost:3000/dev-tools](http://localhost:3000/dev-tools)

## 🎮 Usage

### Quick Start with Test Data

1. **Navigate to** `/new` (Create Your Brief)
2. **Click** the green "🚀 Load Test Data (YardBird)" button
3. **All 6 wizard steps** are instantly filled with realistic construction logistics startup data
4. **Click** "Generate Brief" to create AI-powered briefs
5. **Click** "Create Vision Framework" to build your strategic framework
6. **Fill in vision fields** in the modal
7. **View and edit** your complete vision framework

### Creating Your Own Brief

1. **Answer 6 key questions** about your startup:
   - Problem & Market Timing
   - Customer & Go-to-Market Strategy
   - Progress & Traction
   - 6-Month Milestone
   - Financial Position (Cash & Burn)
   - Key Risk or Assumption

2. **Generate AI-powered briefs**:
   - Founder Brief (detailed, comprehensive)
   - VC Summary (concise, investment-focused)

3. **Create Vision Framework**:
   - Add Vision Purpose and End State
   - Auto-populated with brief data
   - Edit and refine all sections
   - Export to share with team/investors

## 📁 Project Structure

```
Banyan/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── generate-brief/      # AI brief generation endpoint
│   │   │   └── vision-framework/     # Vision framework CRUD
│   │   ├── brief/[id]/               # Individual brief view
│   │   ├── new/                      # Wizard & brief creation
│   │   ├── vision-framework/         # Framework editor
│   │   └── page.tsx                  # Landing page
│   ├── components/
│   │   ├── PromptWizard.tsx          # 6-step wizard
│   │   ├── VisionFrameworkPage.tsx   # Framework editor
│   │   ├── VisionModal.tsx           # Vision capture modal
│   │   └── ...
│   └── lib/
│       ├── vision-framework-schema.ts # Zod schemas & mapping
│       ├── templates.ts               # Wizard templates
│       ├── types.ts                   # TypeScript types
│       └── pdf-export.ts              # Export utilities
├── public/                            # Static assets
└── .env.local                         # Environment variables (create this)
```

## 🔑 API Keys Setup

### OpenAI API Key (Required)

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add to `.env.local` as `OPENAI_API_KEY`

### Anthropic API Key (Optional)

1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Create a new API key
3. Add to `.env.local` as `ANTHROPIC_API_KEY`
4. **Note**: Claude API may have regional restrictions

## 🧪 Testing

The project includes several testing utilities:

### Production Testing
- **Auto-Test Suite**: `/auto-test.html` - Automated testing
- **YardBird Injector**: `/yardbird-injector.html` - Session storage testing
- **Debug Tools**: `/debug-vision-framework.html` - Comprehensive debugging
- **Session Storage Test**: `/test-session-storage.html` - Validation testing

### Development Testing
- **Scoring Test Tool**: `/test-scoring.html` - Test vision framework scoring directly
  - Visual interface with example frameworks
  - 93% cost savings vs full generation flow
  - Perfect for iterating on scoring prompts
  - [See SCORING_TEST_GUIDE.md for details](./SCORING_TEST_GUIDE.md)

### Command-Line Testing
```bash
# Test scoring with different quality levels
./test-scoring.sh good   # High-quality framework
./test-scoring.sh poor   # Low-quality framework  
./test-scoring.sh mixed  # Mixed-quality framework
```

## 🎨 Design Philosophy

Banyan is built around the principle that founders have valuable instincts and insights locked in their heads. The tool helps structure and articulate these ideas into formats that:

- **Investors understand and trust**
- **Teams can rally around**
- **Serves as strategic foundation** for growth

The "Trunk and Branches" architecture (Vision Framework) creates a single source of truth that feeds into:
- Investor decks
- Team onboarding
- OKR planning
- Marketing messaging
- Product roadmaps

## 🚧 Development Roadmap

- [ ] Database integration for persistent storage
- [ ] User authentication and accounts
- [ ] Multi-company support
- [ ] Collaborative editing
- [ ] Version history and diffing
- [ ] Template library for different industries
- [ ] Integration with pitch deck tools
- [ ] Advanced AI features (suggestions, improvements)

## 🐛 Known Issues

- Claude API integration commented out due to regional restrictions (France)
- Session storage used for draft data (temporary solution)
- PDF export needs styling improvements
- Alignment warnings temporarily disabled for auto-generated content

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-4 API
- **Anthropic** for Claude API
- **Next.js** team for the amazing framework
- **Tailwind CSS** for beautiful styling
- **Vercel** for deployment platform

## 📧 Contact

**Bobby Ciccaglione**
- GitHub: [@BobbyC100](https://github.com/BobbyC100)

---

**Built with ❤️ to help founders turn instinct into clarity**

🌳 *Like a banyan tree with many roots, your vision framework supports and nourishes every part of your startup.*

