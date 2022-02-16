// Define your weapons
//
// "weapon" is not displayed but uniquely identifies the weapon with NO SPACES in the name
// "label" is the displayed name of the weapon and can have spaces
// "die" follows the <number>D<sides> format used in the roll command
// "stat" is either "strength" or "agility" - removing this entry or leaving blank will display "none" and also use zero as the modifier
// "damagetype" is something like "slashing" or "piercing" and is only used in the chat output
// "field" is the field on the PDF char sheet and maps to SEACAT stats as follows:
//    Strength is field: game.user.character.data.data.attributes.STR_CURR.value
//    Endurance is field: game.user.character.data.data.attributes.END_CURR.value
//    Agility is field: game.user.character.data.data.attributes.AGI_CURR.value
//    Charisma is field: game.user.character.data.data.attributes.CHA_CURR.value
//    Aura is field: game.user.character.data.data.attributes.AUR_CURR.value
//    Thought is field: game.user.character.data.data.attributes.THO_CURR.value
//

let weapons = undefined;
try
{
	// Change this section only -----------------------------------------------
	weapons = [
	{
		"weapon" : "CalvarySword",
		"label" : "Calvary Sword",
		"die" : "3d12",
		"stat" : "strength",
		"damagetype" : "slashing",
		"field" : game.user.character.data.data.attributes.STR_CURR.value
	},
	{
		"weapon" : "Dagger",
		"label" : "Dagger",
		"die" : "1d4",
		"stat" : "strength",
		"damagetype" : "slashing",
		"field" : game.user.character.data.data.attributes.STR_CURR.value
	},
	{
		"weapon" : "Bow",
		"label" : "Bow",
		"die" : "1d6",
		"stat" : "agility",
		"damagetype" : "piercing",
		"field" : game.user.character.data.data.attributes.AGI_CURR.value
	}
	]
	// Do not change beyond here //////////////////////////////////////////////
}
catch (e)
{
	//console.log("Not all stats are set in char sheet");
	alert("Not all stats are set in char sheet");
	throw "Not all stats are set in char sheet";
}

// Build the buttons based on the weapons -------------------------------------
let btn = new Object();
let selectedWeaponName = "not set";

weapons.forEach(weapon => BuildButton(weapon))

function BuildButton(eachWeapon)
{
	aspects = new Object();
	aspects["icon"] = '';
	aspects["label"] = eachWeapon["label"];
	aspects["callback"] = () => selectedWeaponName = eachWeapon["weapon"];
	btn[eachWeapon.weapon] = aspects;
	//console.log(btn);
}

// Display the dialog to pick the weapon --------------------------------------
let weaponChooser = new Dialog({
	title: "Choose Weapon",
	content: "<p>Pick a weapon</p>",
	buttons: btn,
	default: weapons[0]["weapon"],
	render: html => console.log("Rendering the weapon chooser dialog"),
 close: html => SetSelectedWeapon(selectedWeaponName) 
});
weaponChooser.render(true);

let selectedWeapon = undefined;

function SetSelectedWeapon(choice)
{
	if ("not set" != choice)
	{
		selectedWeapon = weapons.find(weapon => weapon.weapon === choice);
		//console.log(selectedWeapon);
		ChooseAttackMethod();
	}
}

// Display the dialog to pick how you're attacking ----------------------------
let rollDie = "not set";

function ChooseAttackMethod()
{
let d = new Dialog({
	title: `Attack with ${selectedWeapon["label"]}!`,
	content: "<p>Normal roll, advantage, or disadvantage?</p>",
	buttons: {
		normal: {
			icon: '',
			label: "Normal",
			callback: () => rollDie = "normal"
		},
		advantage: {
			icon: '',
			label: "Advantage",
			callback: () => rollDie = "Advantage"
		},
		disadvantage: {
			icon: '',
			label: "Disadvantage",
			callback: () => rollDie = "Disadvantage"
		}
	},
	default: "normal",
	render: html => console.log("Rendering the attack method dialog"),
	close: html => ChooseRollType(rollDie)
});
d.render(true);
}

