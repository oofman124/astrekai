import { TaskBase } from "../../../core/TaskBase";
import type { Brain } from "../../../core/Brain";
import type { Entity } from "../../entities/Entity";

export class WanderTask extends TaskBase {
	private targetPosition?: Vector3;

	public constructor(priority = 0) {
		super("Wander", priority, 20);
	}

	public start(entity: Entity, brain: Brain): void {
		super.start(entity, brain);
		const origin = entity.getPosition();
		const offset = new Vector3(
			math.random(-entity.wanderRange, entity.wanderRange),
			0,
			math.random(-entity.wanderRange, entity.wanderRange),
		);
		this.targetPosition = origin.add(offset);
		entity.setPosition(this.targetPosition);
	}

	public tick(entity: Entity, brain: Brain, dt: number): void {
		super.tick(entity, brain, dt);
		this.complete(entity, brain);
	}

	public shouldRun(entity: Entity, brain: Brain): boolean {
		if (!super.shouldRun(entity, brain)) {
			return false;
		}
		const random = entity.getRandom();
		return random.NextInteger(1, 10) === 1;
	}
}
