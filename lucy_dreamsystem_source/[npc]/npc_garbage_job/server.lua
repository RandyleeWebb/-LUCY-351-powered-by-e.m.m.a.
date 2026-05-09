
local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent("npc_garbage_job:getStart")
AddEventHandler("npc_garbage_job:getStart", function()
    TriggerClientEvent("npc_garbage_job:startRoute", source)
end)
