local QBCore = exports['qb-core']:GetCoreObject()

function GetLoyalty(Player, gang)
    return Player.PlayerData.metadata[gang .. "_loyalty"] or Config.DefaultLoyalty
end

function AdjustLoyalty(Player, gang, amount)
    local key = gang .. "_loyalty"
    local current = Player.PlayerData.metadata[key] or Config.DefaultLoyalty
    local newVal = math.max(0, math.min(100, current + amount))

    Player.Functions.SetMetaData(key, newVal)
end

RegisterNetEvent("npc_gang_loyalty:adjust")
AddEventHandler("npc_gang_loyalty:adjust", function(gang, amount)
    local src = source
    local Player = QBCore.Functions.GetPlayer(src)
    if not Player then return end
    AdjustLoyalty(Player, gang, amount)
end)

QBCore.Functions.CreateCallback("npc_gang_loyalty:get", function(source, cb, gang)
    local Player = QBCore.Functions.GetPlayer(source)
    if not Player then return cb(0) end
    cb(GetLoyalty(Player, gang))
end)
