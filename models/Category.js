import mongoose from 'mongoose';

const categorySchema = mongoose.Schema(
  {
    // Nom de la catégorie
    name: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    // Description détaillée pour le SEO ou l'affichage
    description: String,
    // URL de l'image de la catégorie
    image: String,
    // Catégorie parente pour les sous-catégories
    parent: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Category' 
    },
    
    // MODIFICATION 1 : Type principal (Adapté aux vêtements)
    type: { 
      type: String, 
      enum: ['vetement_femme', 'vetement_enfant', 'chaussure', 'accessoire_mode'],
      required: true 
    },
    
    // MODIFICATION 2 : Filtres dynamiques spécifiques à cette catégorie/type
    filters: {
      // Matériaux des vêtements/chaussures
      materials: [String], 
      // Tailles (S, M, L, 38, 40, etc.)
      sizes: [String],
      // Couleurs
      colors: [String],
      // Marques (peut être géré globalement, mais utile ici pour le filtrage)
      brands: [String],
      // Types de coupe (Slim, Regular, A-Line, etc.)
      fits: [String],
      // Suppression des filtres spécifiques aux cheveux (textures, lengths, densities)
    },
    
    // Données d'optimisation pour les moteurs de recherche
    seo: {
      title: String,
      description: String,
      // Slug unique pour l'URL conviviale
      slug: { 
        type: String, 
        unique: true, 
        trim: true 
      }
    },
    // État d'activation de la catégorie
    isActive: { 
      type: Boolean, 
      default: true 
    },
    // Ordre d'affichage dans les menus
    order: { 
      type: Number, 
      default: 0 
    }
  },
  { 
    // Ajoute les champs createdAt et updatedAt
    timestamps: true 
  }
);
// Index composite pour l'efficacité des requêtes de tri et de filtrage
categorySchema.index({ type: 1, order: 1 });

const Category = mongoose.model('Category', categorySchema);

export default Category;