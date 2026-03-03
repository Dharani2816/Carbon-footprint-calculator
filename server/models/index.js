const mongoose = require('mongoose');
const { connectMongo } = require('../config/mongo');

const baseTransform = (doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const toPlain = (doc) => {
  if (!doc) return null;
  if (doc.toObject) return doc.toObject();
  const { _id, __v, ...rest } = doc;
  return { id: _id?.toString(), ...rest };
};

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: baseTransform },
  toObject: { virtuals: true, transform: baseTransform }
});

const footprintSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  electricity_emission: { type: Number, default: 0 },
  transport_emission: { type: Number, default: 0 },
  diet_emission: { type: Number, default: 0 },
  lifestyle_emission: { type: Number, default: 0 },
  total_emission: { type: Number, default: 0 }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: baseTransform },
  toObject: { virtuals: true, transform: baseTransform }
});

const insightSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cacheKey: { type: String, required: true, index: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  meta: { type: mongoose.Schema.Types.Mixed }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: baseTransform },
  toObject: { virtuals: true, transform: baseTransform }
});

const UserModel = mongoose.model('User', userSchema);
const FootprintModel = mongoose.model('CarbonFootprint', footprintSchema);
const InsightModel = mongoose.model('AiInsight', insightSchema);

const User = {
  findOne: async ({ where }) => {
    const { email, id } = where || {};
    if (email) return toPlain(await UserModel.findOne({ email }));
    if (id) return toPlain(await UserModel.findById(id));
    return null;
  },
  create: async (data) => {
    const doc = await UserModel.create(data);
    return toPlain(doc);
  }
};

const CarbonFootprint = {
  create: async (data) => {
    const doc = await FootprintModel.create(data);
    return doc.toObject();
  },
  findAll: async ({ where, order }) => {
    const { user_id } = where || {};
    const sort = order && order[0][0] === 'createdAt' && order[0][1] === 'DESC' ? { createdAt: -1 } : {};
    const docs = await FootprintModel.find({ user_id }).sort(sort);
    return docs.map(toPlain);
  },
  findOne: async ({ where, order }) => {
    const { user_id } = where || {};
    const sort = order && order[0][0] === 'createdAt' && order[0][1] === 'DESC' ? { createdAt: -1 } : {};
    return toPlain(await FootprintModel.findOne({ user_id }).sort(sort));
  }
};

const AiInsight = {
  findByCacheKey: async (cacheKey) => toPlain(await InsightModel.findOne({ cacheKey })),
  create: async (data) => {
    const doc = await InsightModel.create(data);
    return toPlain(doc);
  }
};

const syncDatabase = async () => {
  await connectMongo();
};

module.exports = { User, CarbonFootprint, AiInsight, syncDatabase };