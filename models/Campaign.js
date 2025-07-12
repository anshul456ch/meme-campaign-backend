const mongoose = require('mongoose');
const { Schema } = mongoose;

const campaignSchema = new Schema(
  {
    brandName: { type: String, required: true },
    campaignName: { type: String, required: true },
    campaignManager: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    salesPerson: { type: String },
    startDate: { type: Date },
    pageCount: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);
