export const statName = stringInput('input[name="attr_character_name"]');
export const statClass = stringInput('select[name="attr_class"]');
export const statSubClass = stringInput('input[name="attr_subclass"]');
export const statLevel = numericInput('input[name="attr_level"]');
export const statRace = stringInput('input[name="attr_race"]');
export const statAlignment = stringInput('input[name="attr_alignment"]');
export const statMaxHp = numericInput('input[name="attr_hp_max"]');
export const statHp = numericInput('input[name="attr_hp"]');
export const statTempHp = numericInput('input[name="attr_hp_temp"]');
export const statBackground = stringInput('input[name="attr_background"]');
export const statStrength = numericInput('input[name="attr_strength"]');
export const statStrengthMod = numericInput('input[name="attr_strength_mod"]');
export const statDexterity = numericInput('input[name="attr_dexterity"]');
export const statDexterityMod = numericInput(
  'input[name="attr_dexterity_mod"]'
);
export const statConstitution = numericInput('input[name="attr_constitution"]');
export const statConstitutionMod = numericInput(
  'input[name="attr_constitution_mod"]'
);
export const statIntelligence = numericInput('input[name="attr_intelligence"]');
export const statIntelligenceMod = numericInput(
  'input[name="attr_intelligence_mod"]'
);
export const statWisdom = numericInput('input[name="attr_wisdom"]');
export const statWisdomMod = numericInput('input[name="attr_wisdom_mod"]');
export const statCharisma = numericInput('input[name="attr_charisma"]');
export const statCharismaMod = numericInput('input[name="attr_charisma_mod"]');
export const statArmorClass = numericInput('input[name="attr_ac"]');
export const statImageUrl = (() => {
  const getElement = () => document.getElementById('avatar') as HTMLDivElement;
  const getValue = () => {
    const elem = getElement();
    return elem && elem.dataset.fullsizeurl;
  };
  return { getValue, getElement };
})();

/*
 * Helpers
 */
function stringInput(selector: string) {
  const getElement = () => document.querySelector(selector) as HTMLInputElement;
  const getValue = () => {
    const elem = getElement();
    if (!elem) return;
    return elem.value;
  };

  return { getValue, getElement };
}

function numericInput(selector: string) {
  const getElement = () => document.querySelector(selector) as HTMLInputElement;
  const getValue = () => {
    const elem = getElement();
    if (!elem) return;
    return Number(elem.value);
  };

  return { getValue, getElement };
}
