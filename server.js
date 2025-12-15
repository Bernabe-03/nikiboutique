import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import 'dotenv/config';

// Imports des modules locaux
import connectDB from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Imports des routes
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import ordersRouter from './routes/orders.js';
import categoriesRouter from './routes/categories.js';
import usersRouter from './routes/users.js';
import uploadsRouter from './routes/uploads.js';
import reviewsRouter from './routes/reviews.js';

// --- Fonction pour créer l'admin (Adapté à NIKI  Boutique) ---
const createAdminUser = async () => {
  try {
    const User = (await import('./models/User.js')).default;
    // Utilisation du nouvel email pour l'admin
    const existingAdmin = await User.findOne({ email: 'boutiueniki16@gmail.com' });

    if (!existingAdmin) {
      const adminUser = new User({
        firstName: 'Admin',
        lastName: 'NIKI ',
        email: 'boutique1niki@gmail.com',
        password: '0708808945N',
        phone: '0708808945', 
        role: 'admin',
        isActive: true
      });

      await adminUser.save();
      console.log('✅ Compte admin pour NIKI  Boutique créé avec succès');
    } else {
      console.log('✅ Compte admin NIKI  Boutique existe déjà');
    }
  } catch (error) {
    console.error('❌ Erreur création admin NIKI  Boutique:', error.message);
  }
};

// --- Fonction pour créer les catégories par défaut (Adapté aux vêtements) ---
const createDefaultCategories = async () => {
  try {
    const Category = (await import('./models/Category.js')).default;
    
    // Nouvelles catégories pour les vêtements, chaussures, etc.
    const defaultCategories = [
      {
        name: "Vêtements Femmes",
        type: "vetement_femme",
        description: "Collection de vêtements pour femmes (robes, jupes, tops...)",
        isActive: true,
        order: 1
      },
      {
        name: "Vêtements Enfants",
        type: "vetement_enfant", 
        description: "Collection de vêtements pour enfants et bébés",
        isActive: true,
        order: 2
      },
      {
        name: "Chaussures",
        type: "chaussure",
        description: "Chaussures pour femmes et enfants",
        isActive: true,
        order: 3
      },
      {
        name: "Accessoires de Mode",
        type: "accessoire_mode",
        description: "Sacs, bijoux et autres accessoires",
        isActive: true,
        order: 4
      }
    ];

    let categoriesCreated = 0;

    for (const categoryData of defaultCategories) {
      const existingCategory = await Category.findOne({ name: categoryData.name });
      if (!existingCategory) {
        const category = new Category(categoryData);
        // Générer le slug
        category.seo = {
          slug: categoryData.name.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-')
        };
        await category.save();
        categoriesCreated++;
        console.log(`✅ Catégorie créée: ${categoryData.name}`);
      }
    }
    
    if (categoriesCreated > 0) {
      console.log(`✅ ${categoriesCreated} catégories par défaut pour NIKI  Boutique créées avec succès`);
    } else {
      console.log('✅ Catégories par défaut NIKI  Boutique déjà existantes');
    }
  } catch (error) {
    console.error('❌ Erreur création catégories:', error.message);
  }
};

// --- Initialisation de la base de données ---
const initializeDatabase = async () => {
  try {
    await connectDB();
    console.log('✅ [OK] Connexion MongoDB réussie');
    
    // Créer l'admin et les catégories
    await createAdminUser();
    await createDefaultCategories();
    
  } catch (err) {
    console.error('❌ [ÉCHEC] Connexion MongoDB :', err.message);
    process.exit(1);
  }
};

// --- Lancement de l'initialisation ---
initializeDatabase();

// --- Création de l'application Express ---
const app = express();

// --- Configuration CORS ---
app.use(cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        'http://localhost:5173', 
        'http://localhost:3000', 
        'https://niki-boutique.vercel.app',
        process.env.CLIENT_URL
      ].filter(Boolean);
  
      if (!origin) return callback(null, true);
  
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Range', 'X-Content-Range']
  }));  

// --- Middleware ---
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- Fichiers statiques ---
app.use('/uploads', express.static('public/uploads'));

// --- Routes principales ---
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/uploads', uploadsRouter);
app.use('/api/users', usersRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/reviews', reviewsRouter);


// --- Route test simple ---
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend NIKI  Boutique connecté ✅',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// --- Route pour vérifier l'état de la base de données ---
app.get('/api/health', async (req, res) => {
  try {
    const Category = (await import('./models/Category.js')).default;
    const categoryCount = await Category.countDocuments();
    
    res.json({
      status: 'OK',
      database: 'Connected',
      categories: categoryCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Error',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// --- Route par défaut ---
app.get('/', (req, res) => {
  res.json({
    message: "Bienvenue sur l'API NIKI  Boutique E-commerce (Vêtements, Chaussures...) 🛍️", // Message mis à jour
    version: '1.0.0',
    status: 'Opérationnel',
    endpoints: {
      test: '/api/test',
      health: '/api/health',
      seed_categories: '/api/seed/categories (POST)',
      authentification: '/api/auth',
      produits: '/api/products',
      commandes: '/api/orders',
      catégories: '/api/categories',
      utilisateurs: '/api/users',
      uploads: '/api/uploads',
      avis: '/api/reviews'
    },
  });
});

// --- Middleware de gestion d'erreurs ---
app.use(errorHandler);

// --- Gestion des erreurs globales ---
process.on('unhandledRejection', (err) => {
  console.error('❌ Rejet de promesse non gérée :', err.message);
  console.error(err);
});

// --- Lancement du serveur ---
const PORT = process.env.PORT || 5000;

try {
  const server = app.listen(PORT, () => {
    console.log(`✅ [OK] Serveur NIKI  Boutique démarré en mode ${process.env.NODE_ENV || 'production'} sur le port ${PORT}`);
    console.log(`✅ CORS configuré pour: http://localhost:5173, http://localhost:3000`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
  });

  process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    server.close(() => console.log('✅ Serveur arrêté proprement'));
  });
} catch (error) {
  console.error('❌ [ÉCHEC] Impossible de démarrer le serveur :', error.message);
  process.exit(1);
}