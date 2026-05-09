
local lastCrimeTime = 0

CreateThread(function()
    while true do
        Wait(5000)
        local ped = PlayerPedId()

        if IsPedShooting(ped) then
            TryWitnessReport("player_shooting")
        elseif IsPedInMeleeCombat(ped) then
            TryWitnessReport("player_melee")
        elseif IsPedTryingToEnterALockedVehicle(ped) then
            TryWitnessReport("player_vehicle_theft")
        end
    end
end)

function TryWitnessReport(crimeType)
    local playerCoords = GetEntityCoords(PlayerPedId())
    local reported = false

    for npc in EnumeratePeds() do
        if npc ~= PlayerPedId() and not IsPedAPlayer(npc) and not IsPedDeadOrDying(npc, true) then
            local npcCoords = GetEntityCoords(npc)
            local dist = #(playerCoords - npcCoords)

            if dist < Config.WitnessRadius and math.random(100) <= Config.ReportChance then
                TaskLookAtEntity(npc, PlayerPedId(), 5000, 2048, 3)
                TaskGoToCoordAnyMeans(npc, npcCoords + vec3(2,2,0), 1.0, 0, 0, 786603, 0xbf800000)
                Wait(Config.AlertDelay)
                TriggerEvent("chat:addMessage", {
                    args = {"911 Call", "^1NPC Witness reported suspicious activity to police."}
                })
                TriggerServerEvent("npc_crime_witness:dispatchAlert", crimeType, playerCoords)
                reported = true
                break
            end
        end
    end
end

-- Ped enumerator helper
function EnumeratePeds()
    return coroutine.wrap(function()
        local handle, ped = FindFirstPed()
        if not handle or handle == -1 then return end
        local success
        repeat
            coroutine.yield(ped)
            success, ped = FindNextPed(handle)
        until not success
        EndFindPed(handle)
    end)
end
