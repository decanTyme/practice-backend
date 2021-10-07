const Stock = require("../../models/stock");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const moveStocks = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
    body: data,
  } = req;

  console.log(req.path, queries, data);
  try {
    if (!queries._id)
      return res.status(400).json({
        success: false,
        message: "No stock ID was given.",
      });

    if (!queries._type)
      return res.status(400).json({
        success: false,
        message: "No move location indicated.",
      });

    const stock = await Stock.findById(queries._id);

    if (!stock)
      return res.status(404).json({
        message: `Stock with ID "${queries._id}" does not exist.`,
        success: false,
      });

    if (stock._type === queries._type)
      return res.status(200).json({
        message: `Stock with batch no. "${stock.batch}" is already in ${queries._type}.`,
        success: false,
      });

    // If it was moved from inbound to warehouse, it means the stock has
    // arrived, hence auto append an arrival date
    if (stock._type === "inbound" && queries._type === "warehouse")
      stock.arrivedOn = new Date().toISOString();

    stock._type = queries._type;
    stock.updatedBy.push({ user: adminId });

    const movedStock = await stock.save();

    await movedStock.execPopulate("addedBy", populatedAddedByFilter);

    if (!movedStock.populated("addedBy"))
      throw new Error("Could not populate some paths.");

    return res.status(200).json({
      moved: movedStock,
      message: `Stock with the batch no. "${stock.batch}" successfully moved to ${queries._type}.`,
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
      error: JSON.stringify(error) || error.message,
      message: "There was an error in saving the stock.",
    });
  }
};

module.exports = moveStocks;
