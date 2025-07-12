const mongoose = require('mongoose');
const { Schema } = mongoose;

const executionSchema = new Schema(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: 'Campaign', required: true },
    executionPerson: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    roundNumber: { type: Number, required: true },
    date: { type: Date, required: true },
    addedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: {
      type: String,
      enum: ['draft', 'submitted'],
      default: 'draft'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Execution', executionSchema);
