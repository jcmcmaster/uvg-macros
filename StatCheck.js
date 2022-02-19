// Basic UVG stat test
// Uses selected stat from PDF char sheet and macro should not need modified

let stats = undefined;
try {
  stats = [
    {
      stat: "strength",
      label: "Strength",
      field: game.user.character.data.data.attributes.STR_CURR.value,
    },
    {
      stat: "endurance",
      label: "Endurance",
      field: game.user.character.data.data.attributes.END_CURR.value,
    },
    {
      stat: "agility",
      label: "Agility",
      field: game.user.character.data.data.attributes.AGI_CURR.value,
    },
    {
      stat: "charisma",
      label: "Charisma",
      field: game.user.character.data.data.attributes.CHA_CURR.value,
    },
    {
      stat: "aura",
      label: "Aura",
      field: game.user.character.data.data.attributes.AUR_CURR.value,
    },
    {
      stat: "thought",
      label: "Thought",
      field: game.user.character.data.data.attributes.THO_CURR.value,
    },
  ];
} catch (e) {
  //console.log("Not all stats are set in char sheet");
  alert("Not all stats are set in char sheet");
  throw "Not all stats are set in char sheet";
}

// Do not change beyond here //////////////////////////////////////////////////

// Build the buttons based on the weapons -------------------------------------
let btn = new Object();
let selectedStatName = "not set";

stats.forEach((stat) => BuildButton(stat));

function BuildButton(eachStat) {
  aspects = new Object();
  aspects["icon"] = "";
  aspects["label"] = eachStat["label"];
  aspects["callback"] = () => (selectedStatName = eachStat["stat"]);
  btn[eachStat.stat] = aspects;
  //console.log(btn);
}

// Display the dialog to pick the weapon --------------------------------------
let statChooser = new Dialog({
  title: "Stat Test",
  content: "<p>Pick a stat</p>",
  buttons: btn,
  default: stats[0]["stat"],
  render: (html) => {
    html.find(".dialog-button").css({ "flex-basis": "100px", "margin": "0 auto" })
  },
  close: (html) => SetSelectedStat(selectedStatName),
});
statChooser.render(true);

let selectedStat = undefined;

function SetSelectedStat(choice) {
  if ("not set" != choice) {
    selectedStat = stats.find((stat) => stat.stat === choice);
    //console.log(selectedStat);
    ChooseStatMethod();
  }
}

// Display the dialog to pick stat method -------------------------------------
let rollDie = "not set";

function ChooseStatMethod() {
  let d = new Dialog({
    title: `Checking ${selectedStat["label"]}!`,
    content: "<p>Normal roll, advantage, or disadvantage?</p>",
    buttons: {
      normal: {
        icon: "",
        label: "Normal",
        callback: () => (rollDie = "normal"),
      },
      advantage: {
        icon: "",
        label: "Advantage",
        callback: () => (rollDie = "Advantage"),
      },
      disadvantage: {
        icon: "",
        label: "Disadvantage",
        callback: () => (rollDie = "Disadvantage"),
      },
    },
    default: "normal",
    render: (html) => console.log("Rendering the attack method dialog"),
    close: (html) => ChooseRollType(rollDie),
  });
  d.render(true);
}

// Data for choosing the stacking depth of advantage or disadvantage
//  "roll" : The number of times to roll
//  "label" : The label to display
//  "die" : The die type to roll, important for things like initiative which are 1d6 instead of 1d20
// Stacking rolls
rollTypes = [
  {
    roll: "2",
    label: "2 die",
    die: "1d20",
  },
  {
    roll: "3",
    label: "3 die",
    die: "1d6",
  },
  {
    roll: "4",
    label: "4 die",
    die: "1d20",
  },
  {
    roll: "5",
    label: "5 die",
    die: "1d20",
  },
];
// This is the data for a normal, none adv/disadv roll
let rollTypesDefault = [
  {
    roll: "1",
    label: "1 die",
    die: "1d20",
  },
];
let btnRollTypes = new Object();
let selectedRollTypeName = "not set";
rollTypes.forEach((rollType) => BuildRollTypesButton(rollType));
function BuildRollTypesButton(eachRollType) {
  rollAspects = new Object();
  rollAspects["icon"] = "";
  rollAspects["label"] = eachRollType["label"];
  rollAspects["callback"] = () => (selectedRollTypeName = eachRollType["roll"]);
  btnRollTypes[eachRollType.roll] = rollAspects;
  //console.log(btn);
}
function ChooseRollType(attackMethod) {
  if ("not set" != attackMethod) {
    if ("normal" != attackMethod) {
      // Display the dialog to pick a roll type -------------------------------------
      let rollTypeChooser = new Dialog({
        title: "Choose Roll Type",
        content: "<p>Roll Stacking?</p>",
        buttons: btnRollTypes,
        default: rollTypes[0]["roll"],
        render: (html) => console.log("Rendering the roll type chooser dialog"),
        close: (html) =>
          SetSelectedRollType(selectedRollTypeName, attackMethod),
      });
      rollTypeChooser.render(true);
    } else {
      SetSelectedRollType("Normal", attackMethod);
    }
  }
}
let selectedRollType = undefined;
// Gets the details of the roll
function SetSelectedRollType(choice, attackMethod) {
  if ("not set" != choice) {
    selectedRollType = rollTypes.find((rollType) => rollType.roll === choice);
    console.log(selectedRollType);
    RollSomeDice(selectedRollType, attackMethod);
  }
}

