
local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent("npc_ems_coverup:sceneEvent")
AddEventHandler("npc_ems_coverup:sceneEvent", function(coords)
    local src = source
    local rng = math.random(1, 100)
    if rng <= 40 then -- 40% chance of coverup
        TriggerClientEvent("npc_ems_coverup:coverupScene", src, coords, "EMS")
    elseif rng <= 70 then -- 30% firefighter coverup
        TriggerClientEvent("npc_ems_coverup:coverupScene", src, coords, "Fire")
    else
        TriggerClientEvent("npc_ems_coverup:legitScene", src, coords)
    end
end)