// Data for choosing the stacking depth of advantage or disadvantage
//	"roll" : The number of times to roll
//	"label" : The label to display
//	"die" : The die type to roll, important for things like initiative which are 1d6 instead of 1d20
// Stacking rolls
rollTypes = [
{
	"roll" : "2",
	"label" : "2 die",
	"die" : "1d20"
},
{
	"roll" : "3",
	"label" : "3 die",
	"die" : "1d20"
},
{
	"roll" : "4",
	"label" : "4 die",
	"die" : "1d20"
},
{
	"roll" : "5",
	"label" : "5 die",
	"die" : "1d20"
}
]
// This is the data for a normal, none adv/disadv roll
let rollTypesDefault = [
{
	"roll" : "1",
	"label" : "1 die",
	"die" : "1d20"
}
]

let btnRollTypes = new Object();
let selectedRollTypeName = "not set";

rollTypes.forEach(rollType => BuildRollTypesButton(rollType))

function BuildRollTypesButton(eachRollType)
{
	rollAspects = new Object();
	rollAspects["icon"] = '';
	rollAspects["label"] = eachRollType["label"];
	rollAspects["callback"] = () => selectedRollTypeName = eachRollType["roll"];
	btnRollTypes[eachRollType.roll] = rollAspects;
	//console.log(btn);
}

function ChooseRollType(attackMethod)
{
	if("normal" != attackMethod)
	{
		// Display the dialog to pick a roll type -------------------------------------
		let rollTypeChooser = new Dialog({
			title: "Choose Roll Type",
			content: "<p>Roll Stacking?</p>",
			buttons: btnRollTypes,
			default: rollTypes[0]["roll"],
			render: html => console.log("Rendering the roll type chooser dialog"),
		 close: html => SetSelectedRollType(selectedRollTypeName, attackMethod) 
		});
		rollTypeChooser.render(true);
	}
	else
	{
		SetSelectedRollType("Normal", attackMethod)
	}
}

let selectedRollType = undefined;

