import { TaskBase } from "../../../core/TaskBase";
import type { Brain } from "../../../core/Brain";
import type { Entity } from "../../entities/Entity";

export class LookAroundTask extends TaskBase {
	public constructor(priority = 0) {
		super("LookAround", priority, 20);
	}

	public shouldRun(entity: Entity, brain: Brain): boolean {
		if (!super.shouldRun(entity, brain)) {
			return false;
		}
		const random = entity.getRandom();
		return random.NextInteger(1, 8) === 1;
	}

	public start(entity: Entity, brain: Brain): void {
		super.start(entity, brain);
		entity.playSound("ambient");
	}

	public tick(entity: Entity, brain: Brain, dt: number): void {
		super.tick(entity, brain, dt);
		this.complete(entity, brain);
	}
}
