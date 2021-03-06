/*
 * Each attribute in UVG with a method to evaluate the current actor's values.
 */
window.attributes = {
  strength: {
    label: "Strength",
    getCurrentValue: () => {
      try {
        return game.user.character.data.data.attributes.STR_CURR.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`);
      }
    },
    getMaxValue: () => {
      try {
        return game.user.character.data.data.attributes.STR_FULL.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`);
      }
    },
  },
  endurance: {
    label: "Endurance",
    getCurrentValue: () => {
      try {
        return game.user.character.data.data.attributes.END_CURR.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`);
      }
    },
    getMaxValue: () => {
      try {
        return game.user.character.data.data.attributes.END_FULL.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`);
      }
    },
  },
  agility: {
    label: "Agility",
    getCurrentValue: () => {
      try {
        return game.user.character.data.data.attributes.AGI_CURR.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`);
      }
    },
    getMaxValue: () => {
      try {
        return game.user.character.data.data.attributes.AGI_FULL.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`);
      }
    },
  },
  charisma: {
    label: "Charisma",
    getCurrentValue: () => {
      try {
        return game.user.character.data.data.attributes.CHA_CURR.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`);
      }
    },
    getMaxValue: () => {
      try {
        return game.user.character.data.data.attributes.CHA_FULL.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`);
      }
    },
  },
  aura: {
    label: "Aura",
    getCurrentValue: () => {
      try {
        return game.user.character.data.data.attributes.AUR_CURR.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`);
      }
    },
    getMaxValue: () => {
      try {
        return game.user.character.data.data.attributes.AUR_FULL.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`);
      }
    },
  },
  thought: {
    label: "Thought",
    getCurrentValue: () => { 
      try {
        return game.user.character.data.data.attributes.THO_CURR.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`)
      }
    },
    getMaxValue: () => { 
      try {
        return game.user.character.data.data.attributes.THO_FULL.value;
      } catch (e) {
        console.error(e);
        alert(`${this.label} isn't set in your character sheet!`)
      }
    }
  }
}