import mongoose from 'mongoose'
import User from './user'
import Stage from './stage'
import StageInstance from './stageInstance'

const GameInstanceSchema = mongoose.Schema({
  game: { type: mongoose.Schema.Types.ObjectId, ref: 'Games', required: true },
  team: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Users' }],
  score: { type: Number, default: 0 },
  stages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Stages' }],
  finalized: { type: Boolean, default: false },
  conductor: { type: mongoose.Schema.Types.ObjectId, ref: 'Users', required: true },
})

// after save, create respective stageInstances and add this gameInstance to the users
GameInstanceSchema.post('save', (gameInstance, next) => {
  User.update(
    { $or: gameInstance.team.map(member => { return { _id: member } }).concat({ _id: gameInstance.conductor }) },
    { '$push': { 'gamesInProgress': gameInstance } },
    { multi: true },
    (errUsers, users) => {
      if (errUsers) { return next(errUsers) }
      const stageInstances = gameInstance.stages.map(stage => {
        return new StageInstance({
          gameInstance,
          stage,
        })
      })
      StageInstance.create(stageInstances, (errStageInstance, stageInstances) => {
        if (errStageInstance) { return next(errStageInstance) }
        next()
      })
    }
  )
})

const GameInstance = mongoose.model('GameInstance', GameInstanceSchema)

export default GameInstance