function RollSomeDice(selectedRollData, rollingAs) {
  dieToRoll = undefined;
  depthToRoll = undefined;
  if (undefined == selectedRollData) {
    dieToRoll = rollTypesDefault[0]["die"];
    depthToRoll = parseInt(rollTypesDefault[0]["roll"]);
  } else {
    dieToRoll = selectedRollData["die"];
    depthToRoll = parseInt(selectedRollData["roll"]);
  }

  let abilityLabel = "not set";
  let ability = 0;

  if ("not set" != rollingAs) {
    // Setup stat based modifier
    try {
      abilityLabel = selectedStat["stat"];
      ability = selectedStat["field"];
      abilty = parseInt(ability);
    } catch (e) {
      console.log(
        `${selectedStat["label"]} is undefined or not a number in the char sheet`
      );
      ability = 0;
      abilityLabel = "none";
    }

    // Make sure ability isn't undefined
    if (undefined == ability) {
      console.log(`${selectedStat["label"]} is undefined in the char sheet`);
      ability = 0;
    }

    arrRawRolls = RollDice(dieToRoll, depthToRoll);
    isNat = CheckCritNat20(GetActualRoll(arrRawRolls, rollingAs));
    arrModifiedRolls = ModifyRolls(arrRawRolls, parseInt(ability));
    rollResult = GetActualRoll(arrModifiedRolls, rollingAs);
    rollResultString = FormatRolls(arrRawRolls, abilityLabel, ability);

    switch (rollingAs) {
      case "Advantage":
      case "Disadvantage":
      case "Normal":
      default:
        results_html = `<p>${abilityLabel}:${isNat}<br/><b>${rollResult}</b><br/>${rollResultString}`;
    }

    ChatMessage.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ token: actor }),
      content: results_html,
    });
  }
}

//Rolls dice
function RollDice(die, depth) {
  arrayRolls = [];
  for (i = 0; i < depth; i++) {
    // Note, I could not get the "reroll()" method to work, hence all the allocations
    roll = new Roll(die);
    roll.evaluate({ async: false });
    arrayRolls[i] = parseInt(roll.total);
  }
  console.log(`Rolling Dice ${die} ${depth}`);
  console.log(arrayRolls);
  return arrayRolls;
}
// Adds a single value to each roll
function ModifyRolls(arrRawRolls, ability) {
  arrayRolls = [];
  for (i = 0; i < arrRawRolls.length; i++) {
    arrayRolls[i] = arrRawRolls[i] + ability;
  }
  return arrayRolls;
}
// Gets the highest roll, defaults to normal
function GetActualRoll(arrRolls, advDisAdv) {
  valueFound = -1;
  switch (advDisAdv) {
    case "Advantage":
      valueFound = 1;
      for (i = 0; i < arrRolls.length; i++) {
        if (valueFound < arrayRolls[i]) valueFound = arrayRolls[i];
      }
      break;
    case "Disadvantage":
      valueFound = 20;
      for (i = 0; i < arrRolls.length; i++) {
        if (valueFound > arrayRolls[i]) valueFound = arrayRolls[i];
      }
      break;
    default:
      valueFound = arrRolls[0];
  }
  return valueFound;
}
// Formats the critical hit or fail output message
function CheckCritNat20(rollToCheck) {
  isNat = "";
  if (1 == rollToCheck) isNat = "<br/><b>CRIT FAIL!</b>";
  else if (20 == rollToCheck) isNat = "<br/><b>NAT 20!</b>";

  return isNat;
}
// Formats the "(Rolls: n, m, o...)" part of the output message
function FormatRolls(arrRollsToFormat, abilityName, abilityValue) {
  rollString = "No rolls found";
  if (0 != arrRollsToFormat.length) {
    if (1 == arrRollsToFormat.length) {
      rollString = `(Roll: ${arrRollsToFormat[0]} using ${abilityName} ${abilityValue})`;
    } else {
      rollString = `(Rolls:`;
      rollList = "";
      for (i = 0; i < arrRollsToFormat.length; i++) {
        rollList += ` ${arrRollsToFormat[i]},`;
      }
      // Trim that last comma
      rollList = rollList.substring(0, rollList.length - 1);
      rollString += `${rollList} using ${abilityName} ${abilityValue})`;
    }
  }
  return rollString;
}
