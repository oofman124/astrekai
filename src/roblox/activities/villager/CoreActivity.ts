import { ActivityBase } from "../../../core/ActivityBase";
import { LookAroundTask } from "../../tasks/generic/LookAround";

export class CoreActivity extends ActivityBase {
	public constructor() {
		super("Core");
		this.addTask(new LookAroundTask(1));
	}

	public shouldRun(): boolean {
		return true;
	}
}
