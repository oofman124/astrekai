import { RunService } from "@rbxts/services";
import type { Entity } from "./entities/Entity";
import { Thread } from "../lib/Thread";

export interface EntitySearchParams {
	entityNameToIgnore?: string;
	additionalIgnoreList?: Array<Entity>;
}

const entities = new Array<Entity>();
let active = false;

export const EntityManager = {
	addEntity(entity: Entity): void {
		entities.push(entity);
	},

	removeEntity(entity: Entity): void {
		const index = entities.indexOf(entity);
		if (index >= 0) {
			entities.remove(index + 1);
		}
	},

	findNearestEntity(position: Vector3, range: number, params: EntitySearchParams): Entity | undefined {
		let nearestEntity: Entity | undefined;
		let shortestDistance = range;

		for (const entity of entities) {
			if (
				entity.name === params.entityNameToIgnore ||
				(params.additionalIgnoreList && params.additionalIgnoreList.includes(entity))
			) {
				continue;
			}

			const entityPosition = entity.getPosition();
			const distance = entityPosition.sub(position).Magnitude;
			if (distance <= range && distance < shortestDistance) {
				shortestDistance = distance;
				nearestEntity = entity;
			}
		}

		return nearestEntity;
	},

	findEntities(position: Vector3, range: number): Array<Entity> {
		const found = new Array<Entity>();
		for (const entity of entities) {
			const entityPosition = entity.getPosition();
			if (entityPosition.sub(position).Magnitude <= range) {
				found.push(entity);
			}
		}
		return found;
	},

	start(): void {
		active = true;
	},

	stop(): void {
		active = false;
	},

	toggleBrains(state: boolean): void {
		for (const entity of entities) {
			entity.getBrain().enabled = state;
		}
	},
};

Thread.createThread("Entity-Tick", 20, RunService.Heartbeat, (dt: number) => {
	if (active) {
		for (const entity of entities) {
			entity.update(dt);
		}
	}
});
