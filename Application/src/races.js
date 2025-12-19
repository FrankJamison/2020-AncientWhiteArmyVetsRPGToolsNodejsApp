/* Racial characteristics */

var character = {
    // Character Baseline
    Race: "",
    AdultAge: 0,
    MaxAge: 0,
    BaseHeight: 0,
    HeightModifier: "",
    BaseWeight: 0,
    WeightModifier: "",

    // Calculated Race Characteristics
    MiddleAge: 0,
    OldAge: 0,
    VenerableAge: 0,
    MinHeight: 0,
    MaxHeight: 0,
    MinWeight: 0,
    MaxWeight: 0,
    HeightModRoll: 0,

    // Calculated Character Characteristics
    Age: 0,
    Height: 0,
    Weight: 0
}

var aaracokra = {
    Race: "Aarakocra",
    AdultAge: 3,
    MaxAge: 30,
    BaseHeight: 55,
    HeightModifier: "2d4",
    BaseWeight: 75,
    WeightModifier: "1d4"
}

var aasimar = {
    Race: "Aasimar",
    AdultAge: 15,
    MaxAge: 160,
    BaseHeight: 56,
    HeightModifier: "2d10",
    BaseWeight: 110,
    WeightModifier: "2d4"
}

var bugbear = {
    Race: "Bugbear",
    AdultAge: 16,
    MaxAge: 80,
    BaseHeight: 72,
    HeightModifier: "2d12",
    BaseWeight: 200,
    WeightModifier: "2d6"
}

var centaur = {
    Race: "Centaur",
    AdultAge: 15,
    MaxAge: 90,
    BaseHeight: 69,
    HeightModifier: "2d8",
    BaseWeight: 1160,
    WeightModifier: "2d4"
}

var changeling = {
    Race: "Changeling",
    AdultAge: 13,
    MaxAge: 90,
    BaseHeight: 61,
    HeightModifier: "2d4",
    BaseWeight: 115,
    WeightModifier: "2d4"
}

var dragonborn = {
    Race: "Dragonborn",
    AdultAge: 15,
    MaxAge: 80,
    BaseHeight: 66,
    HeightModifier: "2d8",
    BaseWeight: 175,
    WeightModifier: "2d6"
}

var dwarf_gray = {
    Race: "Dwarf, Gray (Duergar)",
    AdultAge: 15,
    MaxAge: 350,
    BaseHeight: 44,
    HeightModifier: "2d4",
    BaseWeight: 135,
    WeightModifier: "2d4"
}

var dwarf_hill = {
    Race: "Dwarf, Hill",
    AdultAge: 15,
    MaxAge: 350,
    BaseHeight: 44,
    HeightModifier: "2d4",
    BaseWeight: 115,
    WeightModifier: "2d6"
}

var dwarf_warding = {
    Race: "Dwarf, Mark of Warding",
    AdultAge: 15,
    MaxAge: 350,
    BaseHeight: 46,
    HeightModifier: "2d4",
    BaseWeight: 125,
    WeightModifier: "2d6"
}

var dwarf_mountain = {
    Race: "Dwarf, Mountain",
    AdultAge: 15,
    MaxAge: 350,
    BaseHeight: 48,
    HeightModifier: "2d4",
    BaseWeight: 130,
    WeightModifier: "2d6"
}

var elf_dark = {
    Race: "Elf, Dark (Drow)",
    AdultAge: 15,
    MaxAge: 750,
    BaseHeight: 53,
    HeightModifier: "2d6",
    BaseWeight: 75,
    WeightModifier: "1d6"
}

var elf_eladrin = {
    Race: "Elf, Eladrin",
    AdultAge: 15,
    MaxAge: 750,
    BaseHeight: 54,
    HeightModifier: "2d12",
    BaseWeight: 90,
    WeightModifier: "1d4"
}

var elf_high = {
    Race: "Elf, High",
    AdultAge: 15,
    MaxAge: 750,
    BaseHeight: 54,
    HeightModifier: "2d10",
    BaseWeight: 90,
    WeightModifier: "1d4"
}

var elf_sea = {
    Race: "Elf, Sea",
    AdultAge: 15,
    MaxAge: 750,
    BaseHeight: 54,
    HeightModifier: "2d8",
    BaseWeight: 90,
    WeightModifier: "1d4"
}

var elf_shadar_kai = {
    Race: "Elf, Shadar-kai",
    AdultAge: 15,
    MaxAge: 750,
    BaseHeight: 56,
    HeightModifier: "2d8",
    BaseWeight: 90,
    WeightModifier: "1d4"
}

var elf_wood = {
    Race: "Elf, Wood",
    AdultAge: 15,
    MaxAge: 750,
    BaseHeight: 54,
    HeightModifier: "2d10",
    BaseWeight: 100,
    WeightModifier: "1d4"
}

