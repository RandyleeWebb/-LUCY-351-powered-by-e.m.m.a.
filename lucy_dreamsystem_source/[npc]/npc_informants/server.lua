
local QBCore = exports['qb-core']:GetCoreObject()

RegisterNetEvent("npc_informants:checkNearby")
AddEventHandler("npc_informants:checkNearby", function(playerCoords)
    local src = source
    local shouldSnitch = math.random(1, 100) <= 20 -- 20% chance
    if shouldSnitch then
        local ped = CreatePed(4, `a_m_m_business_01`, playerCoords.x + 5.0, playerCoords.y + 5.0, playerCoords.z, 0.0, false, true)
        local netId = NetworkGetNetworkIdFromEntity(ped)
        TriggerClientEvent("npc_informants:snitchWarning", src, netId)
        Citizen.Wait(5000)
        TriggerClientEvent("police:client:callBackup", src, playerCoords)
    end
end)
