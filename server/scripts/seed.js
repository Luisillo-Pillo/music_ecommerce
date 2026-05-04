require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const catalog = require('./seedCatalog');

/** Etiquetas para fotos reales (Flickr CC vía loremflickr); lock distinto = imagen distinta. */
const FLICKR_TAGS = {
  'Guitarras y bajos': 'electric,guitar',
  'Teclados y pianos': 'piano,keyboard',
  'Batería y percusión': 'drums,drumkit',
  'Instrumentos de viento': 'saxophone,trumpet',
  'Cuerdas clásicas': 'violin,cello',
  'Audio en vivo': 'concert,speaker',
  'Estudio y grabación': 'recording,studio',
  'DJ y producción': 'dj,decks',
  Accesorios: 'music,studio',
  Micrófonos: 'microphone,singer',
};

function imageUrl(row, index) {
  const tag = FLICKR_TAGS[row.category] || 'musical,instrument';
  const lock = 90000 + index;
  return `https://loremflickr.com/800/800/${encodeURIComponent(tag)}/all?lock=${lock}`;
}

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Define MONGODB_URI');
    process.exit(1);
  }
  if (!Array.isArray(catalog) || catalog.length < 100) {
    console.error('seedCatalog debe exportar un arreglo con al menos 100 productos');
    process.exit(1);
  }

  await mongoose.connect(uri);
  await Product.deleteMany({});

  const docs = catalog.slice(0, 100).map((row, i) => ({
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    stock: row.stock,
    description: row.description,
    featured: i < 12,
    image: imageUrl(row, i),
  }));

  await Product.insertMany(docs);
  console.log('Seed: 100 productos reales insertados (12 destacados). Imágenes únicas por producto.');
  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
