// Algorithm: CHOSEN STAT + 1D20 ROLL w/ STACKABLE ADVANTAGE, STACKABLE DISADVANTAGE, OR NEITHER

// let game, Dialog, ChatMessage, Roll, actor = {};

let dieSize = 20;

/*
 * Each attribute in UVG with a method to evaluate the current actor's values.
 */
const attributes = {
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

const advantageType = {
  none: { label: "None" },
  advantage: { label: "Advantage" },
  disadvantage: { label: "Disadvantage" },
}

/*
 * The values to be evaluated.
 */
let params = {};

/*
 * The raw results of the computation.
 */
let results = {};

/*
 * Entry point
 */
await chooseStat();

/*
 * Prompt the player for an attribute and then move on to advantage type selection.
 */
async function chooseStat() {
  let d = new Dialog({
    title: "Stat Test",
    content: "<p>Pick a stat</p>",
    buttons: Object.keys(attributes).map(
      x => ({
        icon: "",
        label: attributes[x].label,
        callback: async () => {
          params.stat = attributes[x];
          await chooseAdvantageType();
        }
      })),
    // todo default: stats[0].id,
    render: (html) => html.find(".dialog-button").css({ "flex-basis": "100px", "margin": "0 auto" }),
  })
  
  d.render(true);
}

/*
 * Prompt the player for advantage type and then move on to advantage stacking.
 */
async function chooseAdvantageType() {
  let d = new Dialog({
    title: `Checking ${params.stat.label}!`,
    content: "<p>Normal roll, advantage, or disadvantage?</p>",
    buttons: Object.keys(advantageType).map(
      x => ({
        icon: "",
        label: advantageType[x].label,
        callback: async () => {
          params.advantage = { type: advantageType[x] };
          await chooseAdvantageStacking();
        },
      })),
    // todo default: "normal",
  });

  d.render(true);
}

/*
 * Prompt the player for advantage stacking, if necessary, and then move on to rolling.
 */
async function chooseAdvantageStacking() {
  console.log(params);
  if (params.advantage.type !== advantageType.none) {
      let d = new Dialog({
        title: "Choose Roll Type",
        content: "<p>Roll Stacking?</p>",
        buttons: [1, 2, 3, 4, 5].map(
          x => ({
            icon: "",
            label: x,
            callback: async () => {
              params.advantage.depth = x;
              await calculate();
            },
          })),
        // todo default: rollTypes[0]["roll"],
        render: () => console.log("Rendering the roll type chooser dialog"),
      });

      d.render(true);
  }
  else await calculate();
}

async function calculate() {
  let advantageFormula = "";

  switch (params.advantage.type) {
    case advantageType.advantage:
      advantageFormula = "kh";
      break;
    case advantageType.disadvantage:
      advantageFormula = "kl";
  }

  let rollFormula = `${params.advantage.depth ?? 1}d${dieSize}${advantageFormula} + @attribute`;
  results.roll = new Roll(rollFormula, { attribute: params.stat.getCurrentValue() });
  await results.roll.evaluate();

  await display();
}

async function display() {
  console.log(params);
  console.log(results);

  const keptRoll = results.roll.dice[0].total;

  let bottomLine = "";
  switch (keptRoll) {
    case 1: 
      bottomLine = "<span style='color: red;'><b>FAILURE!</b></span>";
      break;
    case dieSize:
      bottomLine = "<span style='color: green;'><b>SUCCESS!</b></span>";
      break;
    default:
      bottomLine = results.roll.total;
  }

  let resultsHtml = `<i>${params.stat.label} check!</i><br/>
    <hr/>
    <b>${params.stat.label}:</b> ${params.stat.getCurrentValue()}<br/>
    <b>Formula:</b> ${results.roll.formula}<br/>
    <hr/>
    <b>Roll(s):</b> ${results.roll.dice[0].results.map(x => x.result).join(", ")}<br/>
    <b>Kept roll:</b> ${keptRoll}<br/>
    <hr/>
    <b>Result: ${bottomLine}</b>
  `;

  ChatMessage.create({
    user: game.user._id,
    speaker: ChatMessage.getSpeaker({ token: actor }),
    content: resultsHtml,
  });

  await results.roll.toMessage();
}