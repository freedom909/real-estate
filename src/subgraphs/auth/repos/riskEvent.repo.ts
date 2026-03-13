import { injectable, inject } from "tsyringe"
import mongoose, { Model } from "mongoose"
import { TOKENS } from "@/shared/container/tokens"

import  {  RiskEventModel } from "../models/riskEvent.model"
import { hash } from "@/utils/hash"
import RiskEventEntity from "../domain/risk.event"

export class RiskEventRepo {

  constructor(
    private model: Model<RiskEventModel>
  ) {}

  async create(data: Partial<RiskEventModel>) {

    const doc = await this.model.create({

      userId: new mongoose.Types.ObjectId(data.userId),

      eventType: data.eventData.type,

      eventData: data.eventData.data,

      ip: hash(data.ip),

      userAgent: hash(data.userAgent),

      deviceId: data.deviceId

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