// Algorithm: CHOSEN STAT + ROLL w/ STACKABLE ADVANTAGE, STACKABLE DISADVANTAGE, OR NEITHER

if (!window.attributes) {
  $.getScript("https://cdn.jsdelivr.net/gh/jcmcmaster/uvg-macros/api/attributeApi.js", () => {
    chooseStat();
  });
} else {
  chooseStat();
}

/*
 * Configure size of die to roll here.
 */
const dieSize = 20;

/*
 * Defines possible advantage types, including "none".
 */
const advantageType = {
  none: { label: "None" },
  advantage: { label: "Advantage" },
  disadvantage: { label: "Disadvantage" },
}

/*
 * The values to be evaluated. Built out by dialog prompts.
 */
const params = {};

/*
 * The raw results of the computation.
 */
const results = {};

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
  });

  d.render(true);
}

/*
 * Prompt the player for advantage stacking, if necessary, and then move on to rolling.
 */
async function chooseAdvantageStacking() {
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
      });

      d.render(true);
  }
  else await calculate();
}

/*
 * The parameters have been fully established. Roll the dice, then calculate and store the results.
 */
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

/*
 * The calculations are complete. Display the results.
 */
async function display() {
  const keptRoll = results.roll.dice[0].total;

  let rollSection = "";
  if (results.roll.dice[0].results.length === 1) {
    rollSection = `<b>Roll:</b> ${keptRoll}`;
  } else {
    rollSection = `<b>Rolls:</b> ${results.roll.dice[0].results.map(x => x.result).join(", ")}<br/>
      <b>Kept roll:</b> ${keptRoll}<br/>`
  }

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
    ${rollSection}
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