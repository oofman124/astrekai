import { Brain } from "../../core/Brain";
import { Sounds } from "../Sounds";
import { EntityManager } from "../EntityManager";

export interface EntityDesc {
	name: string;
	sounds: Record<string, string>;
	maxHealth: number;
	tags: Array<string>;
}

export class Entity {
	public name: string;
	public model: Model;
	public humanoid: Humanoid;
	public brain: Brain;
	public position: Vector3;
	public sounds: Record<string, string>;
	public sightRange = 60;
	public attackRange = 4;
	public wanderRange = 20;
	public meleeDamage = 20;
	private random = new Random();

	public constructor(name?: string, model?: Model, disableAnimate?: boolean) {
		this.name = name ?? "Entity";
		this.model = model ?? new Instance("Model");
		if (!disableAnimate) {
			// Hook in an animation module if needed.
		}

		let humanoid = this.model.FindFirstChildOfClass("Humanoid") as Humanoid | undefined;
		if (!humanoid) {
			humanoid = new Instance("Humanoid");
			humanoid.Parent = this.model;
		}
		this.humanoid = humanoid;
		this.sounds = {
			ambient: "entity.cow.ambient",
			hurt: "entity.generic.hurt",
			death: "entity.generic.death",
			attack: "entity.generic.attack",
		};

		this.brain = new Brain(this);
		this.position = this.model.GetPivot().Position;
	}

	public getRandom(): Random {
		return this.random;
	}

	public getBrain(): Brain {
		return this.brain;
	}

	public setPosition(newPosition: Vector3): void {
		this.position = newPosition;
		this.humanoid.MoveTo(newPosition);
	}

	public getPosition(): Vector3 {
		const rootPart = this.humanoid.RootPart;
		if (rootPart) {
			return rootPart.Position;
		}
		return this.position ?? new Vector3(1e20, 1e20, 1e20);
	}

	public takeDamage(amount: number): void {
		if (this.humanoid.Health > 0) {
			this.humanoid.TakeDamage(amount);
			if (this.humanoid.Health <= 0) {
				if (this.sounds.death) {
					this.playSound("death");
				}
				task.delay(3, () => this.destroy());
				return;
			}
			if (this.sounds.hurt) {
				this.playSound("hurt");
			}
		}
	}

	public playSound(soundName: string): void {
		const rootPart = this.model.PrimaryPart ?? this.humanoid.RootPart;
		if (rootPart) {
			const soundKey = this.sounds[soundName];
			if (soundKey) {
				Sounds.playSound(soundKey, rootPart);
			}
		}
	}

	public destroy(): void {
		this.brain.enabled = false;
		EntityManager.removeEntity(this);
		if (this.model) {
			this.model.Destroy();
		}
		for (const [key] of pairs(this)) {
			(this as Record<string, unknown>)[key as string] = undefined;
		}
	}

	public update(dt = 0): void {
		if (this.brain.enabled) {
			this.brain.update(dt);
		}
	}
}
