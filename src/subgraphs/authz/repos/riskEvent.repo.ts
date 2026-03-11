import { injectable, inject } from "tsyringe"
import mongoose, { Model } from "mongoose"
import { TOKENS } from "@/shared/container/tokens"
import RiskEventModel, { RiskEvent, RiskEventDocument } from "../models/riskEvent.model"
import RiskEventEntity from "../domain/risk.event"

@injectable()
export default class RiskEventRepo {

  async create(event: RiskEventEntity) {

    const doc = await RiskEventModel.create({

      userId: new mongoose.Types.ObjectId(event.userId),

      eventType: event.type,

      eventData: event.eventData,

      ip: event.ip,

      userAgent: event.userAgent,

      deviceId: event.deviceId

    })

    return this.toEntity(doc)

  }

 toEntity(doc: any): RiskEventEntity {

  return {
  id: doc._id.toString(),

  userId: doc.userId.toString(),

  type: doc.eventType, // ← 这里改成 type

  eventData: doc.eventData,

  ip: doc.ip,

  userAgent: doc.userAgent,

  deviceId: doc.deviceId,

  createdAt: doc.createdAt,

  updatedAt: doc.updatedAt,
 
  Type: "",

}

}
}