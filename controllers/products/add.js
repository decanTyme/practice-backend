const Product = require("../../models/product");
const Variant = require("../../models/variant");

const productExistFilter = (data) => ({
  name: data.name,
  code: data.code,
  brand: data.brand,
});

const addProducts = async (req, res) => {
  const {
    user: { id: adminId },
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

      for (const item of data) {
        const isExist = await Product.exists(productExistFilter(item));

        // If a product already exist, add it to the existing products
        // array and do not perform a save
        if (isExist) {
          existingProducts.push({
            brand: item.brand,
            name: item.name,
          });

          continue;
        }

        if (!item.variants || item.variants.length === 0)
          return res.status(404).json({
            message: `Please provide at least one product variant.`,
            success: false,
          });

        const savedProduct = await new Product({
          ...item,
          addedBy: adminId,
        }).save();

        const savedVariants = [];
        for (const variant of item.variants) {
          const savedVariant = await new Variant({
            ...variant,
            product: savedProduct._id,
            addedBy: adminId,
          }).save();
          savedVariants.push(savedVariant);
        }

        savedProduct.variants = savedVariants;
        savedProducts.push(savedProduct);
      }

      if (savedProducts.length === 0) {
        return res.status(200).json({
          existing: existingProducts,
          success: false,
          message: "No new products were saved.",
        });
      }

      if (existingProducts.length !== 0)
        return res.status(201).json({
          saved: savedProducts,
          existing: existingProducts,
          success: true,
          message: "Some products were not saved because they already exist.",
        });

      return res.status(201).json({
        saved: savedProducts,
        success: true,
        message: "Successfully added the products.",
      });
    }

    // If the product already exists, do not perform a save
    // and notify the user
    const isExist = await Product.exists(productExistFilter(data));

    if (isExist)
      return res.status(200).json({
        message: `Product "${data.brand} ${data.name}" already exists.`,
        success: false,
      });

    const savedProduct = await new Product({
      ...data,
      addedBy: adminId,
    }).save();

    return res.status(201).json({
      product: savedProduct,
      success: true,
    });
  } catch (error) {
    console.log("Error", error);

    if (error instanceof TypeError)
      return res.status(500).json({
        error: JSON.stringify(error),
        message: "There was an error in saving the product.",
      });

    // if (error instanceof CastError)
    //   return res.status(500).json({
    //     error: `${error.name}: ${error.message}`,
    //     message: "There was an error in adding the stock to the product.",
    //   });

    return res.status(500).json({
      error: JSON.stringify(error),
      message: "There was an error in saving the product.",
    });
  }
};

module.exports = addProducts;
