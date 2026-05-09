
local QBCore = exports['qb-core']:GetCoreObject()

QBCore.Functions.CreateCallback("npc_petshop:getPets", function(source, cb)
    cb(Config.Pets)
end)
