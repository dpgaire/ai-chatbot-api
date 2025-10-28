require('dotenv').config();
const express = require('express');
const cors = require('cors');

const chatRoutes = require('./routes/chat.routes');
const trainRoutes = require('./routes/train.routes');
const projectRoutes = require('./routes/project.routes');
const blogRoutes = require('./routes/blog.routes');
const skillRoutes = require('./routes/skill.routes');
const aboutRoutes = require('./routes/about.routes');
const contactRoutes = require('./routes/contact.routes');
const authRoutes = require('./routes/auth.routes');
const queryRoutes = require('./routes/query.routes');
const statsRoutes = require('./routes/stats.routes');
const noteRoutes = require('./routes/note.routes');
const quickLinkRoutes = require('./routes/quicklink.routes');
const codeLogRoutes = require('./routes/code-log.routes');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: ['https://admin-dashboard-coral-nu-61.vercel.app', 'https://www.durgagairhe.com.np','http://localhost:5173','https://ai-chatbot-api-ten.vercel.app']
}));

app.use(express.json());

app.use('/api/chat', chatRoutes);
app.use('/api/train', trainRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/quicklinks', quickLinkRoutes);
app.use('/api/code-log',codeLogRoutes)

const swaggerUiOptions = {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customCssUrl: 'https://unpkg.com/swagger-ui-dist@5.17.0/swagger-ui.css',
  customJs: [
    'https://unpkg.com/swagger-ui-dist@5.17.0/swagger-ui-bundle.js',
    'https://unpkg.com/swagger-ui-dist@5.17.0/swagger-ui-standalone-preset.js'
  ]
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

app.use((req, res, next) => {
  console.log('Incoming:', req.method, req.originalUrl, 'from', req.headers.origin || 'no origin');
  next();
});

app.use("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Dashboard:Durga-Gairhe API</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          background: linear-gradient(135deg, #8b36e6ff, #2575fc);
          color: white;
          text-align: center;
        }
        .container {
          background: rgba(0, 0, 0, 0.4);
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }
        p {
          font-size: 1.2rem;
          opacity: 0.9;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Welcome to the API</h1>
        <p>Personal Chatbot Backend is running successfully 🎉</p>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API is running on port http://localhost:3000/api-docs`);
});