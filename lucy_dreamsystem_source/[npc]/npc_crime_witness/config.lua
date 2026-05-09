
Config = {}

Config.ReportChance = 50 -- 50% chance an NPC will report crime
Config.WitnessRadius = 25.0 -- Range for NPCs to detect crime
Config.AlertDelay = 3000 -- Time in ms before alert is sent

-- Types of crimes that will trigger a witness call
Config.WatchedEvents = {
    "player_shooting",
    "player_melee",
    "player_vehicle_theft"
}
