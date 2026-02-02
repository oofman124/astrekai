import type { Brain } from "./Brain";

export type Status = "IDLE" | "RUNNING" | "STOPPED" | "COMPLETE";
export type StepResult = "AGAIN" | "COMPLETE" | "REDO" | "FAILED";



export class TaskBase {
	public readonly name: string;
	public readonly priority: number;
	public status: Status = "IDLE";
	public ticksRunning = 0;
	public cooldownTicks: number;
	private nextAvailableTick = 0;
	public readonly memReqPresent?: Array<string>;
	public readonly memReqAbsent?: Array<string>;

	public constructor(
		name = "UnnamedTask",
		priority = 0,
		cooldownTicks = 0,
		memReqPresent?: Array<string>,
		memReqAbsent?: Array<string>,
	) {
		this.name = name;
		this.priority = priority;
		this.cooldownTicks = cooldownTicks;
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

	public shouldRun(_entity: unknown, brain: Brain): boolean {
		if (brain.getTick() < this.nextAvailableTick) {
			return false;
		}
		return this.memRequirementsMet(brain);
	}

	public start(_entity: unknown, _brain: Brain): void {
		this.status = "RUNNING";
		this.ticksRunning = 0;
	}

	public tick(_entity: unknown, _brain: Brain, _dt: number): void {
		this.ticksRunning += 1;
	}

	public stop(_entity: unknown, brain: Brain): void {
		this.status = "STOPPED";
		this.nextAvailableTick = brain.getTick() + this.cooldownTicks;
	}

	public complete(_entity: unknown, brain: Brain): void {
		this.status = "COMPLETE";
		this.nextAvailableTick = brain.getTick() + this.cooldownTicks;
		this.ticksRunning = 0;
	}

	public isFinished(): boolean {
		return this.status !== "RUNNING";
	}

	public reset(): void {
		this.status = "IDLE";
		this.ticksRunning = 0;
	}
}
