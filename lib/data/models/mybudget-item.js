import mongoose from 'mongoose'
import debug from 'debug'

const log = debug('presupuesto:data:models:mybudget')
let Schema = mongoose.Schema;
let ObjectId = Schema.ObjectId;

let MyBudgetItemSchema = new Schema({
  category: { type: ObjectId, ref: 'Category'},
  amount: { type: Number }
})

log('MyBudgetItem model initialized')

export default mongoose.model('MyBudgetItem', MyBudgetItemSchema)
