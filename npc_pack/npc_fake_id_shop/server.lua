
local QBCore = exports['qb-core']:GetCoreObject()

QBCore.Functions.CreateCallback("npc_fake_id_shop:getIDs", function(source, cb)
    cb(Config.FakeIDs)
end)
