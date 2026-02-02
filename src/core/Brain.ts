import type { Sensor } from "./SensorBase";
import type { Activity } from "./ActivityBase";

export interface BrainOwner {
	readonly name?: string;
}

export class Brain {
	public enabled = true;
	private owner: BrainOwner;
	private tickCount = 0;
	private memories = new Map<string, unknown>();
	private sensors = new Array<Sensor>();
	private activities = new Map<string, Activity>();
	private activeActivities = new Map<string, Activity>();

	public constructor(owner: BrainOwner) {
		this.owner = owner;
	}

	public addSensor(sensor: Sensor): void {
		this.sensors.push(sensor);
	}

	public addActivity(name: string, activity: Activity): void {
		this.activities.set(name, activity);
	}

	public setMemory(key: string, value: unknown): void {
		this.memories.set(key, value);
	}

	public getMemory<T = unknown>(key: string): T | undefined {
		return this.memories.get(key) as T | undefined;
	}

	public getTick(): number {
		return this.tickCount;
	}

	public update(dt: number): void {
		if (!this.enabled) {
			return;
		}

		this.tickCount += 1;

		for (const sensor of this.sensors) {
			sensor.update(this.owner, this);
		}

		for (const [name, activity] of this.activities) {
			const isRunning = this.activeActivities.has(name);
			if (activity.shouldRun(this)) {
				if (!isRunning) {
					activity.start(this.owner, this);
					this.activeActivities.set(name, activity);
				}
			} else if (isRunning) {
				activity.stop(this.owner, this);
				this.activeActivities.delete(name);
			}
		}

		for (const [, activity] of this.activeActivities) {
			activity.tick(this.owner, this, dt);
		}
	}
}

export type BrainType = Brain;