var firbolg = {
    Race: "Firbolg",
    AdultAge: 30,
    MaxAge: 500,
    BaseHeight: 74,
    HeightModifier: "2d12",
    BaseWeight: 175,
    WeightModifier: "2d6"
}

var genasi_air = {
    Race: "Genasi, Air",
    AdultAge: 15,
    MaxAge: 120,
    BaseHeight: 56,
    HeightModifier: "2d10",
    BaseWeight: 105,
    WeightModifier: "1d6"
}

var genasi_earth = {
    Race: "Genasi, Earth",
    AdultAge: 15,
    MaxAge: 120,
    BaseHeight: 56,
    HeightModifier: "2d10",
    BaseWeight: 105,
    WeightModifier: "2d6"
}

var genasi_fire = {
    Race: "Genasi, Fire",
    AdultAge: 15,
    MaxAge: 120,
    BaseHeight: 56,
    HeightModifier: "2d12",
    BaseWeight: 105,
    WeightModifier: "2d4"
}

var genasi_water = {
    Race: "Genasi, Water",
    AdultAge: 15,
    MaxAge: 120,
    BaseHeight: 56,
    HeightModifier: "2d8",
    BaseWeight: 105,
    WeightModifier: "2d4"
}

var gith_githyanki = {
    Race: "Gith, Githyanki",
    AdultAge: 15,
    MaxAge: 100,
    BaseHeight: 60,
    HeightModifier: "2d12",
    BaseWeight: 100,
    WeightModifier: "2d4"
}

var gith_githzerai = {
    Race: "Gith, Githzerai",
    AdultAge: 15,
    MaxAge: 100,
    BaseHeight: 59,
    HeightModifier: "2d12",
    BaseWeight: 90,
    WeightModifier: "1d4"
}

var gnome_deep = {
    Race: "Gnome, Deep (Svirfneblin)",
    AdultAge: 25,
    MaxAge: 250,
    BaseHeight: 34,
    HeightModifier: "2d4",
    BaseWeight: 75,
    WeightModifier: "1d6"
}

var gnome = {
    Race: "Gnome",
    AdultAge: 25,
    MaxAge: 250,
    BaseHeight: 35,
    HeightModifier: "2d4",
    BaseWeight: 35,
    WeightModifier: "1d1"
}

var goblin = {
    Race: "Goblin",
    AdultAge: 8,
    MaxAge: 60,
    BaseHeight: 35,
    HeightModifier: "2d6",
    BaseWeight: 35,
    WeightModifier: "1d4"
}

var goliath = {
    Race: "Goliath",
    AdultAge: 15,
    MaxAge: 90,
    BaseHeight: 81,
    HeightModifier: "2d8",
    BaseWeight: 280,
    WeightModifier: "1d4"
}

var half_elf = {
    Race: "Half-Elf",
    AdultAge: 20,
    MaxAge: 180,
    BaseHeight: 57,
    HeightModifier: "2d8",
    BaseWeight: 90,
    WeightModifier: "1d6"
}

var halfling = {
    Race: "Halfling",
    AdultAge: 20,
    MaxAge: 150,
    BaseHeight: 31,
    HeightModifier: "2d4",
    BaseWeight: 35,
    WeightModifier: "1d1"
}

var half_orc = {
    Race: "Half-Orc",
    AdultAge: 14,
    MaxAge: 75,
    BaseHeight: 58,
    HeightModifier: "2d10",
    BaseWeight: 200,
    WeightModifier: "2d6"
}

var hobgoblin = {
    Race: "Hobgoblin",
    AdultAge: 15,
    MaxAge: 90,
    BaseHeight: 58,
    HeightModifier: "2d8",
    BaseWeight: 145,
    WeightModifier: "1d4"
}

var human = {
    Race: "Human",
    AdultAge: 15,
    MaxAge: 90,
    BaseHeight: 56,
    HeightModifier: "2d10",
    BaseWeight: 110,
    WeightModifier: "2d4"
}

var kalashtar = {
    Race: "Kalashtar",
    AdultAge: 15,
    MaxAge: 90,
    BaseHeight: 64,
    HeightModifier: "2d6",
    BaseWeight: 110,
    WeightModifier: "1d6"
}

var kenku = {
    Race: "Kenku",
    AdultAge: 12,
    MaxAge: 60,
    BaseHeight: 56,
    HeightModifier: "2d4",
    BaseWeight: 90,
    WeightModifier: "1d4"
}

var kobold = {
    Race: "Kobold",
    AdultAge: 6,
    MaxAge: 120,
    BaseHeight: 22,
    HeightModifier: "2d8",
    BaseWeight: 20,
    WeightModifier: "1d1"
}