// Gets the details of the roll
function SetSelectedRollType(choice, attackMethod)
{
	if ("not set" != choice)
	{
		selectedRollType = rollTypes.find(rollType => rollType.roll === choice);
		console.log(selectedRollType);
		RollSomeDice(selectedRollType, attackMethod);
	}
}
// Last step after all user input
function RollSomeDice(selectedRollData, rollingAs)
{
	dieToRoll = undefined;
	depthToRoll = undefined;
	if(undefined == selectedRollData)
	{
		dieToRoll = rollTypesDefault[0]["die"];
		depthToRoll = parseInt(rollTypesDefault[0]["roll"]);
	}
	else
	{
		dieToRoll = selectedRollData["die"];
		depthToRoll = parseInt(selectedRollData["roll"]);
	}

	if ("not set" != rollingAs)
	{
		// Setup stat based modifier
		let ability = 0;
		let abilityLabel = "none";
		
		try
		{
			abilityLabel = selectedWeapon["stat"];
			ability = selectedWeapon["field"];
			abilty = parseInt(ability);
		}
		catch (e)
		{
			console.log(`${selectedWeapon["label"]} is undefined or not a number in the char sheet`);
			ability = 0;
			abilityLabel = "none";
		}
		
		// Make sure ability isn't undefined
		if (undefined == ability)
		{
			console.log(`${selectedWeapon["label"]} is undefined in the char sheet`);
			ability = 0;
		}
		
		// Rolling, rolling, rolling
		arrRawRolls = RollDice(dieToRoll, depthToRoll);
		isNat = CheckCritNat20(GetActualRoll(arrRawRolls, rollingAs));
		arrModifiedRolls = ModifyRolls(arrRawRolls, parseInt(ability));
		rollResult = GetActualRoll(arrModifiedRolls, rollingAs);
		rollResultString = FormatRolls(arrRawRolls, abilityLabel, ability);
		
		let rollDamage = new Roll(selectedWeapon["die"]);
		rollDamage.evaluate({async: false});
		let damageAmountRaw = parseInt(rollDamage.total);
		let damageAmount = damageAmountRaw + parseInt(ability);
		let damageRolls = [];
		rollDamage.dice[0].results.forEach(die => damageRolls.push(die.result));
		rollDamageString = FormatRolls(damageRolls, abilityLabel, ability);

		switch (rollingAs)
		{
		  case "Advantage":
		  case "Disadvantage":
			results_html = `<p>${selectedWeapon["label"]} at ${rollingAs}:${isNat}<br/><b>${rollResult}</b> to hit ${rollResultString}<br/><b>${damageAmount}</b> ${selectedWeapon["damagetype"]} damage ${rollDamageString} (${selectedWeapon["die"]})</p>`;
			break;  

		  case "Normal":
		  default:
			results_html = `<p>${selectedWeapon["label"]}:${isNat}<br/><b>${rollResult}</b> to hit ${rollResultString}<br/><b>${damageAmount} </b> ${selectedWeapon["damagetype"]} damage ${rollDamageString} (${selectedWeapon["die"]})</p>`;
		}

		ChatMessage.create({
			user: game.user._id,
			speaker: ChatMessage.getSpeaker({token: actor}),
			content: results_html
		});
	}
}
//Rolls dice
function RollDice(die, depth)
{
	arrayRolls = [];
	for(i = 0; i < depth; i++)
	{
		// Note, I could not get the "reroll()" method to work, hence all the allocations
		roll = new Roll(die);
		roll.evaluate({async: false});
		arrayRolls[i] = parseInt(roll.total);
	}
	console.log(`Rolling Dice ${die} ${depth}`);
	console.log(arrayRolls);
	return arrayRolls;
}
// Adds a single value to each roll
function ModifyRolls(arrRawRolls, ability)
{
	arrayRolls = [];
	for(i = 0; i < arrRawRolls.length; i++)
	{
		arrayRolls[i] = arrRawRolls[i] + ability;
	}
	return arrayRolls;
}
// Gets the highest roll, defaults to normal 
function GetActualRoll(arrRolls, advDisAdv)
{
	valueFound = -1;
	switch (advDisAdv)
	{
		case "Advantage":
			valueFound = 1;
			for(i = 0; i < arrRolls.length; i++)
			{
				if (valueFound < arrayRolls[i]) valueFound = arrayRolls[i];
			}
			break;
		case "Disadvantage":
			valueFound = 20;
			for(i = 0; i < arrRolls.length; i++)
			{
				if (valueFound > arrayRolls[i]) valueFound = arrayRolls[i];
			}
			break;
		default:
			valueFound = arrRolls[0];
	}
	return valueFound;
}
// Formats the critical hit or fail output message
function CheckCritNat20(rollToCheck)
{
	isNat = "";
	if (1 == rollToCheck) isNat = "<br/><b>CRIT FAIL!</b>";
	else if (20 == rollToCheck) isNat = "<br/><b>NAT 20!</b>";
	
	return isNat;
}
// Formats the "(Rolls: n, m, o...)" part of the output message
function FormatRolls(arrRollsToFormat, abilityName, abilityValue)
{
	rollString = "No rolls found";
	if (0 != arrRollsToFormat.length)
	{
		if (1 == arrRollsToFormat.length)
		{
			rollString = `(Roll: ${arrRollsToFormat[0]} using ${abilityName} ${abilityValue})`;
		}
		else
		{
			rollString = `(Rolls:`;
			rollList = "";
			for(i = 0; i < arrRollsToFormat.length; i++)
			{
				rollList += ` ${arrRollsToFormat[i]},`;
			}
			// Trim that last comma
			rollList = rollList.substring(0, rollList.length-1);
			rollString += `${rollList} using ${abilityName} ${abilityValue})`;
		}
	}
	return rollString;
}