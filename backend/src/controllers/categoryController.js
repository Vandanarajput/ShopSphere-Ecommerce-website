const Category = require('../models/Category');
const { success, failure } = require('../utils/apiResponse');
const slugify = require('../utils/slugify');

async function getCategories(req, res, next) {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 });
    res.json(success('Categories fetched.', { categories }));
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name, parentCategory, image } = req.body;
    if (!name) return res.status(400).json(failure('Name is required.'));

    const slug = slugify(name);
    const existing = await Category.findOne({ slug });
    if (existing) return res.status(409).json(failure('Category with this name already exists.'));

    const category = await Category.create({
      name,
      slug,
      parentCategory: parentCategory || null,
      image: image || '',
    });
    res.status(201).json(success('Category created.', { category }));
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json(failure('Category not found.'));
    res.json(success('Category updated.', { category }));
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!category) return res.status(404).json(failure('Category not found.'));
    res.json(success('Category deactivated.'));
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
