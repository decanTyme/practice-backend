const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const ActivitySchema = new Schema(
  {
    mode: { type: String, enum: ["add", "update", "delete"], required: true },
    path: { type: String, required: true },
    record: [
      {
        type: ObjectId,
        required: function () {
          return this.mode !== "add";
        },
      },
    ],
    reason: { type: String },
    user: { type: ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["pending", "success", "fail", "force", "revert"],
      default: "pending",
    },
    date: { type: Date, required: true },
  },
  {
    timestamps: true,
    strict: true,
    useNestedStrict: true,
  }
);

module.exports = mongoose.model("Activity", ActivitySchema);
