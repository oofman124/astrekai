import { SensorBase } from "../../core/SensorBase";
import type { Brain } from "../../core/Brain";
import type { Entity } from "../entities/Entity";
import { EntityManager } from "../EntityManager";

export class NearestEntitySensor extends SensorBase {
	public constructor() {
		super("NearestEntity");
	}

	public update(entity: Entity, brain: Brain): void {
		const params = {
			entityNameToIgnore: entity.name,
			additionalIgnoreList: [entity],
		};
		const target = EntityManager.findNearestEntity(entity.getPosition(), entity.sightRange, params);
		brain.setMemory("nearest_entity", target);
	}
}
