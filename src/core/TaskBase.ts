import type { Brain } from "./Brain";

export type Status = "IDLE" | "RUNNING" | "STOPPED" | "COMPLETE";
export type CallbackResult = "CONTINUE" | "COMPLETE" | "REDO" | "FAILED";

export interface TaskState {
	status: Status;
	ticksRunning: number;
	nextAvailableTick: number;
}

export interface TaskCallback {
	(
		entity: unknown,
		brain: Brain | undefined,
		task: TaskBase,
		state: TaskState,
		...args: unknown[]
	): CallbackResult | undefined;
}


export class TaskBase {
	public readonly name: string;
	public readonly priority: number;
	public status: Status = "IDLE";
	public ticksRunning = 0;
	public cooldownTicks: number;
	private nextAvailableTick = 0;
	public readonly memReqPresent?: Array<string>;
	public readonly memReqAbsent?: Array<string>;

	private readonly onStartCallback?: TaskCallback;
	private readonly onTickCallback?: TaskCallback;
	private readonly onStopCallback?: TaskCallback;
	private readonly onCompleteCallback?: TaskCallback;
	private readonly onResetCallback?: TaskCallback;

	public constructor(
		name = "UnnamedTask",
		priority = 0,
		cooldownTicks = 0,
		memReqPresent?: Array<string>,
		memReqAbsent?: Array<string>,
		onStartCallback?: TaskCallback,
		onTickCallback?: TaskCallback,
		onStopCallback?: TaskCallback,
		onCompleteCallback?: TaskCallback,
		onResetCallback?: TaskCallback,
	) {
		this.name = name;
		this.priority = priority;
		this.cooldownTicks = cooldownTicks;
		this.onStartCallback = onStartCallback;
		this.onTickCallback = onTickCallback;
		this.onStopCallback = onStopCallback;
		this.onCompleteCallback = onCompleteCallback;
		this.onResetCallback = onResetCallback;
		this.memReqPresent = memReqPresent;
		this.memReqAbsent = memReqAbsent;
	}

	private memRequirementsMet(brain: Brain): boolean {
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

	public getState(): TaskState {
		return {
			status: this.status,
			ticksRunning: this.ticksRunning,
			nextAvailableTick: this.nextAvailableTick,
		};
	}

	public shouldRun(_entity: unknown, brain: Brain): boolean {
		if (brain.getTick() < this.nextAvailableTick) {
			return false;
		}
		return this.memRequirementsMet(brain);
	}

	public start(_entity: unknown, _brain: Brain): void {
		this.status = "RUNNING";
		this.ticksRunning = 0;
		if (this.onStartCallback) {
			this.onStartCallback(_entity, _brain, this, this.getState());
		}
	}

	public tick(_entity: unknown, _brain: Brain, _dt: number): void {
		this.ticksRunning += 1;
		if (this.onTickCallback) {
			const result = this.onTickCallback(_entity, _brain, this, this.getState());
			switch (result) {
				case "CONTINUE":
					break;
				case "COMPLETE":
					this.complete(_entity, _brain);
					break;
				case "FAILED":
					this.stop(_entity, _brain);
					break;
				case "REDO":
					this.reset();
					this.start(_entity, _brain);
					break;
			}
		}
	}

	public stop(_entity: unknown, brain: Brain): void {
		this.status = "STOPPED";
		this.nextAvailableTick = brain.getTick() + this.cooldownTicks;
		if (this.onStopCallback) {
			this.onStopCallback(_entity, brain, this, this.getState());
		}
	}

	public complete(_entity: unknown, brain: Brain): void {
		this.status = "COMPLETE";
		this.nextAvailableTick = brain.getTick() + this.cooldownTicks;
		this.ticksRunning = 0;
		if (this.onCompleteCallback) {
			this.onCompleteCallback(_entity, brain, this, this.getState());
		}
	}

	public isFinished(): boolean {
		return this.status !== "RUNNING";
	}

	public reset(): void {
		this.status = "IDLE";
		this.ticksRunning = 0;
		if (this.onResetCallback) {
			this.onResetCallback(undefined, undefined, this, this.getState());
		}
	}
}
