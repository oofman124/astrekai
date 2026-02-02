import { Entity } from "./Entity";
import { CoreActivity } from "../activities/villager/CoreActivity";
import { IdleActivity } from "../activities/villager/IdleActivity";

export class Villager extends Entity {
	public constructor(name?: string, model?: Model) {
		super(name ?? "Villager", model);
		this.sounds = {
			ambient: "entity.villager.ambient",
			hurt: "entity.villager.hurt",
			death: "entity.villager.death",
			attack: "entity.generic.attack",
		};

		this.brain.addActivity("Core", new CoreActivity());
		this.brain.addActivity("Idle", new IdleActivity());
	}
}
