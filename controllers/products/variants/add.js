const Product = require("../../../models/product");
const Variant = require("../../../models/variant");

const addVariant = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
    body: data,
  } = req;

  if (!queries._id)
    return res.status(400).json({
      success: false,
      message: "No product id was given.",
    });

  const product = await Product.findOne({ _id: queries._id });

  if (!product)
    return res.status(404).json({
      message: `Product with ID "${queries._id}" does not exist.`,
      success: false,
    });

  const isExist = await Variant.exists({
    product: queries._id,
    name: data.name,
  });

  if (isExist)
    return res.status(200).json({
      message: `Variant "${data.name}" already exists on product "${product.brand} ${product.name}".`,
      success: false,
    });

  const savedVariant = await new Variant({
    ...data,
    product: queries._id,
    addedBy: adminId,
  }).save();

  // console.log(data, savedProduct);

  return res.status(201).json({
    variant: savedVariant,
    success: true,
  });
};

module.exports = addVariant;
