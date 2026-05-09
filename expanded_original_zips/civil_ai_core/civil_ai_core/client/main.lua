local ownedPeds = {}  -- netId → true

-- Register locally when spawning (called from subsystems)
RegisterNetEvent('civil:ai:spawned', function(netId, system)
    ownedPeds[netId] = system
    TriggerServerEvent('civil:ai:register', system, netId)
end)

-- Cleanup only our AI
RegisterNetEvent('civil:ai:cleanup', function()
    for netId, system in pairs(ownedPeds) do
        local ped = NetworkGetEntityFromNetworkId(netId)
        if DoesEntityExist(ped) and (IsPedDeadOrDying(ped) or not IsEntityAMissionEntity(ped)) then
            DeleteEntity(ped)
            ownedPeds[netId] = nil
            TriggerServerEvent('civil:ai:unregister', system, netId)
        end
    end
    if Config.Debug then print("[AI MANAGER] Local cleanup complete") end
end)