
RegisterNetEvent("npc_stunt_challenge:rewardPlayer")
AddEventHandler("npc_stunt_challenge:rewardPlayer", function()
    local src = source
    local QBCore = exports['qb-core']:GetCoreObject()
    local Player = QBCore.Functions.GetPlayer(src)
    if Player then
        Player.Functions.AddMoney("cash", 1500, "stunt-reward")
    end
end)
