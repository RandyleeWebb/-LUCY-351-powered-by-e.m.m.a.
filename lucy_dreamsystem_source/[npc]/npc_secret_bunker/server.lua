
local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent("npc_secret_bunker:checkAccess")
AddEventHandler("npc_secret_bunker:checkAccess", function()
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    local item = Player.Functions.GetItemByName(Config.AccessItem)

    if item then
        TriggerClientEvent("npc_secret_bunker:teleport", src)
    else
        TriggerClientEvent("QBCore:Notify", src, "You need a special ID to enter!", "error")
    end
end)
