const sounds: Record<string, Array<number>> = {
	none: [1596383289],

	"entity.cow.ambient": [688110369, 138223429],
	"entity.cow.graze": [2885912310, 6748255118],

	"entity.zombie.ambient": [131138848, 131060210, 574999280],
	"entity.zombie.hurt": [149041017],
	"entity.zombie.death": [134059106],

	"entity.generic.attack": [8595980577, 9117969687, 9117969717],
	"entity.generic.hurt": [8153869934, 8456770847],
	"entity.generic.death": [6077690898],

	"entity.villager.ambient": [7036389387, 7036386692],
	"entity.villager.hurt": [71208710561069],
	"entity.villager.death": [3732358952],
};

export const Sounds = {
	sounds,
	playSound(sound: string | Array<number>, parent: Instance): Sound | undefined {
		const soundId = typeIs(sound, "string") ? sounds[sound] : sound;
		if (!soundId) {
			return undefined;
		}
		const soundInstance = new Instance("Sound");
		soundInstance.SoundId = `rbxassetid://${soundId[math.random(1, soundId.size()) - 1]}`;
		soundInstance.Parent = parent;
		soundInstance.Play();
		soundInstance.Ended.Connect(() => {
			soundInstance.Destroy();
		});
		return soundInstance;
	},
};
