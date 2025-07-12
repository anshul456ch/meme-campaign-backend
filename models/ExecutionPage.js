const mongoose = require('mongoose');
const { Schema } = mongoose;

const executionPageSchema = new Schema(
  {
    executionId: { type: Schema.Types.ObjectId, ref: 'Execution', required: true },
    pageName: { type: String, required: true },
    groupName: String,
    category: String,
    status: {
      type: String,
      enum: ['found', 'not found', 'replaced', 'deleted'],
      default: 'found'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExecutionPage', executionPageSchema);