var lizardfolk = {
    Race: "Lizardfolk",
    AdultAge: 14,
    MaxAge: 60,
    BaseHeight: 57,
    HeightModifier: "2d10",
    BaseWeight: 120,
    WeightModifier: "2d6"
}

var locathah = {
    Race: "Locathah",
    AdultAge: 10,
    MaxAge: 80,
    BaseHeight: 57,
    HeightModifier: "2d8",
    BaseWeight: 105,
    WeightModifier: "2d4"
}

var loxodon = {
    Race: "Lizardfolk",
    AdultAge: 15,
    MaxAge: 450,
    BaseHeight: 81,
    HeightModifier: "2d8",
    BaseWeight: 295,
    WeightModifier: "2d4"
}

var minotaur = {
    Race: "Minotaur",
    AdultAge: 17,
    MaxAge: 150,
    BaseHeight: 69,
    HeightModifier: "2d8",
    BaseWeight: 255,
    WeightModifier: "2d4"
}

var orc = {
    Race: "Orc",
    AdultAge: 12,
    MaxAge: 50,
    BaseHeight: 64,
    HeightModifier: "2d8",
    BaseWeight: 175,
    WeightModifier: "2d6"
}

var shifter = {
    Race: "Shifter",
    AdultAge: 10,
    MaxAge: 70,
    BaseHeight: 54,
    HeightModifier: "2d8",
    BaseWeight: 90,
    WeightModifier: "2d4"
}

var simic_hybrid_elf = {
    Race: "Simic Hybrid Elf",
    AdultAge: 15,
    MaxAge: 600,
    BaseHeight: 54,
    HeightModifier: "2d10",
    BaseWeight: 100,
    WeightModifier: "1d4"
}

var simic_hybrid_human = {
    Race: "Simic Hybrid Human",
    AdultAge: 15,
    MaxAge: 75,
    BaseHeight: 56,
    HeightModifier: "2d10",
    BaseWeight: 110,
    WeightModifier: "2d4"
}

var simic_hybrid_vedalken = {
    Race: "Simic Hybrid Vedalken",
    AdultAge: 40,
    MaxAge: 350,
    BaseHeight: 70,
    HeightModifier: "2d4",
    BaseWeight: 100,
    WeightModifier: "2d6"
}

var tabaxi = {
    Race: "Tabaxi",
    AdultAge: 15,
    MaxAge: 90,
    BaseHeight: 58,
    HeightModifier: "2d10",
    BaseWeight: 90,
    WeightModifier: "2d4"
}

var tiefling = {
    Race: "Tiefling",
    AdultAge: 15,
    MaxAge: 100,
    BaseHeight: 56,
    HeightModifier: "2d10",
    BaseWeight: 110,
    WeightModifier: "2d4"
}

var tortle = {
    Race: "Tortle",
    AdultAge: 15,
    MaxAge: 50,
    BaseHeight: 57,
    HeightModifier: "2d8",
    BaseWeight: 385,
    WeightModifier: "2d6"
}

var triton = {
    Race: "Triton",
    AdultAge: 15,
    MaxAge: 200,
    BaseHeight: 49,
    HeightModifier: "2d10",
    BaseWeight: 90,
    WeightModifier: "2d4"
}

var vedalken = {
    Race: "Vedalken",
    AdultAge: 40,
    MaxAge: 350,
    BaseHeight: 70,
    HeightModifier: "2d4",
    BaseWeight: 100,
    WeightModifier: "2d6"
}

var verdan_small = {
    Race: "Verdan (Small)",
    AdultAge: 24,
    MaxAge: 200,
    BaseHeight: 35,
    HeightModifier: "2d6",
    BaseWeight: 35,
    WeightModifier: "1d4"
}

var verdan_medium = {
    Race: "Verdan (Medium)",
    AdultAge: 24,
    MaxAge: 200,
    BaseHeight: 59,
    HeightModifier: "2d6",
    BaseWeight: 70,
    WeightModifier: "1d4"
}

var warforged = {
    Race: "Warforged",
    AdultAge: 2,
    MaxAge: 112,
    BaseHeight: 70,
    HeightModifier: "2d6",
    BaseWeight: 270,
    WeightModifier: "4d1"
}

var warforged_juggernaut = {
    Race: "Warforged, Juggernaut",
    AdultAge: 2,
    MaxAge: 112,
    BaseHeight: 69,
    HeightModifier: "2d8",
    BaseWeight: 300,
    WeightModifier: "1d10"
}

var yuan_ti_pureblood = {
    Race: "Yuan-ti Pureblood",
    AdultAge: 15,
    MaxAge: 90,
    BaseHeight: 56,
    HeightModifier: "2d10",
    BaseWeight: 110,
    WeightModifier: "2d4"
}