import { Entity } from "./Entity";

export class Npc extends Entity {
	public constructor(name?: string, model?: Model) {
		super(name ?? "Npc", model);
		this.sounds.ambient = "entity.cow.ambient";
	}
}
