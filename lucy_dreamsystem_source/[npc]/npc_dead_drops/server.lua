
local QBCore = exports['qb-core']:GetCoreObject()
local lastDropTime = 0
local currentDrop = nil

RegisterNetEvent("npc_dead_drops:requestDrop")
AddEventHandler("npc_dead_drops:requestDrop", function()
    local src = source
    if os.time() - lastDropTime < Config.DropCooldown then return end

    lastDropTime = os.time()
    local drop = Config.DeadDropLocations[math.random(#Config.DeadDropLocations)]
    currentDrop = drop
    TriggerClientEvent("npc_dead_drops:spawnDrop", -1, drop)
end)

RegisterNetEvent("npc_dead_drops:pickup")
AddEventHandler("npc_dead_drops:pickup", function()
    local src = source
    TriggerClientEvent("npc_dead_drops:notifyHunt", src)
    TriggerClientEvent("chat:addMessage", src, {
        args = {"Drop", "You've grabbed the bag — expect trouble soon."}
    })
end)
