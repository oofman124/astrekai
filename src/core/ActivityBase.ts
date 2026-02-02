import type { Brain } from "./Brain";
import type { TaskBase } from "./TaskBase";

export interface Activity {
	shouldRun(brain: Brain): boolean;
	start(entity: unknown, brain: Brain): void;
	tick(entity: unknown, brain: Brain, dt: number): void;
	stop(entity: unknown, brain: Brain): void;
}

export class ActivityBase implements Activity {
	public readonly name: string;
	public readonly tasks = new Array<TaskBase>();
	public currentTask?: TaskBase;
	public ticksActive = 0;
	public readonly memReqPresent?: Array<string>;
	public readonly memReqAbsent?: Array<string>;

	public constructor(name: string, memPresent?: Array<string>, memAbsent?: Array<string>) {
		this.name = name;
		this.memReqPresent = memPresent;
		this.memReqAbsent = memAbsent;
	}

	private memOK(brain: Brain): boolean {
		if (this.memReqPresent) {
			for (const key of this.memReqPresent) {
				if (brain.getMemory(key) === undefined) {
					return false;
				}
			}
		}

		if (this.memReqAbsent) {
			for (const key of this.memReqAbsent) {
				if (brain.getMemory(key) !== undefined) {
					return false;
				}
			}
		}

		return true;
	}

	public addTask(task: TaskBase): void {
        this.tasks.push(task);
        // Use boolean comparator (roblox-ts/Luau Array.sort expects boolean)
        this.tasks.sort((a, b) => a.priority > b.priority);
    }

	public shouldRun(brain: Brain): boolean {
		return this.memOK(brain);
	}

	public start(_entity: unknown, _brain: Brain): void {
		this.ticksActive = 0;
	}

	public tick(entity: unknown, brain: Brain, _dt: number): void {
		this.ticksActive += 1;

		let chosen: TaskBase | undefined;
		for (const task of this.tasks) {
			if (task.shouldRun(entity, brain)) {
				chosen = task;
				break;
			}
		}

		if (chosen !== this.currentTask) {
			if (this.currentTask) {
				this.currentTask.stop(entity, brain);
			}
			if (chosen) {
				chosen.reset();
				chosen.start(entity, brain);
			}
			this.currentTask = chosen;
		}

		if (this.currentTask && this.currentTask.status === "RUNNING") {
			this.currentTask.tick(entity, brain, _dt);
			if (this.currentTask.isFinished()) {
				this.currentTask.stop(entity, brain);
				this.currentTask = undefined;
			}
		}
	}

	public stop(entity: unknown, brain: Brain): void {
		if (this.currentTask) {
			this.currentTask.stop(entity, brain);
		}
		this.currentTask = undefined;
		this.ticksActive = 0;
	}
}

export type ActivityType = Activity;
