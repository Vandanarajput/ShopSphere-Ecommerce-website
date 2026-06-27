const Product = require('../models/Product');
const { success, failure } = require('../utils/apiResponse');
const slugify = require('../utils/slugify');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');
const cloudinary = require('../config/cloudinary');

// GET /api/products  — public listing with search/filter/sort/paginate (doc §10.3)
async function getProducts(req, res, next) {
  try {
    const {
      search, category, brand,
      minPrice, maxPrice, inStock,
      sort = '-createdAt',
      page = 1, limit = 12,
    } = req.query;

    const query = { isActive: true };

    if (search) query.$text = { $search: search };
    if (category) query.category = category;
    if (brand) query.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (inStock === 'true') query.stock = { $gt: 0 };

    const sortMap = {
      '-createdAt': { createdAt: -1 },
      'price': { price: 1 },
      '-price': { price: -1 },
      '-ratingAverage': { ratingAverage: -1 },
    };
    const sortBy = sortMap[sort] || { createdAt: -1 };

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('category', 'name slug')
        .sort(sortBy)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json(
      success('Products fetched.', {
        products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      })
    );
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:id  — by ObjectId or slug
async function getProductById(req, res, next) {
  try {
    const { id } = req.params;
    const filter = { isActive: true };

    // Support both ObjectId and slug lookups
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      filter._id = id;
    } else {
      filter.slug = id;
    }

    const product = await Product.findOne(filter)
      .populate('category', 'name slug')
      .lean();

    if (!product) return res.status(404).json(failure('Product not found.'));
    res.json(success('Product fetched.', { product }));
  } catch (err) {
    next(err);
  }
}

// POST /api/products  — admin create
async function createProduct(req, res, next) {
  try {
    const { name, description, price, mrp, category, brand, stock } = req.body;

    if (!name || !description || !category || !brand) {
      return res.status(400).json(failure('Name, description, category, and brand are required.'));
    }

    const parsedPrice = parseFloat(price);
    const parsedMrp = parseFloat(mrp || price);
    const parsedStock = parseInt(stock || 0);

    if (isNaN(parsedPrice) || parsedPrice <= 0) return res.status(400).json(failure('Price must be a positive number.'));
    if (parsedStock < 0) return res.status(400).json(failure('Stock cannot be negative.'));

    let slug = slugify(name);
    const existing = await Product.findOne({ slug });
    if (existing) slug = `${slug}-${Date.now()}`;

    // Upload images to Cloudinary if provided
    const images = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, 'shopsphere/products');
        images.push({ url: result.secure_url, publicId: result.public_id });
      }
    }

    const product = await Product.create({
      name, slug, description,
      price: parsedPrice, mrp: parsedMrp,
      category, brand,
      stock: parsedStock,
      images,
      createdBy: req.user._id,
    });

    res.status(201).json(success('Product created.', { product }));
  } catch (err) {
    next(err);
  }
}

// PUT /api/products/:id  — admin update
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json(failure('Product not found.'));

    const allowed = ['name', 'description', 'price', 'mrp', 'category', 'brand', 'stock', 'isActive'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    // Regenerate the slug only if the name actually changed, and append a
    // timestamp suffix if another product already owns that slug (prevents
    // E11000 duplicate-key errors when two products share the same name).
    if (req.body.name) {
      const newSlug = slugify(req.body.name);
      if (newSlug !== product.slug) {
        const clash = await Product.findOne({ slug: newSlug, _id: { $ne: product._id } });
        product.slug = clash ? `${newSlug}-${Date.now()}` : newSlug;
      }
    }

    await product.save();
    res.json(success('Product updated.', { product }));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id  — admin soft-delete
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) return res.status(404).json(failure('Product not found.'));
    res.json(success('Product deactivated.'));
  } catch (err) {
    next(err);
  }
}

// POST /api/products/:id/images  — admin upload additional images
async function uploadProductImages(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json(failure('Product not found.'));
    if (!req.files || req.files.length === 0) return res.status(400).json(failure('No images provided.'));

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, 'shopsphere/products');
      product.images.push({ url: result.secure_url, publicId: result.public_id });
    }
    await product.save();

    res.json(success('Images uploaded.', { images: product.images }));
  } catch (err) {
    next(err);
  }
}

// DELETE /api/products/:id/images  — admin delete one image
async function deleteProductImage(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json(failure('Product not found.'));

    const { publicId } = req.body;
    if (!publicId) return res.status(400).json(failure('publicId is required.'));

    await cloudinary.uploader.destroy(publicId);
    product.images = product.images.filter((img) => img.publicId !== publicId);
    await product.save();

    res.json(success('Image deleted.', { images: product.images }));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getProducts, getProductById,
  createProduct, updateProduct, deleteProduct,
  uploadProductImages, deleteProductImage,
};
