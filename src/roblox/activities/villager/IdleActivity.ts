import { ActivityBase } from "../../../core/ActivityBase";
import { WanderTask } from "../../tasks/generic/Wander";

export class IdleActivity extends ActivityBase {
	public constructor() {
		super("Idle");
		this.addTask(new WanderTask(1));
	}

	public shouldRun(): boolean {
		return true;
	}
}
