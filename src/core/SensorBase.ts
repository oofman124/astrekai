import type { Brain } from "./Brain";

export interface Sensor {
	update(entity: unknown, brain: Brain): void;
}

export class SensorBase implements Sensor {
	public readonly name: string;

	public constructor(name: string) {
		assert(name !== "", "Sensor must have a name.");
		this.name = name;
	}

	public update(_entity: unknown, _brain: Brain): void {
		warn(`[SensorBase] update() not implemented for ${this.name}`);
	}
}
