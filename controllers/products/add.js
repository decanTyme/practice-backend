const Activity = require("../../models/activity");
const Product = require("../../models/product");
const Variant = require("../../models/variant");

const productExistFilter = (data) => ({
  name: data.name,
  code: data.code,
  brand: data.brand,
});

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const addProducts = async (req, res) => {
  const {
    user: { sub: adminId },
    query: queries,
    body: data,
  } = req;

  // Check if data is empty
  if (Object.keys(data).length === 0)
    return res.status(400).json({
      success: false,
      message: "No product data was given.",
    });

  try {
    // In case the API user says the data is an array
    if (queries.batch || Array.isArray(data)) {
      const savedProducts = [];
      const existingProducts = [];
      const savedVariants = [];

      for (const item of data) {
        const product = await Product.findOne(productExistFilter(item));

        // If a product already exist, add it to the existing products
        // array and do not perform a save
        if (product) {
          await product.execPopulate({ path: "brand", select: { name: 1 } });

          existingProducts.push({
            brand: product.brand,
            code: product.code,
            name: product.name,
          });

          continue;
        }

        if (!item.variants || item.variants.length === 0)
          return res.status(404).json({
            message: `Please provide at least one product variant.`,
            success: false,
          });

        const savedProduct = await new Product(item).save();

        await savedProduct.execPopulate({
          path: "addedBy",
          select: { createdAt: 0, updatedAt: 0 },
          populate: { path: "user", select: populatedAddedByFilter },
        });

        await savedProduct.execPopulate({
          path: "updatedBy",
          select: { createdAt: 0, updatedAt: 0 },
          populate: { path: "user", select: populatedAddedByFilter },
        });

        for (const variant of item.variants) {
          const savedVariant = await new Variant({
            ...variant,
            product: savedProduct._id,
          }).save();

          await savedVariant.execPopulate({
            path: "addedBy",
            select: { createdAt: 0, updatedAt: 0 },
            populate: { path: "user", select: populatedAddedByFilter },
          });

          await savedVariant.execPopulate({
            path: "updatedBy",
            select: { createdAt: 0, updatedAt: 0 },
            populate: { path: "user", select: populatedAddedByFilter },
          });

          savedVariants.push(savedVariant);
        }

        savedProduct.variants = savedVariants;
        savedProducts.push(savedProduct);
      }

      if (savedProducts.length === 0)
        return res.status(304).json({
          existing: existingProducts,
          success: false,
          message: "No new products were saved because they already exist.",
        });

      const savedActivity = await new Activity({
        mode: "add",
        path: req.originalUrl,
        record: [
          ...savedVariants.map(({ _id }) => _id),
          ...savedProducts.map(({ _id }) => _id),
        ],
        user: adminId,
        status: "success",
        date: new Date().toISOString(),
      }).save();

      await savedActivity.execPopulate({
        path: "user",
        select: populatedAddedByFilter,
      });

      if (existingProducts.length !== 0)
        return res.status(201).json({
          saved: savedProducts,
          existing: existingProducts,
          activityRecord: savedActivity,
          success: true,
          message: `Some products were not saved because they already exist: ${existingProducts
            .map(({ brand, code, name }) => `${brand.name} ${name} [${code}]`)
            .join(", ")}`,
        });

      return res.status(201).json({
        saved: savedProducts,
        success: true,
        activityRecord: savedActivity,
        message: "Successfully added the products.",
      });
    }

    // If the product already exists, do not perform a save
    // and notify the user
    const product = await Product.findOne(productExistFilter(data));

    if (product) {
      await product.execPopulate({
        path: "brand",
        select: { name: 1 },
      });

      return res.status(204).json({
        message: `Product "${product.brand.name} ${product.name}" with serial number "${product.code}" already exists.`,
        success: false,
      });
    }

    if (!data.variants || data.variants.length === 0)
      return res.status(404).json({
        message: `Please provide at least one product variant.`,
        success: false,
      });

    const savedProduct = await new Product(data).save();

    const savedVariantIds = [];
    for (const variant of data.variants) {
      const savedVariant = await new Variant({
        ...variant,
        product: savedProduct._id,
      }).save();

      await savedVariant.execPopulate({
        path: "addedBy",
        select: { createdAt: 0, updatedAt: 0 },
        populate: { path: "user", select: populatedAddedByFilter },
      });

      await savedVariant.execPopulate({
        path: "updatedBy",
        select: { createdAt: 0, updatedAt: 0 },
        populate: { path: "user", select: populatedAddedByFilter },
      });

      savedVariantIds.push(savedVariant._id);
    }

    await savedProduct.execPopulate({
      path: "variants",
      populate: {
        path: "stocks",
      },
    });

    await savedProduct.execPopulate({
      path: "brand",
      select: { name: 1 },
    });

    await savedProduct.execPopulate({
      path: "addedBy",
      select: { createdAt: 0, updatedAt: 0 },
      populate: { path: "user", select: populatedAddedByFilter },
    });

    await savedProduct.execPopulate({
      path: "updatedBy",
      select: { createdAt: 0, updatedAt: 0 },
      populate: { path: "user", select: populatedAddedByFilter },
    });

    const savedActivity = await new Activity({
      mode: "add",
      path: req.originalUrl,
      record: [...savedVariantIds, savedProduct._id],
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    return res.status(201).json({
      product: savedProduct,
      activityRecord: savedActivity,
      success: true,
      message: `Successfully created the product "${savedProduct.brand.name} ${data.name}".`,
    });
  } catch (error) {
    console.log("Error", error);

    const savedActivity = await new Activity({
      mode: "add",
      path: req.originalUrl,
      reason: error.message,
      user: adminId,
      status: "fail",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    if (error instanceof TypeError)
      return res.status(500).json({
        error: JSON.stringify(error),
        activityRecord: savedActivity,
        message: "There was an error in saving the product.",
      });

    // if (error instanceof CastError)
    //   return res.status(500).json({
    //     error: `${error.name}: ${error.message}`,
    //     message: "There was an error in adding the stock to the product.",
    //   });

    return res.status(500).json({
      error: JSON.stringify(error),
      activityRecord: savedActivity,
      message: "There was an error in saving the product.",
    });
  }
};

module.exports = addProducts;
