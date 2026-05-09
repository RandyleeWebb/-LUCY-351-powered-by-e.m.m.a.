
local QBCore = exports['qb-core']:GetCoreObject()

QBCore.Functions.CreateCallback("npc_blackmarket:getItems", function(source, cb)
    cb(Config.Items)
end)
