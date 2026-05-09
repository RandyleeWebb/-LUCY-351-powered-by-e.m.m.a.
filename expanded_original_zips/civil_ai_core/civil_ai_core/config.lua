Config = {}

-------------------------------------------------
-- DEBUG
-------------------------------------------------
Config.Debug = true
Config.DebugPrint = function(msg)
    if Config.Debug then print(('[AI DEBUG] %s'):format(msg)) end
end

-------------------------------------------------
-- POLICE AI SETTINGS
-------------------------------------------------
Config.PoliceAI = {
    Enabled = true,
    SpawnDistance = 180.0,
    MaxUnits = 6,
    BackupChance = 0.4,
    ArrestChance = 0.5,
    HeatMultiplier = 1.5,
    DespawnTime = 120000,
    HeatEscalation = {
        [1] = {min = 0, max = 25, models = {"s_m_y_cop_01"}, weapons = {"WEAPON_PISTOL"}, vehicles = {"POLICE"}},
        [2] = {min = 26, max = 50, models = {"s_m_y_hwaycop_01"}, weapons = {"WEAPON_PISTOL_MK2"}, vehicles = {"POLICE2"}},
        [3] = {min = 51, max = 75, models = {"s_m_y_swat_01"}, weapons = {"WEAPON_CARBINERIFLE"}, vehicles = {"POLICE3","FBI"}},
        [4] = {min = 76, max = 100, models = {"s_m_y_blackops_01","s_m_y_blackops_02","s_m_m_fibsec_01"}, weapons = {"WEAPON_SPECIALCARBINE"}, vehicles = {"FBI2","RIOT"}},
    }
}

-------------------------------------------------
-- EMS AI SETTINGS
-------------------------------------------------
Config.EMSAI = {
    Enabled = true,
    SpawnDistance = 150.0,
    MaxUnits = 3,
    ReviveChance = 0.8,
    Vehicles = {"AMBULANCE","FIRETRUK"},
    HealTime = 6000,
}

-------------------------------------------------
-- CIVILIAN DISPATCHER
-------------------------------------------------
Config.CivilianDispatcher = {
    Enabled = true,
    DetectionRadius = 80.0,
    ReportChance = 0.35,
    PanicChance = 0.25,
    Cooldown = 30000,
}

-------------------------------------------------
-- TACTICAL SETTINGS
-------------------------------------------------
Config.Tactics = {
    RoadblockChance = 0.25,
    AirSupportHeat = 80,
    AirSupportModel = "POLMAV",
    RoadblockVehicles = {"POLICE4","RIOT"},
    RoadblockObjects = {"prop_barrier_work05","prop_roadcone02b"},
}
