const Courier = require("../../models/courier");

const addCouriers = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
    body: data,
  } = req;

  try {
    const isExist = await Courier.exists({
      name: data.name,
    });

    if (isExist)
      return res.status(200).json({
        message: `Courier "${data.name}" already exists.`,
        success: false,
      });

    const savedCourier = await new Courier({
      ...data,
      addedBy: adminId,
    }).save();

    return res.status(200).json({
      courier: savedCourier,
      success: true,
    });
  } catch (error) {
    console.log("Error", error);

    if (error instanceof TypeError)
      return res.status(500).json({
        error: `${error.name}: ${error.message}`,
        message: "There was an error in saving the stock.",
      });

    return res.status(500).json({
      error: `${error.name}: ${error.message}`,
      message: "There was an error in fetching the stock.",
    });
  }
};

module.exports = addCouriers;
